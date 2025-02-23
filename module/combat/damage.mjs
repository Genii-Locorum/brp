import { BRPUtilities } from '../apps/utilities.mjs';
import { BRPactorDetails } from "../apps/actorDetails.mjs";

export class BRPDamage {

  // Add Damage
  static async addDamage(event,actor,token,damage){
    let partic = await BRPactorDetails._getParticipantPriority(token, actor)
    let getLoc = false
    let getDam = false
    let locs = {}
    let listLocs = {}
    let locationId = event.currentTarget.dataset.itemId;
    if (!locationId && game.settings.get('brp','useHPL')) {
      locs = await actor.items.filter(itm=>itm.type === 'hit-location')
      if (locs.length === 1) {
        locationId = locs[0]._id
      } else if (locs.length > 1) {
        getLoc = true
        locs.sort(function(a, b){
          let x = a.system.lowRoll;
          let y = b.system.lowRoll;
          if (x < y) {return 1};
          if (x > y) {return -1};
          return 0;
        });
        for (let loc of locs) {
          let label = loc.system.displayName + "(" + loc.system.lowRoll + "-" + loc.system.highRoll + ")"
          if (loc.system.lowRoll === loc.system.highRoll) {
            label = loc.system.displayName + "(" + loc.system.lowRoll + ")"
          } 
          listLocs = Object.assign(listLocs,{[loc._id]:label}) 
        }
      }
    }
    if (damage<1) {
      getDam = true
    }
    if (getDam || getLoc) {
      let usage = await this.getWoundForm (getDam,getLoc,partic.name,listLocs)
      if (getDam) {damage = Number(usage.get('damage'))};
      if (getLoc) {locationId = usage.get('woundLoc')};
    }  
    if (damage<1)  {return}

    let location=""
    if (actor) {
      location = actor.items.get(locationId)
    } else {
      location = token.actor.items.get(locationId)
    } 

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
        let key = await game.system.api.brpid.guessId(newItem)
        await newItem.update({'flags.brp.brpidFlag.id': key,
                             'flags.brp.brpidFlag.lang': game.i18n.lang,
                             'flags.brp.brpidFlag.priority': 0})

  }

