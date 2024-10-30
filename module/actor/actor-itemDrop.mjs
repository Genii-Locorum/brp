import {BRPSelectLists} from '../apps/select-lists.mjs'

export class BRPactorItemDrop {

  // Change default on Drop Item Create routine for requirements (single items and folder drop)-----------------------------------------------------------------
  static async _BRPonDropItemCreate(actor,itemData) {
    const newItemData = [];
    itemData = itemData instanceof Array ? itemData : [itemData];
    //TODO: Consider adding a bypass to just create the items with no checks
    //      return actor.createEmbeddedDocuments("Item", itemData);
    for (let k of itemData) {
      let reqResult = 1;
      let errMsg = "";
    //Automatically allow gear to be added
    if (k.type != 'gear') {   

      //When dropping armour check against using HPL and HPL compatabaility
    if (k.type === 'armour') {
      if (game.settings.get('brp','useHPL') && k.system.HPL) {
        reqResult = 0;
        errMsg = k.name + " : " +   game.i18n.localize('BRP.armourNotHPL');               
      }
      //If using hit locations select a Hit Location for the armour
      if (game.settings.get('brp','useHPL')) {
        let usage = await BRPactorItemDrop.hitLocationDialog (actor)
        if (usage) {
          k.system.hitlocID = usage.get('hitLoc')
        } else {
          reqResult = 0;
          errMsg = k.name + " : " +   game.i18n.localize('BRP.armourNoHitLoc');              
        }
      }
    }  

      //When dropping get the base score
      if (k.type === 'skill') {
        k.system.base = await this._calcBase(k,actor)
      }

      //When dropping a weapon check to see if character has the skills and if not add them to the character sheet
      if (k.type === 'weapon') {
        //If there isn't a skill1 then give an error message
        if(k.system.skill1 === "" || k.system.skill1 === "none") {
          reqResult = 0;
          errMsg = k.name + " : " +   game.i18n.localize('BRP.weaponNeedsSkill');     
        } else {

          k.system.equipStatus = 'carried'
          k.system.actEnc = k.system.enc
          k.system.hpCurr = k.system.hp
          let skill1Test = 0
          let skill2Test = 0  
          let newSkill = "";  
          for (let j of actor.items) {
            if(j.type === 'skill') {
              if (j.name === game.items.get(k.system.skill1).name) {
                skill1Test = 1  
              } else if (k.system.skill2 != "none" && j.name === game.items.get(k.system.skill2).name) {
                skill2Test = 1  
              } 
            }
          }
          for (let j of newItemData) {
            if(j.type === 'skill') {
              if (j.name === game.items.get(k.system.skill1).name) {
                skill1Test = 1  
              } else if (k.system.skill2 != "none" && j.name === game.items.get(k.system.skill2).name) {
                skill2Test = 1  
              } 
            }          
          }
          if (skill1Test === 0 && k.system.skill1 != 'none') {
            newSkill = game.items.get(k.system.skill1)
            if (newSkill) {
              newSkill.system.base = await this._calcBase(newSkill,actor)
              newItemData.push(newSkill)}
          }
          if (skill2Test === 0 && k.system.skill2 != 'none') {
            newSkill = game.items.get(k.system.skill2)
            if (newSkill) {
              newSkill.system.base = await this._calcBase(newSkill,actor)            
              newItemData.push(newSkill)}
          }
        }
      }

      //Stop Personality being added if one exists
      if (k.type === 'personality' && actor.system.personalityId) {
        reqResult = 0;
        errMsg = k.name + " : " +   game.i18n.localize('BRP.stopPersonality');       
      }

      //Stop Profession being added if one exists
      if (k.type === 'profession' && actor.system.professionId) {
        reqResult = 0;
        errMsg = k.name + " : " +   game.i18n.localize('BRP.stopProfession');       
      }      

      //If skill, don't let Group Skills be added and check to see if skill exists already unless a non-named specialism skill e.g. Craft (specify)
      if (k.type === 'skill') {
        if (k.system.group) {
          reqResult = 0;
          errMsg = k.name + " : " +   game.i18n.localize('BRP.stopGroupSkill');       
        } else if (!k.system.specialism || (k.system.specialism && k.system.chosen)) {
          for (let j of actor.items) {
            if(j.type === k.type && j.name === k.name) {
              reqResult = 0;
              errMsg = k.name + " : " +   game.i18n.localize('BRP.dupItem'); 
            }
          }
        }
      }

      //If a failing then check that superpower has been selected
      if (k.type === 'failing' && actor.system.super === "") {
        reqResult = 0;
        errMsg = k.name + " : " + game.i18n.localize('BRP.needPower') + " (" + game.i18n.localize('BRP.super') + ")";        
      }

      //If a power check that the appropriate game setting is true
      if (k.type === 'power' && !game.settings.get('brp',[k.system.category])) {
        reqResult = 0;
        errMsg = k.name + " : " + game.i18n.localize('BRP.nopower');
      }

      //If an allegiance check that the appropriate game setting is true
      if (k.type === 'allegiance') {
        if (!game.settings.get('brp','useAlleg')) {
          reqResult = 0;
          errMsg = k.name + " : " + game.i18n.localize('BRP.noAlleg');
        } else {
          let dupItm = await actor.items.filter(itm =>itm.type==='allegiance' && itm.name===k.name)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = k.name + " : " + game.i18n.localize('BRP.dupItem');
          }
        }
      }

      //If a reputation check that the appropriate game setting is true
      if (k.type === 'reputation') {
        if (game.settings.get('brp','useReputation') ==="0") {
          reqResult = 0;
          errMsg = k.name + " : " + game.i18n.localize('BRP.noRep');
        } else if (game.settings.get('brp','useReputation') ==="1"){
          let repNum = await actor.items.filter(itm =>itm.type==='reputation')
          if (repNum.length > 0) {
            reqResult = 0;
            errMsg = k.name + " : " + game.i18n.localize('BRP.oneRep');            
          }
        } else {
          let dupItm = await actor.items.filter(itm =>itm.type==='reputation' && itm.name===k.name)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = k.name + " : " + game.i18n.localize('BRP.dupItem');
          }
        }
      }

      //If a Personality Trait check that the appropriate game setting is true
      if (k.type === 'persTrait') {
        if (!game.settings.get('brp','usePersTrait')) {
          reqResult = 0;
          errMsg = k.name + " : " + game.i18n.localize('BRP.noPersTrait');
        } else {
          let dupItm = await actor.items.filter(itm =>itm.type==='persTrait' && itm.name===k.name)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = k.name + " : " + game.i18n.localize('BRP.dupItem');
          }
        }
      }

