import { BRPCheck } from './check.mjs';
import { isCtrlKey } from './helper.mjs'

export class BRPRollType {

  //Roll Types
  //CH = Characteristic
  //SK = Skill
  //DM = Damage
  //CM = Combat
  //AR = Armour (Random)
  //AL = Allegiance Roll
  //PA - Passion Roll
  //PT - Personality Trait Roll
  //RP - Reputation Roll
  //IM - Spell Impact Roll
  //QC - Quick Combat

  //Card Types
  //NO = Normnal Roll
  //RE = Resistance Roll (CH only)
  //PP = POW v POW (CH only)
  //GR = Combined (Group) Roll
  //CO = Cooperative Roll
  //OP = Opposed Roll
  //CB = Combat Roll


  //Start Characteristic Roll
  static async _onStatRoll(event, detail, actor) {
    let altKey = event.altKey;
    let ctrlKey = isCtrlKey(event ?? false);
    let shiftKey = event.shiftKey
    let cardType = 'NO';
    let characteristic = detail.characteristic;
    if (ctrlKey) { cardType = 'RE' }
    if (altKey) {
      cardType = 'PP';
      characteristic = 'pow'
    }
    if (game.settings.get('brp', 'switchShift')) {
      shiftKey = !shiftKey
    }
    BRPCheck._trigger({
      rollType: 'CH',
      cardType,
      characteristic,
      shiftKey: shiftKey,
      actor: actor,
      token: actor.token
    })
  }

  //Start Skill Roll
  static async _onSkillRoll(event, detail, actor) {
    let altKey = event.altKey;
    let ctrlKey = isCtrlKey(event ?? false);
    let shiftKey = event.shiftKey
    let cardType = 'NO';
    let skillId = event.target.closest('.item').dataset.itemId;
    if (ctrlKey) { cardType = 'OP' }
    if (altKey) { cardType = 'GR' }
    if (altKey && ctrlKey) { cardType = 'CO' }
    if (game.settings.get('brp', 'switchShift')) {
      shiftKey = !shiftKey
    }
    BRPCheck._trigger({
      rollType: 'SK',
      cardType,
      skillId,
      shiftKey: shiftKey,
      actor: actor,
      token: actor.token
    })
  }

  //Start Allegiance Roll
  static async _onAllegianceRoll(event, detail, actor) {
    let cardType = 'NO';
    let skillId = event.target.closest('.item').dataset.itemId;
    let shiftKey = event.shiftKey
    if (game.settings.get('brp', 'switchShift')) {
      shiftKey = !shiftKey
    }
    BRPCheck._trigger({
      rollType: 'AL',
      cardType,
      skillId,
      shiftKey: shiftKey,
      actor: actor,
      token: actor.token
    })
  }

  //Start Passion Roll
  static async _onPassionRoll(event, detail, actor) {
    let ctrlKey = isCtrlKey(event ?? false);
    let shiftKey = event.shiftKey
    let cardType = 'NO';
    let skillId = event.target.closest('.item').dataset.itemId;
    if (ctrlKey) { cardType = 'OP' }
    if (game.settings.get('brp', 'switchShift')) {
      shiftKey = !shiftKey
    }
    BRPCheck._trigger({
      rollType: 'PA',
      cardType,
      skillId,
      shiftKey: shiftKey,
      actor: actor,
      token: actor.token
    })
  }

  //Start Reputation Roll
  static async _onReputationRoll(event, detail, actor) {
    let ctrlKey = isCtrlKey(event ?? false);
    let altKey = event.altKey;
    let shiftKey = event.shiftKey
    let cardType = 'NO';
    let skillId = event.target.closest('.item').dataset.itemId;
    if (ctrlKey) { cardType = 'OP' }
    if (altKey) { cardType = 'GR' }
    if (game.settings.get('brp', 'switchShift')) {
      shiftKey = !shiftKey
    }
    BRPCheck._trigger({
      rollType: 'PA',
      cardType,
      skillId,
      shiftKey: shiftKey,
      actor: actor,
      token: actor.token
    })
  }

  //Start Personality Trait Roll
  static async _onPersTraitRoll(event, detail, actor) {
    let ctrlKey = isCtrlKey(event ?? false);
    let shiftKey = event.shiftKey
    let cardType = 'NO';
    let skillId = event.target.closest('.item').dataset.itemId;
    let opp = detail.opp;
    if (ctrlKey) { cardType = 'OP' }
    if (game.settings.get('brp', 'switchShift')) {
      shiftKey = !shiftKey
    }
    BRPCheck._trigger({
      rollType: 'PT',
      cardType,
      skillId,
      shiftKey: shiftKey,
      actor: actor,
      token: actor.token,
      opp
    })
  }


  //Start Damage Roll
  static async _onDamageRoll(event, detail, actor) {
    let itemId = event.target.closest('.item').dataset.itemId;
    let cardType = 'NO'
    BRPCheck._trigger({
      rollType: 'DM',
      cardType,
      itemId,
      actor: actor,
      token: actor.token
    })
  }

  //Magic Spell Impact Roll
  static async _onImpactRoll(event, detail, actor) {
    let itemId = event.target.closest('.item').dataset.itemId;
    let cardType = 'NO'
    BRPCheck._trigger({
      rollType: 'IM',
      cardType,
      itemId,
      actor: actor,
      token: actor.token
    })
  }



  //Start Weapon Skill Roll
  static async _onWeaponRoll(event, detail, actor) {
    let itemId = event.target.closest('.item').dataset.itemId;
    let skillId = event.target.closest('.item').dataset.skillId;
    let shiftKey = event.shiftKey
    let rollType = 'CM'
    let cardType = 'CB'
    if (game.settings.get('brp', 'quickCombat') && shiftKey) {
      rollType = 'QC'
      cardType = "NO"
      shiftKey = false
    } else if (game.settings.get('brp', 'switchShift')) {
      shiftKey = !shiftKey
    }
    BRPCheck._trigger({
      rollType,
      cardType,
      itemId,
      skillId,
      shiftKey: shiftKey,
      actor: actor,
      token: actor.token
    })
  }





  //Armour Rolling when using variable armour
  static async _onArmour(event, detail, actor) {
    let prop = detail.property
    let AVform = ""
    let label = ""
    switch (prop) {
      case "cap":
        AVform = actor.system.avr1
        label = game.i18n.localize('BRP.armour')
        break
      case "cbap":
        AVform = actor.system.avr2
        label = game.i18n.localize('BRP.ballistic')
        break
      case "ap":
        let item = actor.items.get(detail.itemId)
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
        let hitLoc = actor.items.get(event.target.closest('.item').dataset.itemId)
        if (prop === 'nap') {
          AVform = hitLoc.system.apRnd
          label = hitLoc.name + ": " + game.i18n.localize('BRP.armour')
        } else {
          AVform = hitLoc.system.bapRnd
          label = hitLoc.name + ": " + game.i18n.localize('BRP.ballistic')
        }
        break
      case "ncap":
        AVform = actor.system.apRnd
        label = game.i18n.localize('BRP.armour')
        break
      case "ncbap":
        AVform = actor.system.bapRnd
        label = game.i18n.localize('BRP.ballistic')
        break
      default:
        return
    }
    //If the Armour Value is blank then don't make the roll

    if (AVform === "") { return }
    BRPCheck._trigger({
      rollType: 'AR',
      cardType: 'NO',
      label,
      AVform,
      actor: actor,
      token: actor.token
    })
  }



}
