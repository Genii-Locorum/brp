import { BRPactorDetails } from "../apps/actorDetails.mjs";
import { BRPUtilities } from "../apps/utilities.mjs";


export class BRPCombat {

  //
  // Add a wound
  //
  static async takeDamage(actor, token, itemId){
    let partic =await BRPactorDetails._getParticipantPriority(token,actor)
    let location = partic.items.get(itemId)
    let damage= 0;
    let usage = await this.damageAmount (partic.name,location.name,'damage')
    if (usage) {
        damage = Number(usage.get('new-wound'));
    }


    //TO DO:  Check for Armour

    if (damage < 1) {return}

    //Check for damage at 2 or 3 times HPL
    let checkprop={}
    if (game.settings.get('brp','useHPL')) {
      if (damage >= location.system.maxHP*3) {
        checkprop = {'system.status':"severed",
        'system.bleeding': true} 
      } else if (damage >= location.system.maxHP*2) {
          checkprop = {'system.status': "incapacitated",
          'system.bleeding': true}
      } else if (damage >= location.system.currHP && location.system.locType) {
          checkprop = {'system.status': "injured",
          'system.bleeding': true}
      } 
    } else {
      if (damage >= partic.system.health.mjrwnd) {
        await partic.update({'system.majorWnd': true})
      } else if (partic.system.health.daily + damage >= partic.system.health.mjrwnd) {
        await partic.update({'system.minorWnd': true})
      } 
    } 
    await location.update(checkprop)
    damage = Math.min(damage, location.system.maxHP*2)

    if (partic.system.health.value - damage <3 && partic.system.health.value - damage > 0 ){
      await partic.update({'system.unconscious': true})
    }


    //Add new wound
    let wounds = location.system.wounds ? location.system.wounds : []
    const newWounds = wounds.concat([{ damage: damage, treat: false, heal: false}])
    await location.update({'system.wounds': newWounds})
    await partic.update({'system.health.daily': partic.system.health.daily + damage})


  }  

