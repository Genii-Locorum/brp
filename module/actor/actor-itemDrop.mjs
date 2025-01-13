import {BRPSelectLists} from '../apps/select-lists.mjs'
import { SkillsSelectDialog } from "../apps/skill-selection.mjs"
import { BRPUtilities } from '../apps/utilities.mjs';

export class BRPactorItemDrop {

  // Change default on Drop Item Create routine for requirements (single items and folder drop)-----------------------------------------------------------------
  static async _BRPonDropItemCreate(actor,itemData) {
    const newItemData = [];
    itemData = itemData instanceof Array ? itemData : [itemData];
    //TODO: Consider adding a bypass to just create the items with no checks
    //      return actor.createEmbeddedDocuments("Item", itemData);
    for (let nItm of itemData) {
      let reqResult = 1;
      let errMsg = "";

      //Automatically allow gear to be added
    if (nItm.type != 'gear') {   


      //Don't allow the following items to be dropped directly on a character sheet
      if(['powerMod'].includes(nItm.type)) {
        reqResult = 0;
        errMsg = game.i18n.localize('BRP.'+nItm.type) +"("+nItm.name + "): " +   game.i18n.localize('BRP.noDirectDrop');     
      }


      //When dropping armour check against using HPL and HPL compatabaility
    if (nItm.type === 'armour') {
      if (game.settings.get('brp','useHPL') && nItm.system.HPL) {
        reqResult = 0;
        errMsg = nItm.name + " : " +   game.i18n.localize('BRP.armourNotHPL');               
      }
      //If using hit locations select a Hit Location for the armour
      if (game.settings.get('brp','useHPL')) {
        let usage = await BRPactorItemDrop.hitLocationDialog (actor)
        if (usage) {
          nItm.system.hitlocID = usage.get('hitLoc')
        } else {
          reqResult = 0;
          errMsg = nItm.name + " : " +   game.i18n.localize('BRP.armourNoHitLoc');              
        }
      }
    }  

      //When dropping get the base score
      if (nItm.type === 'skill') {
        nItm.system.base = await this._calcBase(nItm,actor)
      }

      //When dropping a weapon check to see if character has the skills and if not add them to the character sheet
      if (nItm.type === 'weapon') {
        //If there isn't a skill1 then give an error message
        if(nItm.system.skill1 === "" || nItm.system.skill1 === "none") {
          reqResult = 0;
          errMsg = nItm.name + " : " +   game.i18n.localize('BRP.weaponNeedsSkill');     
        } else {

          nItm.system.equipStatus = 'carried'
          nItm.system.actEnc = nItm.system.enc
          nItm.system.hpCurr = nItm.system.hp
          let skill1Test = 0
          let skill2Test = 0  
          let newSkill = "";  
          //Test to see if skill1 or 2 exist on the character
          if((await actor.items.filter(itm=>itm.type==='skill' && nItm.system.skill1 === itm.flags.brp.brpidFlag.id)).length>0) {skill1Test = 1}
          if (nItm.system.skill2 !='none') {
            if((await actor.items.filter(itm=>itm.type==='skill' && nItm.system.skill2 === itm.flags.brp.brpidFlag.id)).length>0) {skill2Test = 1}
          }  

          //Test to see if the skill1 or 2 are in the newItems due to be created
          if((await newItemData.filter(itm=>itm.type==='skill' && nItm.system.skill1 === itm.flags.brp.brpidFlag.id)).length>0) {skill1Test = 1}
          if (nItm.system.skill2 !='none') {
            if((await actor.items.filter(itm=>itm.type==='skill' && nItm.system.skill2 === itm.flags.brp.brpidFlag.id)).length>0) {skill2Test = 1}
          } 


          if (skill1Test === 0 && nItm.system.skill1 != 'none') {
            newSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:nItm.system.skill1}))[0]
            if (newSkill) {
              newSkill.system.base = await this._calcBase(newSkill,actor)
              newItemData.push(newSkill)}
          }
          if (skill2Test === 0 && nItm.system.skill2 != 'none') {
            newSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:nItm.system.skill2}))[0]
            if (newSkill) {
              newSkill.system.base = await this._calcBase(newSkill,actor)            
              newItemData.push(newSkill)}
          }
        }
      }

      //Drop Culture, Personality & Professions - check one doesnt already exist and add relevant skills etc
      if (['personality','profession','culture'].includes(nItm.type)) {
        let check = await this._dropPersonality(nItm,actor)
        reqResult = check.reqResult;
        errMsg = check.errMsg;
      }

      //If skill, don't let Group Skills be added and check to see if skill exists already unless a non-named specialism skill e.g. Craft (specify)
      if (nItm.type === 'skill') {
        if (nItm.system.group) {
          reqResult = 0;
          errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): "  +   game.i18n.localize('BRP.stopGroupSkill');       
        } else if (nItm.system.specialism && !nItm.system.chosen) {
          nItm = await this._getSpecialism(foundry.utils.duplicate(nItm),actor) 
        } 
        if (!nItm.system.specialism || (nItm.system.specialism && nItm.system.chosen)) {
          let dupItm = await actor.items.filter(itm =>itm.type==='skill' && itm.flags.brp.brpidFlag.id===nItm.flags.brp.brpidFlag.id)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): " + game.i18n.localize('BRP.dupItem');
          }
        } 
        //If skill is to be added then check that the Skill Category is on the actor
      }

      //If a failing then check that superpower has been selected
      if (nItm.type === 'failing' && actor.system.super === "") {
        reqResult = 0;
        errMsg = nItm.name + " : " + game.i18n.localize('BRP.needPower') + " (" + game.i18n.localize('BRP.super') + ")";        
      }

      //If a power check that the appropriate game setting is true
      if (nItm.type === 'power' && !game.settings.get('brp',[nItm.system.category])) {
        reqResult = 0;
        errMsg = nItm.name + " : " + game.i18n.localize('BRP.nopower');
      }

      //If an allegiance check that the appropriate game setting is true
      if (nItm.type === 'allegiance') {
        if (!game.settings.get('brp','useAlleg')) {
          reqResult = 0;
          errMsg = nItm.name + " : " + game.i18n.localize('BRP.noAlleg');
        } else {
          let dupItm = await actor.items.filter(itm =>itm.type==='allegiance' && itm.flags.brp.brpidFlag.id===nItm.flags.brp.brpidFlag.id)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): " + game.i18n.localize('BRP.dupItem');
          }
        }
      }

      //If a reputation check that the appropriate game setting is true
      if (nItm.type === 'reputation') {
        if (game.settings.get('brp','useReputation') ==="0") {
          reqResult = 0;
          errMsg = nItm.name + " : " + game.i18n.localize('BRP.noRep');
        } else if (game.settings.get('brp','useReputation') ==="1"){
          let repNum = await actor.items.filter(itm =>itm.type==='reputation')
          if (repNum.length > 0) {
            reqResult = 0;
            errMsg = nItm.name + " : " + game.i18n.localize('BRP.oneRep');            
          }
        } else {
          let dupItm = await actor.items.filter(itm =>itm.type==='reputation' && itm.flags.brp.brpidFlag.id===nItm.flags.brp.brpidFlag.id)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): " + game.i18n.localize('BRP.dupItem');
          }
        }
      }

      //If a Personality Trait check that the appropriate game setting is true
      if (nItm.type === 'persTrait') {
        if (!game.settings.get('brp','usePersTrait')) {
          reqResult = 0;
          errMsg = nItm.name + " : " + game.i18n.localize('BRP.noPersTrait');
        } else {
          let dupItm = await actor.items.filter(itm =>itm.type==='persTrait' && itm.flags.brp.brpidFlag.id===nItm.flags.brp.brpidFlag.id)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): " + game.i18n.localize('BRP.dupItem');
          }
        }
      }

      //If a passion check that the appropriate game setting is true
      if (nItm.type === 'passion') {
        if (!game.settings.get('brp','usePassion')) {
          reqResult = 0;
          errMsg = nItm.name + " : " + game.i18n.localize('BRP.noPassion');
        } else {
          let dupItm = await actor.items.filter(itm =>itm.type==='passion' && itm.flags.brp.brpidFlag.id === nItm.flags.brp.brpidFlag.id)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): " + game.i18n.localize('BRP.dupItem');
          }
        }
      }

      //If a magic spell, mutation, psychic ability, sorcery spell or super-power check that the appropriate power is present
      if (nItm.type === 'magic' || nItm.type === 'mutation' || nItm.type === 'psychic' || nItm.type === 'sorcery' || nItm.type === 'super') {
        if (actor.system[nItm.type] === "") {
          reqResult = 0;
          errMsg = nItm.name + " : " + game.i18n.localize('BRP.needPower') + " (" + game.i18n.localize('BRP.'+nItm.type) + ")";
        }
      }  

      //If a power,magic,mutation,psychic,sorcery,superpower etc and not failed a previous test, check to see if the item already exists on the character sheet
      if ((['power','magic','mutation','psychic','sorcery','super','hit-location', 'skillcat'].includes(nItm.type)) && reqResult === 1) {
        let dupItm = await actor.items.filter(itm =>itm.type===nItm.type && itm.flags.brp.brpidFlag.id ===nItm.flags.brp.brpidFlag.id)
        if (dupItm.length > 0) {
          reqResult = 0;
          errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): " + game.i18n.localize('BRP.dupItem');
        }
      }
    
      //If a hit-location and not using HPL then only allow general hit location
      if (nItm.type === 'hit-location' && !game.settings.get('brp','useHPL')) {
        if (nItm.system.locType != 'general') {
          reqResult = 0;
          errMsg = nItm.name + " : " + game.i18n.localize('BRP.noHPL');          
        }
      }
    
    }  



    //Check to see if we can drop the Item
      if (reqResult !=1) {
        ui.notifications.warn(errMsg);
      } else {
        newItemData.push(nItm);
      }
    }  
    return (newItemData);
  }

 //Calculate Base Skill on Dropping the item on actor
 static async _calcBase(itm,actor){
  //Check the skill Category exists
  await this._checkSkillCat(itm,actor)
  if (itm.system.variable) {
    let stat1 = itm.system.baseFormula[1].stat
    let stat2 = itm.system.baseFormula[2].stat
    let opt1 = 0
    let opt2 = 0
    let newScore = 0
    if (stat1 !='fixed') {
      if (stat1 != 'edu' || game.settings.get('brp', 'useEDU')) {
        opt1 = Math.ceil((actor.system.stats[stat1].base + actor.system.stats[stat1].redist + actor.system.stats[stat1].culture) * itm.system.baseFormula[1].value)
      }  
    }
    if (stat2 !='fixed') {
      if (stat2 != 'edu' || game.settings.get('brp', 'useEDU')) {
        opt2 = Math.ceil((actor.system.stats[stat2].base + actor.system.stats[stat2].redist + actor.system.stats[stat2].culture) * itm.system.baseFormula[2].value)
      }  
    }

    if (itm.system.baseFormula.Func === 'and') {
      newScore = opt1 + opt2          
    } else {
      newScore = Math.max(opt1, opt2)
    }
    return newScore
  }
  return itm.system.base
  }

  static async hitLocationDialog (actor) {
    let hitLocOptions = await BRPSelectLists.getHitLocOptions(actor)
    let label = game.i18n.localize('BRP.chooseHitLoc')
    let data = {
      hitLocOptions,
      label,
    }
    const html = await renderTemplate('systems/brp/templates/dialog/hitLocChoice.html',data)
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: "",
        content: html,
        buttons: {
          roll: {
            label: game.i18n.localize("BRP.proceed"),
            callback: html => {
              formData = new FormData(html[0].querySelector('#hitLocChoice-form'))
              return resolve(formData)
            }
          }
        },
        default: 'roll',
        close: () => {}
      })
      dlg.render(true)
    })
  }

  //Make skill selections etc when dropping a personality, culture or profession
  static async _dropPersonality(itm,actor) {
    const addItems=[]
    const updateItems=[]
    const skillList=[]
    const powerList = []
    let newSkill = {}
    if (await actor.items.filter(nitm => nitm.type === itm.type).length>0) {
      return ({'reqResult': 0, 'errMsg':itm.name + " : " +   game.i18n.format('BRP.stopPersonality', {type: game.i18n.localize('BRP.'+itm.type)})})
    }

    //If Profession then check for powers
    if (itm.type === 'profession') {
      for (let nPwr of itm.system.powers) {
        newSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:nPwr.brpid}))[0]
        if(!newSkill) continue
        if (!game.settings.get('brp',[newSkill.system.category])) {
          ui.notifications.warn(newSkill.name + " : " + game.i18n.localize('BRP.nopower'))
          continue}
        if (newSkill) {
          if (await actor.items.filter(nitm=> nitm.flags.brp.brpidFlag.id === newSkill.flags.brp.brpidFlag.id)) {
            continue
          } else {
            powerList.push(foundry.utils.duplicate(newSkill))
          }
        }  
      }
    }


    //Go through each Optional Skill Group and make selections
    for (let nGrp of itm.system.groups) {
      const selected = await this._selectSkillGroup (nGrp)
        if (selected.length <1 || !selected)  {continue}
        for (let nSkill of selected) {
          newSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:nSkill.id}))[0]      
          //If a group skill then pass to the selection
          if (newSkill.system.group) {
            const selected = await this._selectGroupSkill(newSkill,actor,1)
            if (selected.length <1 || !selected)  {continue}
            newSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:selected[0].id}))[0]
            if (newSkill) {
              let placeholder = foundry.utils.duplicate(newSkill) 
              if (itm.type === 'culture') {
                placeholder.system.culture = nSkill.bonus
              } 
              skillList.push(placeholder)
            }
          } else {
            if (newSkill) {
              let placeholder = foundry.utils.duplicate(newSkill) 
              if (itm.type === 'culture') {
                placeholder.system.culture = nSkill.bonus
              } 
              skillList.push(placeholder)
            }
          }
        }  
      }

    //Get each skill etc on the main list
    for (let nItm of itm.system.skills) {
      newSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:nItm.brpid}))[0]
      //If you can't find the skill then skip it
      if(!newSkill) continue
      //If a group skill then pass to the selection
      if (newSkill.system.group) {
        const selected = await this._selectGroupSkill(newSkill,actor,1)
        if (selected.length <1 || !selected)  {continue}
        newSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:selected[0].id}))[0]
        if (newSkill) {
          let placeholder = foundry.utils.duplicate(newSkill) 
          if (itm.type === 'culture') {
            placeholder.system.culture = nItm.bonus
          } 
          skillList.push(placeholder)}
      } else {
        if (newSkill) {
          let placeholder = foundry.utils.duplicate(newSkill) 
          if (itm.type === 'culture') {
            placeholder.system.culture = nItm.bonus
          }  
          skillList.push(placeholder)
        }
      }
    }

    //This is the list of selected skills
    for (let nItm of skillList) {
      //If a specialism skill and not specified then get the name etc
      if (nItm.system.specialism && !nItm.system.chosen) {
        nItm = await this._getSpecialism(nItm,actor)
      }

      //If personality then set Personality score to 20 and flag personality skills
      if (itm.type === 'personality') {
        nItm.system.personality = 20
        nItm.system.prsnlty = true
      }

      //If profession then flag profession skills
      if (itm.type === 'profession') {
        nItm.system.occupation = true
      }

      //If culture then flag profession skills
      if (itm.type === 'culture') {
        nItm.system.cultural = true
      }

      //If existing skill on actor then push to updateItems otherwise calculate base and push to addItems
      let actItem = (await actor.items.filter(cItm => cItm.flags.brp.brpidFlag.id === nItm.flags.brp.brpidFlag.id))[0]
      if (actItem) {
        if (itm.type === 'personality') {
          updateItems.push({_id: actItem._id, 'system.personality': nItm.system.personality, 'system.prsnlty': nItm.system.prsnlty})
        } else if (itm.type === 'profession') {
          updateItems.push({_id: actItem._id, 'system.occupation': nItm.system.occupation})
        } else if (itm.type === 'culture') {
          updateItems.push({_id: actItem._id, 'system.culture': nItm.system.culture,'system.cultural': nItm.system.cultural})
        }
      } else {  
        nItm.system.base = await this._calcBase(nItm,actor)  
        addItems.push(nItm)
      }
    }

    await Item.createDocuments(addItems, {parent: actor})
    await Item.createDocuments(powerList, {parent: actor})
    await Item.updateDocuments(updateItems, {parent: actor})



    //If a culture add the dice and bonuses
    if (itm.type === 'culture') {
      let changes = {}
      for (let [key, stat] of Object.entries(itm.system.stats)) {
        if (stat.formula != "") {
          changes= Object.assign(changes,{[`system.stats.${key}.formula`] : stat.formula})
        }
          changes= Object.assign(changes,{[`system.stats.${key}.culture`] : Number(stat.mod)??0})
      }  
      //Now add the move score
      changes = Object.assign(changes,{'system.move':Number(itm.system.move)})  
      await actor.update(changes)
    }

    //If a profession then select wealth level
    if (itm.type === 'profession') {
      let wealthOptions = await BRPSelectLists.getWealthOptions(itm.system.minWealth,itm.system.maxWealth)
      let selected = await this.selectFromRadio(wealthOptions,"Select Wealth Level")
      await actor.update({'system.wealth' : selected})
    }



    return ({'reqResult': 1, 'errMsg': ""})
  }

 
  static async personalityDelete(event, actor) {
    const confirmation = await BRPUtilities.triggerDelete(event,actor, "itemId")
    //Reset all actor personality points on skills to zero
    let changes = []
    if (!confirmation) {return}
    for (let itm of actor.items){
      if (['skill','magic','psychic'].includes(itm.type)) {
        changes.push({
          _id: itm.id,
          'system.personality' : 0,
          'system.prsnlty': false
        })
      }
    }
    await Item.updateDocuments(changes, {parent: actor})   
  }

  static async professionDelete(event, actor) {
    const confirmation = await BRPUtilities.triggerDelete(event,actor, "itemId")
    //Reset all actor profession skills to zero
    let changes = []
    if (!confirmation) {return}
    for (let itm of actor.items){
      if (['skill','magic','psychic'].includes(itm.type)) {
        changes.push({
          _id: itm.id,
          'system.profession' : 0,
          'system.occupation': false
        })
      }
    }
    await Item.updateDocuments(changes, {parent: actor})   
    await actor.update({'system.wealth':""})
  }

  static async cultureDelete(event, actor) {
    const confirmation = await BRPUtilities.triggerDelete(event,actor, "itemId")
    //Reset all actor culture skills to zero
    let changes = []
    if (!confirmation) {return}
    for (let itm of actor.items){
      if (['skill','magic','psychic'].includes(itm.type)) {
        changes.push({
          _id: itm.id,
          'system.culture' : 0,
          'system.cultural': false
        })
      }
    }
    await Item.updateDocuments(changes, {parent: actor})
    //Reset dice and culture stat mods
    await actor.update({
      'system.stats.str.formula' :"",
      'system.stats.con.formula' :"",
      'system.stats.int.formula' :"",
      'system.stats.siz.formula' :"",
      'system.stats.pow.formula' :"",
      'system.stats.dex.formula' :"",
      'system.stats.cha.formula' :"",
      'system.stats.edu.formula' :"",
      'system.stats.str.culture' :0,
      'system.stats.con.culture' :0,
      'system.stats.int.culture' :0,
      'system.stats.siz.culture' :0,
      'system.stats.pow.culture' :0,
      'system.stats.dex.culture' :0,
      'system.stats.cha.culture' :0,
      'system.stats.edu.culture' :0,
      'system.move':0
    })   
  }



  static async _selectGroupSkill(newSkill,actor,picks) {
    let selectOptions = []
    if(newSkill.system.groupSkills.length > 0) {
      for (let skillOpt of newSkill.system.groupSkills) {
        let tempSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:skillOpt.brpid}))[0]
        if (tempSkill) {selectOptions.push({id:skillOpt.brpid, selected: false, name:tempSkill.name})}
      }
    } else {
      let skillList = await game.system.api.brpid.fromBRPIDRegexBest({ brpidRegExp:new RegExp('^i.skill'), type: 'i' })
      skillList.sort(function(a, b){
        let x = a.name;
        let y = b.name;
        if (x < y) {return -1};
        if (x > y) {return 1};
        return 0;
      });
      for (let skillOpt of skillList) {
        selectOptions.push({id:skillOpt.flags.brp.brpidFlag.id, selected: false, name:skillOpt.name})
      }
    }
    let selectedSkill = await SkillsSelectDialog.create(selectOptions,picks, game.i18n.localize('BRP.skills'))
    if (selectedSkill) {
      return selectedSkill
    } else {return false }
  }

  static async _selectSkillGroup(newGroup) {
    let selectOptions = []
    let picks = newGroup.options
    for (let skillOpt of newGroup.skills) {
      let tempSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:skillOpt.brpid}))[0]
      if (tempSkill) {selectOptions.push({id:skillOpt.brpid, selected: false, name:tempSkill.name, bonus:skillOpt.bonus ?? 0})}
    }        
    let selectedSkill = await SkillsSelectDialog.create(selectOptions,picks, game.i18n.localize('BRP.skills'))
    if (selectedSkill) {
      return selectedSkill
    } else {return false }    
  }

  static async _getSpecialism(newSkill,actor) {

    let title = game.i18n.format('BRP.getSpecialism', {entity: newSkill.name})
    let specName = await new Promise(resolve => {
      const dlg = new Dialog({
        title: title,
        content:  `<input class="centre" type="text" name="entry">`,
        buttons: {
          roll: {
            label: game.i18n.localize("BRP.confirm"),
            callback: html => {
            let inpB = html.find('[name="entry"]').val()
            resolve (inpB)
            }
          }
        },
        default: 'roll',
        close: () => {}
        },{classes: ["brp", "sheet"]})
        dlg.render(true);
      })
    newSkill.system.specName = specName
    newSkill.name = newSkill.system.mainName + ' (' + specName + ')'  
    newSkill.flags.brp.brpidFlag.id = "i.skill." + await BRPUtilities.toKebabCase(newSkill.name)
    newSkill.system.chosen = true;
    return newSkill
  }


  static async selectFromRadio(list,title){
    //Get list of items
    let newList = list

    //If there's only one item on the list then return it
    let selected = ""
    if (newList.length <1) {return false}
    if (Object.keys(newList).length === 1) {
      selected = Object.values(newList)[0]

    //Otherwise call the dialog selection
    } else {
      let destination = 'systems/brp/templates/dialog/selectItem.html';
      let data = {
        headTitle: title,
        newList,
      }
      const html = await renderTemplate(destination,data);
      let usage = await new Promise(resolve => {
        let formData = null
        const dlg = new Dialog({
          title: title,
          content: html,
          buttons: {
            roll: {
              label: game.i18n.localize("BRP.confirm"),
              callback: html => {
              formData = new FormData(html[0].querySelector('#selectItem'))
              return resolve(formData)
              }
            }
          },
          default: 'roll',
          close: () => {}
          },{classes: ["brp", "sheet"]})
          dlg.render(true);
        })

        //Get the PID from the form
        if (usage) {
          selected = usage.get('selectItem');
        }
      }
      if (selected === "") {return false}
      return selected
    }

    static async _checkSkillCat(skill,actor) {
      //Check to see if the skill category already exists and if it does then do nothing
      let newSkillCats = []
      if (actor.items.filter(nitm=> nitm.flags.brp.brpidFlag.id === skill.system.category).length >0) {
        return
      } 
      //Get the best version of the skill category
      let newSkillCat = (await game.system.api.brpid.fromBRPIDBest({brpid:skill.system.category}))[0]
      if (newSkillCat) {
        newSkillCats.push(newSkillCat)
        await Item.createDocuments(newSkillCats, {parent: actor})
      } else {
        let errMsg = game.i18n.format('BRP.noSkillCat',{skillCat: skill.system.category, skillName: skill.name})
        ui.notifications.warn(errMsg);
      }
      return
    }


}