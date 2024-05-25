import { BRPCharacterSheet } from '../actor/sheets/character.mjs';
import { BRPNpcSheet } from '../actor/sheets/npc.mjs';
import { BRPGearSheet } from '../item/sheets/gear.mjs';
import { BRPSkillSheet } from '../item/sheets/skill.mjs';
import { BRPHitLocSheet } from '../item/sheets/hit-location.mjs';
import { BRPPersonalitySheet } from '../item/sheets/personality.mjs';
import { BRPProfessionSheet } from '../item/sheets/profession.mjs' 
import { BRPPowerSheet } from '../item/sheets/power.mjs' 
import { BRPMagicSheet } from '../item/sheets/magic.mjs' 
import { BRPMutationSheet } from '../item/sheets/mutation.mjs' 
import { BRPPsychicSheet } from '../item/sheets/psychic.mjs' 
import { BRPSorcerySheet } from '../item/sheets/sorcery.mjs' 
import { BRPSuperSheet } from '../item/sheets/super.mjs'
import { BRPFailingSheet } from '../item/sheets/failing.mjs' 
import { BRPPowerModSheet } from '../item/sheets/powerMod.mjs' 
import { BRPArmourSheet } from '../item/sheets/armour.mjs' 
import { BRPWeaponSheet } from '../item/sheets/weapon.mjs' 
import { BRPWoundSheet } from '../item/sheets/wound.mjs' 
import { BRPAllegianceSheet } from '../item/sheets/allegiance.mjs' 
import { BRPPassionSheet } from '../item/sheets/passion.mjs' 

export function registerSheets () {
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet('brp', BRPCharacterSheet, {
        types: ['character'],
        makeDefault: true
      })

      Actors.registerSheet('brp', BRPNpcSheet, {
        types: ['npc'],
        makeDefault: true
      })      
    
    Items.unregisterSheet('core', ItemSheet)
    Items.registerSheet('brp', BRPGearSheet, {
      types: ['gear'],
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

    Items.registerSheet('brp', BRPPersonalitySheet, {
        types: ['personality'],
        makeDefault: true
      })

    Items.registerSheet('brp', BRPProfessionSheet, {
      types: ['profession'],
      makeDefault: true
    }) 

    Items.registerSheet('brp', BRPPowerSheet, {
      types: ['power'],
      makeDefault: true
    }) 
    
    Items.registerSheet('brp', BRPMagicSheet, {
      types: ['magic'],
      makeDefault: true
    })  
        
    Items.registerSheet('brp', BRPMutationSheet, {
      types: ['mutation'],
      makeDefault: true
    })  
            
    Items.registerSheet('brp', BRPPsychicSheet, {
      types: ['psychic'],
      makeDefault: true
    }) 
                
    Items.registerSheet('brp', BRPSorcerySheet, {
      types: ['sorcery'],
      makeDefault: true
    })  

    Items.registerSheet('brp', BRPSuperSheet, {
      types: ['super'],
      makeDefault: true
    })  
    
    Items.registerSheet('brp', BRPFailingSheet, {
      types: ['failing'],
      makeDefault: true
    })  

    Items.registerSheet('brp', BRPPowerModSheet, {
      types: ['powerMod'],
      makeDefault: true
    })  

    Items.registerSheet('brp', BRPArmourSheet, {
      types: ['armour'],
      makeDefault: true
    })  

    Items.registerSheet('brp', BRPWeaponSheet, {
      types: ['weapon'],
      makeDefault: true
    })  
    
    Items.registerSheet('brp', BRPWoundSheet, {
      types: ['wound'],
      makeDefault: true
    }) 

    Items.registerSheet('brp', BRPAllegianceSheet, {
      types: ['allegiance'],
      makeDefault: true
    }) 

    Items.registerSheet('brp', BRPPassionSheet, {
      types: ['passion'],
      makeDefault: true
    }) 
}      