import { BRPUtilities } from '../apps/utilities.mjs';

export class BRPWounds {

  static async allHeal(el, actor) {
    let confirmation = await BRPUtilities.confirmation(game.i18n.localize('BRP.allHeal'), 'chatMsg');
    if (confirmation) {
      for (let i of actor.items) {
        if (i.type === 'wound') {
          i.delete();  
        }
      }
    }
    return 
  }  

  //Treat a Wound - First Aid
  static async treatWound(event,actor, dataitem) {
    const itemID = await BRPUtilities.getDataset(event, dataitem)
    const item = actor.items.get(itemID);
    if (item.system.treated){
        ui.notifications.warn(game.i18n.localize('BRP.woundTreated'));
        return;
    }
    let healing = 0
    let usage = await BRPWounds.healingAmount (game.i18n.localize('BRP.treatWound'),actor.name)
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

    //Take the opportunity to delete any wounds with zero damage they may not be visible
    await BRPWounds.cleanseWounds(actor)
  }      


  static async naturalHeal (event, actor) {
    let usage = await BRPWounds.healingAmount (game.i18n.localize('BRP.treatWound'),actor.name)
    let healing = 0
    if (usage) {
        healing = Number(usage.get('treat-wound'));
    }
    //If amout of healing is zero then simply ignore and stop
    if (healing === 0) {return}
  
    //Put wounds in array and sort lowest to highest damage
    let wounds=[];
    for (let i of actor.items) {
      await i.update({'system.treated': true});
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
      let avgHeal=Math.ceil(healing/nw)
      let woundHeal = Math.min(healing, i.system.value, avgHeal);
      if (woundHeal > 0) {
        const item= actor.items.get(i._id);
        await item.update({'system.value': i.system.value - woundHeal});
        healing = healing - woundHeal;
      }  
      nw--;
    }
    await BRPWounds.cleanseWounds(actor)
  }


  //Delete any wounds that have zero or less damage - they may not be visible on the character sheet
  static async cleanseWounds (actor) {
    for (let i of actor.items) {
      if(i.type === 'wound' && i.system.value < 1){
          i.delete();
      }
    }
  }

  // Form to get amount of healing
  static async healingAmount (type,name) {
    let title = type+": "+name;
    const html = await renderTemplate(
      'systems/brp/templates/dialog/treatWound.html',
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
}