      //If a passion check that the appropriate game setting is true
      if (k.type === 'passion') {
        if (!game.settings.get('brp','usePassion')) {
          reqResult = 0;
          errMsg = k.name + " : " + game.i18n.localize('BRP.noPassion');
        } else {
          let dupItm = await actor.items.filter(itm =>itm.type==='passion' && itm.name===k.name)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = k.name + " : " + game.i18n.localize('BRP.dupItem');
          }
        }
      }

      //If a magic spell, mutation, psychic ability, sorcery spell or super-power check that the appropriate power is present
      if (k.type === 'magic' || k.type === 'mutation' || k.type === 'psychic' || k.type === 'sorcery' || k.type === 'super') {
        if (actor.system[k.type] === "") {
          reqResult = 0;
          errMsg = k.name + " : " + game.i18n.localize('BRP.needPower') + " (" + game.i18n.localize('BRP.'+k.type) + ")";
        }
      }  

      //If a power,magic,mutation,psychic,sorcery,superpower and not failed a previous test, check to see if the item already exists on the character sheet
      if ((['power','magic','mutation','psychic','sorcery','super','hit-location'].includes(k.type)) && reqResult === 1) {
        for (let j of actor.items) {
          let dupItm = await actor.items.filter(itm =>itm.type===k.type && itm.name===k.name)
          if (dupItm.length > 0) {
            reqResult = 0;
            errMsg = k.name + " : " + game.i18n.localize('BRP.dupItem');
          }


//          if(j.type === k.type && j.name === k.name) {
//            reqResult = 0;
//            errMsg = k.name + " : " +   game.i18n.localize('BRP.dupItem'); 
//          }
        }
      }
    }  
    //Check to see if we can drop the Item
      if (reqResult !=1) {
        ui.notifications.warn(errMsg);
      } else {
        newItemData.push(k);
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