  static async allHeal(el, actor) {
    let confirmation = await BRPUtilities.confirmation('allHeal', 'chatMsg');
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

  //Treat a Wound - First Aid or Magic
  static async treatWound(event,actor, dataitem,type) {
    let itemID = ""
    if (dataitem === "itemId") {
      itemID = await BRPUtilities.getDataset(event, dataitem)
    }

    let getType = false
    let getWnd = false
    let healTypes = {}
    let wndList = {}

    if (!['medical','magic'].includes(type)) {
      getType = true
      healTypes = Object.assign(healTypes,{
        'medical':game.i18n.localize('BRP.medical'),
        'magical':game.i18n.localize('BRP.magical')
      }) 
    }
    if (!itemID) {
      let wounds = await actor.items.filter(itm=>itm.type === 'wound')
      if (wounds.length === 0) {return}
      if (wounds.length === 1) {
        itemID = wounds[0]._id
      } else {
        getWnd = true
        wounds.sort(function(a, b){
          let x = a.system.value;
          let y = b.system.value;
          if (x < y) {return 1};
          if (x > y) {return -1};
          return 0;
        });
        for (let wound of wounds) {
          let wndLoc = actor.items.get(wound.system.locId)
          let label = ""
          if (wndLoc) {
            label = wndLoc.system.displayName + "(" + wound.system.value + ")"
          } else {
            label = game.i18n.localize('BRP.general') + "(" + wound.system.value + ")"
          }
          if (wound.system.treated) {
            label = label + " " + game.i18n.localize('BRP.treated')
          } 
          wndList = Object.assign(wndList,{[wound._id]:label}) 
        }        
      }


    }
    let healing = 0
    let usage = await BRPDamage.healingAmount (game.i18n.localize('BRP.treatWound'),getType,getWnd,wndList,healTypes)
    if (usage) {
        healing = Number(usage.get('treat-wound'));
        if (getType) {type = usage.get('healType')};
        if (getWnd) {itemID = usage.get('woundId')};
    }

    const item = actor.items.get(itemID);
    let hitLoc = actor.items.get(item.system.locId)
    if (item.system.treated && type === 'medical'){
        ui.notifications.warn(game.i18n.localize('BRP.woundTreated'));
        return;
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
    let usage = await BRPDamage.healingAmount (game.i18n.localize('BRP.naturalHealing'),false,false)
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
  static async healingAmount (title,getType,getWnd,wndList,healTypes) {
      const html = await renderTemplate(
      'systems/brp/templates/dialog/treatWound.html',
      {getType,
       getWnd,
       wndList,
       healTypes 
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

  //Get New Wound Dialog
  static async getWoundForm (getDam,getLoc,name,locs) {
    let title = game.i18n.localize('BRP.addWound') +": "+name;
    const html = await renderTemplate(
      'systems/brp/templates/dialog/newWound.html',
      {getDam,
       getLoc,
       locs 
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
                html[0].querySelector('#new-wound-form')
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

  //Treat Wound by UUID
  static async applyHealing(woundUuid,successLevel){
    let wound = await fromUuid (woundUuid)
    let actor = wound.parent
    let healing = 0
    let healingForm = ""
    successLevel = 0
    switch (successLevel) {
      case 0:
        //Fumble - create a wound
        let locationId = "total"
        if (game.settings.get('brp','useHPL')) {
          locationId = await (actor.items.filter(itm=>itm.type === 'hit-location').filter(nItm=>nItm.system.locType === 'general'))[0]._id
        } 
        //If GM create wound routine, otherwise call socket so GM creates wound
        if (game.user.isGM){
          await BRPDamage.firstAidFumble ([actor._id],[actor.type],locationId)
        } else {
          const availableGM = game.users.find(d => d.active && d.isGM)?.id
          if (availableGM) {
            game.socket.emit('system.brp', {
              type: 'firstAidFumble',
              to: availableGM,
              value: {actorId:actor._id, actorType: actor.type,locationId}
            })
          } else {
            ui.notifications.warn(game.i18n.localize('BRP.noAvailableGM'))     
          }
        }
        healing = -1                     
        break
      case 2:
        //Success
        healingForm = "1D3"
        break
      case 3:
        //Special Success
        healingForm = "2D3"
        break
      case 4:
        //Critical Success  
        healingForm = "1D3+3"
        break
    }
      if (healingForm != "") {
        let healRoll = new Roll(healingForm)
        await healRoll.evaluate()
        healing = Number(healRoll.total)
        if (game.modules.get('dice-so-nice')?.active) {
          game.dice3d.showForRoll(healRoll,game.user,true,null,false)  //Roll,user,sync,whispher,blind
        } 
      }

      if (healing >= wound.system.value) {
        wound.delete();      
        actor.render(true)
      } else {
        await wound.update ({
          'system.treated': true,
          'system.value': wound.system.value - healing
        })
        actor.render(true)
      }

    return {value:healing, formula:healingForm}
  }

  //Create First Aid Fumble Wound
  static async firstAidFumble (actorId, actorType,locationId) {
    
    let actor =await BRPactorDetails._getParticipant(actorId,actorType)
    const itemData = {
      name: game.i18n.localize('BRP.wound'),
      type: 'wound',
      system: {
        locId: locationId,
        value: 1        
      }
    };
    const newItem = await Item.create(itemData, {parent: actor});
    let key = await game.system.api.brpid.guessId(newItem)
    await newItem.update({'flags.brp.brpidFlag.id': key,
                         'flags.brp.brpidFlag.lang': game.i18n.lang,
                         'flags.brp.brpidFlag.priority': 0})     
    console.log(newItem)
  }

}

