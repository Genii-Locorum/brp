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
    if (k.type != 'gear' && k.type != 'armour') {   


      //When dropping get the base score
      if (k.type === 'skill') {
        k.system.base = await this._calcBase(k,actor)
      }

      //When dropping a weapon check to see if character has the skills and if not add them to the character sheet
      if (k.type === 'weapon') {
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

      //If a magic spell, mutation, psychic ability, sorcery spell or super-power check that the appropriate power is present
      if (k.type === 'magic' || k.type === 'mutation' || k.type === 'psychic' || k.type === 'sorcery' || k.type === 'super') {
        if (actor.system[k.type] === "") {
          reqResult = 0;
          errMsg = k.name + " : " + game.i18n.localize('BRP.needPower') + " (" + game.i18n.localize('BRP.'+k.type) + ")";
        }
      }  

      //If a power,magic,mutation,psychic,sorcery,superpower and not failed a previous test, check to see if the item already exists on the character sheet
      if ((k.type === 'power' || k.type === 'magic' || k.type === 'mutation' || k.type === 'psychic' || k.type === 'sorcery' || k.type === 'super') && reqResult === 1) {
        for (let j of actor.items) {
          if(j.type === k.type && j.name === k.name) {
            reqResult = 0;
            errMsg = k.name + " : " +   game.i18n.localize('BRP.dupItem'); 
          }
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
 static async _calcBase(i,actor){
  if (i.system.variable) {
    let stat1 = i.system.baseFormula[1].stat
    let stat2 = i.system.baseFormula[2].stat
    let opt1 = 0
    let opt2 = 0
    let newScore = 0
    if (stat1 !='fixed') {
      if (stat1 != 'edu' || game.settings.get('brp', 'useEDU')) {
        opt1 = Math.ceil((actor.system.stats[stat1].base + actor.system.stats[stat1].redist + actor.system.stats[stat1].culture) * i.system.baseFormula[1].value)
      }  
    }
    if (stat2 !='fixed') {
      if (stat2 != 'edu' || game.settings.get('brp', 'useEDU')) {
        opt2 = Math.ceil((actor.system.stats[stat2].base + actor.system.stats[stat2].redist + actor.system.stats[stat2].culture) * i.system.baseFormula[2].value)
      }  
    }

    if (i.system.baseFormula.Func === 'and') {
      newScore = opt1 + opt2          
    } else {
      newScore = Math.max(opt1, opt2)
    }
    return newScore
  }
  return i.system.base
  }

}