import {BRPCheck } from './check.mjs';
import {isCtrlKey} from './helper.mjs'

export class BRPRollType {

 //Start Characteristic Roll
static async _onStatRoll(event){
    let altKey = event.altKey;
    let ctrlKey = isCtrlKey(event ?? false);
    let cardType = 'NO';
    let characteristic = event.currentTarget.dataset.characteristic;
    if (ctrlKey){ cardType='RE'}
    if (altKey){ 
      cardType='PP';
      characteristic='pow'
    }
    if (game.settings.get('brp','switchShift')) {
        event.shiftKey = !event.shiftKey
    }
    BRPCheck._trigger({
        rollType: 'CH',
        cardType,
        characteristic,
        shiftKey: event.shiftKey,
        actor: this.actor,
        token: this.token
    })
  }

  //Start Skill Roll
  static async _onSkillRoll(event){
    let altKey = event.altKey;
    let ctrlKey = isCtrlKey(event ?? false);
    let cardType = 'NO';
    let skillId = event.currentTarget.closest('.item').dataset.itemId;
    if (ctrlKey){cardType='OP'}
    if (altKey){cardType='GR'}
    if (game.settings.get('brp','switchShift')) {
        event.shiftKey = !event.shiftKey
    }
    BRPCheck._trigger({
        rollType: 'SK',
        cardType,
        skillId,
        shiftKey: event.shiftKey,
        actor: this.actor,
        token: this.token
    })
  }

  //Start Allegiance Roll
  static async _onAllegianceRoll(event){
    let cardType = 'NO';
    let skillId = event.currentTarget.closest('.item').dataset.itemId;
    if (game.settings.get('brp','switchShift')) {
        event.shiftKey = !event.shiftKey
    }
    BRPCheck._trigger({
        rollType: 'AL',
        cardType,
        skillId,
        shiftKey: event.shiftKey,
        actor: this.actor,
        token: this.token
    })
  }

  //Start Passion Roll
  static async _onPassionRoll(event){
    let ctrlKey = isCtrlKey(event ?? false);
    let cardType = 'NO';
    let skillId = event.currentTarget.closest('.item').dataset.itemId;
    if (ctrlKey){cardType='OP'}
    if (game.settings.get('brp','switchShift')) {
        event.shiftKey = !event.shiftKey
    }
    BRPCheck._trigger({
        rollType: 'PA',
        cardType,
        skillId,
        shiftKey: event.shiftKey,
        actor: this.actor,
        token: this.token
    })
  }

  //Start Personality Trait Roll
  static async _onPersTraitRoll(event){
    let ctrlKey = isCtrlKey(event ?? false);
    let cardType = 'NO';
    let skillId = event.currentTarget.closest('.item').dataset.itemId;
    let opp = event.currentTarget.dataset.opp;
    if (ctrlKey){cardType='OP'}
    if (game.settings.get('brp','switchShift')) {
        event.shiftKey = !event.shiftKey
    }
    BRPCheck._trigger({
        rollType: 'PT',
        cardType,
        skillId,
        shiftKey: event.shiftKey,
        actor: this.actor,
        token: this.token,
        opp
    })
  }


  //Start Damage Roll
  static async _onDamageRoll(event){
    let itemId = event.currentTarget.closest('.item').dataset.itemId;    
    let cardType = 'NO'
    BRPCheck._trigger({
      rollType: 'DM',
      cardType,
      itemId,
      actor: this.actor,
      token: this.token
    })
  }

  
  //Start Weapon Skill Roll
  static async _onWeaponRoll(event){
    let itemId = event.currentTarget.closest('.item').dataset.itemId;    
    let skillId = event.currentTarget.closest('.item').dataset.skillId;    
    let cardType = 'CB'
    if (game.settings.get('brp','switchShift')) {
        event.shiftKey = !event.shiftKey
    }
    BRPCheck._trigger({
      rollType: 'CM',
      cardType,
      itemId,
      skillId,
      shiftKey: event.shiftKey,
      actor: this.actor,
      token: this.token
    })
  }





  //Armour Rolling when using variable armour
  static async _onArmour (event){
    let prop = event.currentTarget.closest('.ap-name').dataset.property
    let AVform = ""
    let label=""
    switch (prop) {
      case "cap":
        AVform = this.actor.system.avr1
        label = game.i18n.localize('BRP.armour')
        break
      case "cbap":
        AVform = this.actor.system.avr2
        label = game.i18n.localize('BRP.ballistic')
        break
      case "ap":
        let item = this.actor.items.get(event.currentTarget.closest('.ap-name').dataset.itemId)
        if (event.shiftKey) {
          AVform = item.system.avr2
          label = item.name + ": " + game.i18n.localize('BRP.ballistic')
        } else {
          AVform = item.system.avr1
          label = item.name + ": " + game.i18n.localize('BRP.armour')
        }
        break
      case "nap":
      case "nbap":  
        let hitLoc = this.actor.items.get(event.currentTarget.closest('.item').dataset.itemId)           
        if (prop === 'nap') {
          AVform = hitLoc.system.apRnd
          label = hitLoc.name + ": " + game.i18n.localize('BRP.armour')
        } else {
          AVform = hitLoc.system.bapRnd
          label = hitLoc.name + ": " + game.i18n.localize('BRP.ballistic')
        }
        break
      case "ncap":
        AVform = this.actor.system.apRnd
        label = game.i18n.localize('BRP.armour')
        break
      case "ncbap":
        AVform = this.actor.system.bapRnd
        label = game.i18n.localize('BRP.ballistic')
        break  
      default:
        return
    }
    //If the Armour Value is blank then don't make the roll
    
    if(AVform===""){return}
    BRPCheck._trigger({
      rollType: 'AR',
      cardType: 'NO',
      label,
      AVform,
      actor: this.actor,
      token: this.token
    })
  }



}