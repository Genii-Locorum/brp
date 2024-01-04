import { BRPSelectLists } from "./select-lists.mjs"
import { BRPCheck } from "../apps/check.mjs"

export class BRPCombat{

  //Get damage formula from weapon and actor
  static async damageFormula(weapon, actor) {
    let damage = weapon.system.dmg1
    let damageBonus = "+0"
    let askHands = false
    let askRange = false
    let askSuccess = true
    let successOptions = await BRPSelectLists.getSuccessOptions()
    let range = ""
    let hands = ""
    let success = ""
    let damData = {}
    let rangeOptions = {
                        dmg1: game.i18n.localize("BRP.range") +":"+weapon.system.range1,
                        dmg2: game.i18n.localize("BRP.range") +":"+weapon.system.range2,
                       }
    let handOptions = {
      1: game.i18n.localize("BRP.1H"),
      2: game.i18n.localize("BRP.2H"),
    }
    if (weapon.system.range3 !=""){
      rangeOptions= Object.assign(rangeOptions,{
        dmg3: game.i18n.localize("BRP.range") +":"+weapon.system.range3
      })
    }

    if (weapon.system.range2 != ""){askRange = true}
    if (weapon.system.hands === "1-2H"){askHands = true}

    if (askRange || askHands || askSuccess) {
      damData = {
        rollType: 'DM',
        label: game.i18n.localize('BRP.damage'),
        rangeOptions,
        handOptions,
        successOptions,
        askHands,
        askRange,
        askSuccess,
        dialogTemplate: 'systems/brp/templates/dialog/damageDiff.html'  
      }  
      let usage = await BRPCheck.RollDialog(damData)
      if (usage) {
        range = usage.get('range')
        hands = usage.get('hands')
        success = usage.get('success')
      }
      if (askRange){
        damage = weapon.system[range]
      }
    }

    //Work out damage bonus
    if (askHands && hands === "1"){
      damageBonus = actor.system.dmgBonus.half
    } else if (askHands && hands === "2"){
      damageBonus = actor.system.dmgBonus.full
    } else if (weapon.system.db === 'half') {
      damageBonus = actor.system.dmgBonus.half
    } else if (weapon.system.db === 'full') {
      damageBonus = actor.system.dmgBonus.full        
    } else  {
      damageBonus = ""        
    }

    //Work out damage formula based on weapon damage, damage bonus, success level and weapon special 
    //  damage = damage + damageBonus
    damage = await BRPCombat.damageAssess (weapon, damage, damageBonus, success)     

    let damageData = ({ damage, success })
    return damageData
  }

  static async damageAssess (weapon, damForm, damBon, success) {

    let newFormula = ""

    //If a Critical then set new formula to be max damage + damage bonus
    if (success === "4") {
      newFormula = (new Roll(damForm).evaluate({ maximize: true }).total) + damBon
    } else if (success === "3") {
      switch (weapon.system.special) {
        case 'crush':
          if (damBon.startsWith('-')) {
            newFormula = damForm
          } else if (damBon === '+0+') {
            newFormula = damForm + '+1D4'
          } else {
            newFormula = damForm + damBon + damBon  
          }
          break
        case 'impale':
            newFormula = damForm + "+" + damForm + damBon
          break
        default:
          newFormula = damForm + damBon  
      } 
    } else {newFormula = damForm + damBon}

    return newFormula
  }


} 