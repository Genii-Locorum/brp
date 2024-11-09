import {BRPSelectLists} from '../apps/select-lists.mjs'

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

      //Stop Personality being added if one exists
      if (nItm.type === 'personality' && (await actor.items.filter(itm => itm.type === 'personality')).length>0) {
        reqResult = 0;
        errMsg = nItm.name + " : " +   game.i18n.localize('BRP.stopPersonality');       
      }

      //Stop Profession being added if one exists
      if (nItm.type === 'profession' && (await actor.items.filter(itm => itm.type === 'profession')).length>0) {
        reqResult = 0;
        errMsg = nItm.name + " : " +   game.i18n.localize('BRP.stopProfession');       
      }      

      //If skill, don't let Group Skills be added and check to see if skill exists already unless a non-named specialism skill e.g. Craft (specify)
      if (nItm.type === 'skill') {
        if (nItm.system.group) {
          reqResult = 0;
          errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): "  +   game.i18n.localize('BRP.stopGroupSkill');       
        } else if (!nItm.system.specialism || (nItm.system.specialism && nItm.system.chosen)) {
          let dupItm = await actor.items.filter(itm =>itm.type==='skill' && itm.flags.brp.brpidFlag.id===nItm.flags.brp.brpidFlag.id)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = nItm.name + "(" + nItm.flags.brp.brpidFlag.id + "): " + game.i18n.localize('BRP.dupItem');
          }
        }
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
        if (nItm.type ==='personality') {
          await this._dropPersonality(nItm,actor)
        }
      }
    }  
    return (newItemData);
  }

 //Calculate Base Skill on Dropping the item on actor
 static async _calcBase(itm,actor){
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

  static async _dropPersonality(itm,actor) {
    //TO DO Get specialisations
    //TO DO Add new skills to the actor sheet
    //TO DO Set Personality Skill points to 20
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

}