  //
  // Form to get amount of damage or healing
  //
  static async damageAmount (name, location, type) {
    let title = game.i18n.localize('BRP.damageAmount') + " " + location
    if (type === 'treat' || type==='heal'){
      title = game.i18n.localize('BRP.treatAmount') + " " + location
    }
    const html = await renderTemplate(
      'systems/brp/templates/dialog/addWound.html',
      {
      }
    )
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: title,
        content: html,
        buttons: {
          validate: {
            label: game.i18n.localize('BRP.confirm'),
            callback: html => {
              formData = new FormData(
                html[0].querySelector('#add-wound-form')
              )
              return resolve(formData)
            }
          }
        },
        default: 'validate',
        close: () => {
          return resolve(false)
        }
      })
      dlg.render(true)
    })
  }


  //
  //Treat Wound
  //
  static async treatWound(token, actor, itemId, itemIndex,type){
    let partic =await BRPactorDetails._getParticipantPriority(token,actor)
    let location = partic.items.get(itemId)
    let treat= 0;
    let wounds = location.system.wounds ? location.system.wounds : []
    if (wounds[itemIndex][type]){
      let errMsg = game.i18n.localize('BRP.already'+type)
      ui.notifications.warn(errMsg);
      return
    }  

    let usage = await this.damageAmount (partic.name,location.name,type)
    if (usage) {
        treat = Number(usage.get('new-wound'));
    }
    if (treat < 1) {return}
    let newDamage = wounds[itemIndex].damage - treat
    if (newDamage < 1) {
      wounds.splice(itemIndex, 1)
    } else {
      wounds[itemIndex].damage = newDamage
      wounds[itemIndex][type] = true
    }

    await location.update({'system.wounds': wounds})

 }

  //
  //Natural Healing across all hit locations
  //
  static async naturalHealing(token, actor,formula,treat) {
    let partic =await BRPactorDetails._getParticipantPriority(token,actor)
    
    if (treat === 0) {
      let label = game.i18n.localize('BRP.naturalHealing')
      //Check there are some wounds to heal
      if (partic.system.health.max === partic.system.health.value) {
        return}
        
      let roll = new Roll(formula);
      await roll.roll({ async: true});
      treat = Number(roll.result);
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: partic }),
        flavor: label
    });
  }

    //If treat exceeds total damage then clear all wounds
    if (treat >= (partic.system.health.max - partic.system.health.value)) {
      await this.deleteAllWounds(partic)
      return
      }
    
    //If using Natural Healing per Location
    if (game.settings.get('brp','healMod')) {
      for (let i of partic.items) {
        if (i.type === 'hit-location') {
          if (i.system.currHP<i.system.maxHP) {
            await this.treatLocation(token, actor, i._id,treat)
          }
        }
      }   
      return 
    }     

    //Otherwsise get all wounds, sort them and apply natural healing across all wounds
      let wounds=[]
      let totalWounds=[]
      let totalDamage=0
      let newWounds=[]
      for (let i of partic.items) {
        if (i.type === 'hit-location') {
          wounds = i.system.wounds ? i.system.wounds : []          
          if (wounds.length > 0) {
            for (let j = 0; j < wounds.length; j++) {              
              totalWounds = totalWounds.concat([{itemId: i._id, damage: wounds[j].damage, heal: wounds[j].heal}])
              totalDamage = totalDamage + wounds[j].damage
            }  
          }   
        }
      }
      //Sort wounds in damage order
      totalWounds.sort(function(a, b){
        let x = a.damage;
        let y = b.damage;
        if (x < y) {return -1};
        if (x > y) {return 1};
        return 0;
      });

      let restore = 0
      for (let i = 0; i < totalWounds.length; i++) {
        restore=Math.floor(treat/(totalWounds.length-i))
        restore=Math.min(restore,totalWounds[i].damage)
        totalWounds[i].damage = totalWounds[i].damage-restore
        treat = treat-restore        
      }

      for (let i of partic.items) {
        if (i.type === 'hit-location') {
          newWounds=[]
          for (let j = 0; j < totalWounds.length; j++) {
            if(i._id === totalWounds[j].itemId && totalWounds[j].damage > 0){
              newWounds = newWounds.concat([{damage: totalWounds[j].damage, treat: true, heal: totalWounds[j].heal}])
            }
          }    
          await i.update({'system.wounds': newWounds, 'system.bleeding': false,}) 
        }
      }
  }  

  //
  // Treat a hit location
  //
  static async treatLocation(token, actor, itemId,treat) {
    let partic =await BRPactorDetails._getParticipantPriority(token,actor)
    let location = partic.items.get(itemId)
    //let treat= 0;
    let wounds = location.system.wounds ? location.system.wounds : []
    //If no wounds then exit
    if (wounds.length < 1) {return}
    
    //If treat is not 1+ then get it via dialogue
    if (treat<1 ) {
      let usage = await this.damageAmount (partic.name,location.name,'heal')
      if (usage) {
        treat = Number(usage.get('new-wound'));
      }
    }
    //If not healing then exit
    if (treat < 1) {return}

    //Sort wounds in damage order
    wounds.sort(function(a, b){
      let x = a.damage;
      let y = b.damage;
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });
    let restore = 0
    let newWounds=[]
    for (let i = 0; i < wounds.length; i++) {  
      restore=Math.floor(treat/(wounds.length-i))
      restore=Math.min(restore,wounds[i].damage)
      wounds[i].damage = wounds[i].damage - restore
      treat = treat-restore
      if (wounds[i].damage > 0) {
        newWounds = newWounds.concat([{ damage: wounds[i].damage, treat: wounds[i].treat, heal: wounds[i].heal}])
      }
    }    

    await location.update({'system.wounds': newWounds})
  }

  //
  //Delete a wound on a location, or all wounds if itemIndex = 999      
  //
  static async deleteWound (token, actor, itemId, itemIndex) {
    let partic =await BRPactorDetails._getParticipantPriority(token,actor)
    let location = partic.items.get(itemId)
    let newStatus = ""
    if (location.system.status === "severed") {
      newStatus = "severed"
    }
    if (itemIndex === 999) {
      let confirmation = await BRPUtilities.confirmation();
      if (!confirmation) {return}
      await location.update({'system.wounds': [],
      'system.bleeding': false,
      'system.status': newStatus})
    } else {
      let wounds = location.system.wounds ? location.system.wounds : []
      wounds.splice(itemIndex, 1)
      await location.update({'system.wounds': wounds})
    }
  }

  //
  //Delete all wounds in all locations
  //
  static async deleteAllWounds(partic) {
    for (let i of partic.items) {
      let newStatus = ""
      if (i.system.status === "severed") {
        newStatus = "severed"
      }
      if (i.type === 'hit-location')
        i.update({'system.wounds': [],
                  'system.bleeding': false,
                  'system.status': newStatus})
    }
  }

  //
  //Reset Daily Damage      
  //
  static async resetDaily (token, actor) {
    let partic =await BRPactorDetails._getParticipantPriority(token,actor)
      await partic.update({'system.health.daily': 0, 'system.minorWnd' : false})
      return (partic)
  }

  //
  //Resolve Major Wound      
  //
  static async resMjrWnd (token, actor) {
    let partic =await BRPactorDetails._getParticipantPriority(token,actor)
    if (partic.system.majorWnd) {  
      //TO DO:  Roll on table automatically??
      await partic.update({'system.health.daily': 0, 'system.majorWnd' : false})
      return
    } else if (!partic.system.minorWnd) {
        return
    } else {
      await this.resetDaily (token, actor)
      //TO DO:  Luck roll automatically?  
    }  
  }

  //
  // Restore a severd location
  //

 static async restoreLocation (token, actor, itemId) {
  let partic =await BRPactorDetails._getParticipantPriority(token,actor)
  let location = partic.items.get(itemId)
  await location.update({'system.status': ""})
 }
}