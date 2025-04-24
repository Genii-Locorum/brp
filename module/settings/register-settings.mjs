import { BRPPowerRuleSettings } from "./settings-powerRules.mjs";
import { BRPOptionalRuleSettings } from "./settings-optionalRules.mjs";
import { BRPDiceSettings } from "./settings-diceOptions.mjs";
import { BRPCombatRuleSettings } from "./settings-combatOptions.mjs";
import { BRPXPSettings } from "./settings-xpOptions.mjs";
import { BRPNPCSettings } from "./settings-NPCOptions.mjs";
import { BRPCharSettings } from "./settings-charOptions.mjs";
import { BRPGameModifiers } from "./settings-gameModifiers.mjs";
import { BRPDisplaySettings } from "./settings-displayOptions.mjs";
import { BRPbrpidSettings } from "./settings-brpidOptions.mjs";


export async function registerSettings() {

  //Power Menu Button
  game.settings.registerMenu('brp', 'powerRules', {
    name: 'BRP.Settings.powerRulesHint',
    label: 'BRP.Settings.powerRules',
    icon: 'fas fa-cloud-bolt',
    type: BRPPowerRuleSettings,
    restricted: true
  })
  BRPPowerRuleSettings.registerSettings()

  //Optional Rules Menu Button
  game.settings.registerMenu('brp', 'optionalRules', {
    name: 'BRP.Settings.optionalRulesHint',
    label: 'BRP.Settings.optionalRules',
    icon: 'fas fa-book',
    type: BRPOptionalRuleSettings,
    restricted: true
  })
  BRPOptionalRuleSettings.registerSettings()

  //Dice Options Menu Button
  game.settings.registerMenu('brp', 'diceOptions', {
    name: 'BRP.Settings.diceOptionsHint',
    label: 'BRP.Settings.diceOptions',
    icon: 'fas fa-dice',
    type: BRPDiceSettings,
    restricted: true
  })
  BRPDiceSettings.registerSettings()

  //Combat Options Menu Button
  game.settings.registerMenu('brp', 'combatOptions', {
    name: 'BRP.Settings.combatOptionsHint',
    label: 'BRP.Settings.combatOptions',
    icon: 'fas fa-swords',
    type: BRPCombatRuleSettings,
    restricted: true
  })
  BRPCombatRuleSettings.registerSettings()

  //XP Options Menu Button
  game.settings.registerMenu('brp', 'xpOptions', {
    name: 'BRP.Settings.xpOptionsHint',
    label: 'BRP.Settings.xpOptions',
    icon: 'fas fa-file-certificate',
    type: BRPXPSettings,
    restricted: true
  })
  BRPXPSettings.registerSettings()

  //NPC Options Menu Button
  game.settings.registerMenu('brp', 'npcOptions', {
    name: 'BRP.Settings.npcOptionsHint',
    label: 'BRP.Settings.npcOptions',
    icon: 'fas fa-hood-cloak',
    type: BRPNPCSettings,
    restricted: true
  })
  BRPNPCSettings.registerSettings()

  //Character Options Menu Button
  game.settings.registerMenu('brp', 'charOptions', {
    name: 'BRP.Settings.charOptionsHint',
    label: 'BRP.Settings.charOptions',
    icon: 'fas fa-helmet-battle',
    type: BRPCharSettings,
    restricted: true
  })
  BRPCharSettings.registerSettings()

  //Game Modifiers Menu Button
  game.settings.registerMenu('brp', 'gameMods', {
    name: 'BRP.Settings.gameModsHint',
    label: 'BRP.Settings.gameMods',
    icon: 'fas fa-abacus',
    type: BRPGameModifiers,
    restricted: true
  })
  BRPGameModifiers.registerSettings()

  //Display Settings Button
  game.settings.registerMenu('brp', 'displayOptions', {
    name: 'BRP.Settings.displayOptionsHint',
    label: 'BRP.Settings.displayOptions',
    icon: 'fas fa-palette',
    type: BRPDisplaySettings,
    restricted: true
  })
  BRPDisplaySettings.registerSettings()

  //BRPID Settings Button
  game.settings.registerMenu('brp', 'brpidOptions', {
    name: 'BRP.Settings.brpidOptionsHint',
    label: 'BRP.Settings.brpidOptions',
    icon: 'fas fa-fingerprint',
    type: BRPbrpidSettings,
    restricted: true
  })
  BRPbrpidSettings.registerSettings()

  game.settings.register('brp', "switchShift", {
    name: "BRP.Settings.switchShift",
    hint: "BRP.Settings.switchShiftHint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
  });

  //Invisible Game Settings
  game.settings.register('brp', "development", {
    name: "",
    hint: "",
    scope: "world",
    requiresReload: false,
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register('brp', "beastiary", {
    name: "",
    hint: "",
    scope: "world",
    requiresReload: false,
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register('brp', "gameVersion", {
    name: "",
    hint: "",
    scope: "world",
    requiresReload: false,
    config: false,
    type: String,
    default: "12.1.36"
  });

}

