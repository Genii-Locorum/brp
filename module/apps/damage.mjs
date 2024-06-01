import { BRPUtilities } from './utilities.mjs';
import { BRPactorDetails } from "./actorDetails.mjs";

export class BRPDamage {

  // Add a wound
  static async takeDamage(event,actor,token,damage){
    let partic = await BRPactorDetails._getParticipantPriority(token, actor)
    let locationId = event.currentTarget.dataset.itemId;
    let location=""
    if (actor) {
      location = actor.items.get(locationId)
    } else {
      location = token.actor.items.get(locationId)
    }  

    //If damage is zero then get damage dialog
    if (damage < 1) {
      let usage = await this.healingAmount ('damage',partic.name)
      if (usage) {
          damage = Number(usage.get('treat-wound'));
      }
    }

    //If no damage then exit
    if (damage < 1) {return}

    //Check for damage at 2 or 3 times HPL (where current HP<=0 dealt with in actor.mjs)
    let checkprop={}
    //If using HPL and this is a an actual hit location (not general)
    if (game.settings.get('brp','useHPL') && location.system.locType !='general') {
      if (damage >= location.system.maxHP*3 && location.system.locType === 'limb') {
        checkprop = {'system.severed': true,
                     'system.bleeding': true} 
      } else if (damage >= location.system.maxHP*3 && location.system.locType != 'general') {
        checkprop = {'system.dead': true,
                     'system.incapacitated': true, 
                     'system.bleeding': true} 
      } else if (damage >= location.system.maxHP*2 && location.system.locType === 'limb') {
          checkprop = {'system.incapacitated': true,
                       'system.bleeding': true}
      } else if (damage >= location.system.maxHP*2 && location.system.locType != 'general') {
        checkprop = {'system.unconscious': true,
                     'system.bleeding': true}
      }else if (damage >=location.system.currHP && location.system.locType !='limb'){
        checkprop = {'system.bleeding': true}
      } 
      damage = Math.min(damage, location.system.maxHP*2) 
    //Otherwise if not using HPL
    } else if (!game.settings.get('brp','useHPL')){
      if (damage >= partic.system.health.mjrwnd) {
        await partic.update({'system.majorWnd': true,
                             'system.health.daily': 0})
      } else if (partic.system.health.daily + damage >= partic.system.health.mjrwnd) {
        await partic.update({'system.minorWnd': true,
                             'system.health.daily': 0})
      } 
      if (!partic.system.minorWnd && !partic.system.majorWnd)
      partic.update({'system.health.daily': partic.system.health.daily+damage})
    } 
    if (game.settings.get('brp','useHPL')) {await location.update(checkprop)}

    //Prepare the new wound data and create it
    const itemData = {
      name: game.i18n.localize('BRP.wound'),
      type: 'wound',
      system: {
        locId: locationId,
        value: damage        
      }
    };
    const newItem = await Item.create(itemData, {parent: partic});

  }  





  static async allHeal(el, actor) {
    let confirmation = await BRPUtilities.confirmation(game.i18n.localize('BRP.allHeal'), 'chatMsg');
    if (confirmation) {
      for (let i of actor.items) {
        if (i.type === 'wound') {
          i.delete();  
        } else if (i.type ==='hit-location') {
          i.update ({'system.bleeding': false,
                     'system.incapacitated': false,
                     'system.injured': false,
                     'system.unconscious': false
          })
        }
      }
    }
    return 
  }  

  //Treat a Wound - First Aid
  static async treatWound(event,actor, dataitem,type) {
    const itemID = await BRPUtilities.getDataset(event, dataitem)
    const item = actor.items.get(itemID);
    if (item.system.treated && type === 'medical'){
        ui.notifications.warn(game.i18n.localize('BRP.woundTreated'));
        return;
    }
    let hitLoc = actor.items.get(item.system.locId)
    let healing = 0
    let usage = await BRPDamage.healingAmount (game.i18n.localize('BRP.treatWound'),actor.name)
    if (usage) {
        healing = Number(usage.get('treat-wound'));
    }
    //If amout of healing is zero then simply ignore and stop
    if (healing === 0) {return}



    //If amount of healing >- wound then simply delete the wound
    if (healing >= item.system.value) {
        item.delete();
        actor.render(true)
        return
    }

    //Otherwise reduce the wound score by amount healed (or increase if a negative) and set treated status to true
    let newWound = item.system.value
    let checkProp = {'system.value': item.system.value - healing,
                     'system.treated': true}
    item.update(checkProp)
    if (game.settings.get('brp','useHPL')) {
      hitLoc.update({'system.bleeding': false,
                     'system.incapacitated': false,
                     'system.unconscious': false
      })
    }
    //Take the opportunity to delete any wounds with zero damage they may not be visible
    await BRPDamage.cleanseWounds(actor)
  }      


  static async naturalHeal (event, actor) {
    let usage = await BRPDamage.healingAmount (game.i18n.localize('BRP.treatWound'),actor.name)
    let healing = 0
    let updates=[];
    let deletes=[];
    if (usage) {
        healing = Number(usage.get('treat-wound'));
    }
    //If amout of healing is zero then simply ignore and stop
    if (healing === 0) {return}
  
    //Put wounds in array and sort lowest to highest damage
    let wounds=[];
    for (let i of actor.items) {
      if(i.type === 'wound'){
        wounds.push(i);
      }
    }
    wounds.sort(function(a, b){
      let x = a.system.value;
      let y = b.system.value;
      if (x < y) {return -1};
      if (x > y) {return 1};
    return 0;
    });

    let nw= wounds.length;
    for (let i of wounds) {
      if( i.system.value < 1) {
        deletes.push(i._id)
      } else {  
        let avgHeal=Math.ceil(healing/nw)
        let woundHeal = Math.min(healing, i.system.value, avgHeal);
        healing = healing - woundHeal;
        if (woundHeal >= i.system.value){
          deletes.push(i._id)
        } else if (woundHeal > 0) {
          updates.push({
            _id: i._id,
            'system.treated.': true,
            'system.value': i.system.value - woundHeal
          })
        } else {
          updates.push({
            _id: i._id,
            'system.treated.': true
          })
        }
      } 
      nw--;
    }
    await Item.updateDocuments(updates,{parent:actor});
    await Item.deleteDocuments(deletes,{parent:actor});
  }


  //Delete any wounds that have zero or less damage - they may not be visible on the character sheet
  static async cleanseWounds (actor) {
    for (let i of actor.items) {
      if(i.type === 'wound' && i.system.value < 1){
          i.delete();
      }
    }
  }

  // Form to get amount of damage or healing
  static async healingAmount (type,name) {
    let title = ""
    if (type === 'damage') {
      title = game.i18n.localize('BRP.addWound') +": "+name;
    } else {
      title = game.i18n.localize('BRP.treatWound') +": "+name;
    }
    title = type+": "+name;
    const html = await renderTemplate(
      'systems/brp/templates/dialog/treatWound.html',
      {type,
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
                html[0].querySelector('#treat-wound-form')
              )
              return resolve(formData)
            }
          }
        },
        default: 'validate',
        close: () => {
          return resolve(false)
        }
      }, {classes: ["brp", "sheet"]})
      dlg.render(true)
    })
  }

  static async resetDaily (event, actor) {
    actor.update({'system.health.daily': 0})
  }

}

