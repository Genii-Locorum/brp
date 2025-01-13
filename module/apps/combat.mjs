import { BRPSelectLists } from "./select-lists.mjs"
import { BRPCheck } from "../apps/check.mjs"

export class BRPCombat{

  //Get damage formula from weapon/spell and actor
  static async damageFormula(weapon, actor,type) {

    let damage = ""
    let damageBonus = ""
    let askHands = false
    let askRange = false
    let askSuccess = true
    let askLevel = false
    let successOptions = await BRPSelectLists.getSuccessOptions()
    let range = ""
    let hands = ""
    let success = ""
    let level = 1
    let damData = {}
    let handOptions = {}
    let rangeOptions = {}
    let label = game.i18n.localize('BRP.damage')

    //If this is a weapon Damage Roll
    if (type === 'DM') {
      //Get the damage
      damage = weapon.system.dmg1
      //Get weapon range Options
      rangeOptions = Object.assign(rangeOptions,{
        dmg1: game.i18n.localize("BRP.range") +":"+weapon.system.range1,
        dmg2: game.i18n.localize("BRP.range") +":"+weapon.system.range2,
      })
      //Get weapon Hand Options
      handOptions = Object.assign(handOptions,{
        1: game.i18n.localize("BRP.1H"),
        2: game.i18n.localize("BRP.2H"),
      })
      //If there's a third weapon range add it
      if (weapon.system.range3 !=""){
        rangeOptions= Object.assign(rangeOptions,{
          dmg3: game.i18n.localize("BRP.range") +":"+weapon.system.range3
        })
      }
      //If there is more than one weapon range then make sure we ask for the range
      if (weapon.system.range2 != ""){askRange = true}
      //If there the weapon is 1-2H then ask how many hands used
      if (weapon.system.hands === "1-2H"){askHands = true}


    //If this is a magic spell impact roll  
    } else if (type === 'IM') {
      damage = weapon.system.damage
      //If no impact then return
      if (damage === "" || weapon.system.impact === 'other') {return}
      label = game.i18n.localize('BRP.'+weapon.system.impact)
      askLevel = true
    //If not weapon damage or spell impact then return  
    } else {return}
         

    if (askRange || askHands || askSuccess || askLevel) {
      damData = {
        rollType: type,
        label: label,
        rangeOptions,
        handOptions,
        successOptions,
        askHands,
        askRange,
        askSuccess,
        askLevel,
        dialogTemplate: 'systems/brp/templates/dialog/damageDiff.html'  
      }  

      let usage = await BRPCheck.RollDialog(damData)
      if (usage) {
        range = usage.get('range')
        hands = usage.get('hands')
        success = usage.get('success')
        level = Number(usage.get('level'))
      }

      //If you've asked the range then get adjust damage for it
      if (askRange){
        damage = weapon.system[range]
      }

      //If you asked the spell level then adjust damage for it
      if (askLevel){
        let tempdam = ""
        for (let damlevel = 1; damlevel<=level; damlevel++) {
          tempdam = tempdam + "+" + damage
        }
        damage = tempdam
      }
    }
    
    //Work out damage bonus for Damage rolls
    if (type === 'DM') {
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
    }


    //Work out damage formula based on weapon damage, damage bonus, success level and weapon special 
    //damage = damage + damageBonus
    damage = await BRPCombat.damageAssess (weapon, damage, damageBonus, success,type)     

    let damageData = ({ damage, success })
    return damageData
  }

  static async damageAssess (weapon, damForm, damBon, success,type) {

    let newFormula = ""
    let specialType = "other"

    //If a Critical then set new formula to be max damage + damage bonus
    if (success === "4") {
      // newFormula = (new Roll(damForm).evaluate({ maximize: true }).total) + damBon
      newFormula = new Roll(damForm)
      newFormula = await newFormula.evaluate({ maximize: true })
      newFormula = newFormula.total + damBon
      if (type === 'DM') {
        specialType = weapon.system.special 
      }
    } else if (success === "3") {
      switch (specialType) {
        case 'crush':
        case 'crushknock':  
          if (damBon.startsWith('-')) {
            newFormula = damForm
          } else if (damBon === '+0') {
            newFormula = damForm + '+1D4'
          } else {
            newFormula = damForm + damBon + damBon  
          }
          break
        case 'impale':
        case 'impknock':
            newFormula = damForm + "+" + damForm + damBon
          break
        default:
          newFormula = damForm + damBon  
      } 
    } else {newFormula = damForm + damBon}

    return newFormula
  }


} 