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
import { BRPPersTraitSheet } from '../item/sheets/persTrait.mjs'
import { BRPReputationSheet } from '../item/sheets/reputation.mjs'
import { BRPRollTableConfig } from '../sheets/brp-roll-table-config.mjs'
import { BRPJournalSheet } from '../sheets/brp-journal-sheet.mjs'
import { BRPSkillCategory } from '../item/sheets/skillcat.mjs'
import { BRPCultureSheet } from '../item/sheets/culture.mjs'


export function registerSheets() {
  foundry.documents.collections.Actors.unregisterSheet("core", foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet('brp', BRPCharacterSheet, {
    types: ['character'],
    makeDefault: true
  })

  foundry.documents.collections.Actors.registerSheet('brp', BRPNpcSheet, {
    types: ['npc'],
    makeDefault: true
  })

  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet)
  foundry.documents.collections.Items.registerSheet('brp', BRPGearSheet, {
    types: ['gear'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPSkillSheet, {
    types: ['skill'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPHitLocSheet, {
    types: ['hit-location'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPPersonalitySheet, {
    types: ['personality'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPProfessionSheet, {
    types: ['profession'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPPowerSheet, {
    types: ['power'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPMagicSheet, {
    types: ['magic'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPMutationSheet, {
    types: ['mutation'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPPsychicSheet, {
    types: ['psychic'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPSorcerySheet, {
    types: ['sorcery'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPSuperSheet, {
    types: ['super'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPFailingSheet, {
    types: ['failing'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPPowerModSheet, {
    types: ['powerMod'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPArmourSheet, {
    types: ['armour'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPWeaponSheet, {
    types: ['weapon'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPWoundSheet, {
    types: ['wound'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPAllegianceSheet, {
    types: ['allegiance'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPPassionSheet, {
    types: ['passion'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPPersTraitSheet, {
    types: ['persTrait'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPReputationSheet, {
    types: ['reputation'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPSkillCategory, {
    types: ['skillcat'],
    makeDefault: true
  })

  foundry.documents.collections.Items.registerSheet('brp', BRPCultureSheet, {
    types: ['culture'],
    makeDefault: true
  })

  foundry.documents.collections.RollTables.unregisterSheet('core', foundry.applications.sheets.RollTableSheet)
  foundry.documents.collections.RollTables.registerSheet('brp', BRPRollTableConfig, {
    makeDefault: true
  })

  foundry.documents.collections.Journal.unregisterSheet('core', foundry.appv1.sheets.JournalSheet)
  foundry.documents.collections.Journal.registerSheet('brp', BRPJournalSheet, {
    makeDefault: true
  })
}
