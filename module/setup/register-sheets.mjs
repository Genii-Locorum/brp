import { BRPPersonalitySheet } from '../item/sheets/personality.mjs' 
import { BRPProfessionSheet } from '../item/sheets/profession.mjs' 
import { BRPSkillSheet } from '../item/sheets/skill.mjs' 
import { BRPHitLocSheet } from '../item/sheets/hit-location.mjs' 
import { BRPCultureSheet } from '../item/sheets/culture.mjs' 
import { BRPPowerSheet } from '../item/sheets/power.mjs' 
import { BRPGearSheet } from '../item/sheets/gear.mjs' 

export function registerSheets () {
    //Actors.unregisterSheet("core", ActorSheet);
    //Actors.registerSheet("brp", BRPActorSheet, { makeDefault: true });


    Items.unregisterSheet('core', ItemSheet)
    Items.registerSheet('brp', BRPPersonalitySheet, {
        types: ['personality'],
        makeDefault: true
      })

    Items.registerSheet('brp', BRPProfessionSheet, {
      types: ['profession'],
      makeDefault: true
    })


    Items.registerSheet('brp', BRPSkillSheet, {
      types: ['skill'],
      makeDefault: true
    })

    Items.registerSheet('brp', BRPHitLocSheet, {
      types: ['hit-location'],
      makeDefault: true
    })

    Items.registerSheet('brp', BRPCultureSheet, {
      types: ['culture'],
      makeDefault: true
    })

    Items.registerSheet('brp', BRPPowerSheet, {
      types: ['power'],
      makeDefault: true
    })

    Items.registerSheet('brp', BRPGearSheet, {
      types: ['gear'],
      makeDefault: true
    })
}  