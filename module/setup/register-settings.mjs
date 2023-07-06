export function registerSettings () {

  //Game Settings

  game.settings.register('brp', "powerLevel", {
    name: "BRP.powerLevel.label",
    hint: "BRP.powerLevel.hint",
    scope: "world",
    requiresReload: true,
    config: true,
    type: String,
    choices: CONFIG.BRP.powerLevels,
    default: 0
  });

  game.settings.register('brp', 'useHPL', {
    name: 'BRP.Settings.useHPL',
    hint: 'BRP.Settings.useHPLHint',
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('brp', "skillBonus", {
    name: "BRP.skillBonus.label",
    hint: "BRP.skillBonus.hint",
    scope: "world",
    config: true,
    type: String,
    choices: CONFIG.BRP.skillBonus,
    default: 0
  });


  //Optional Rules

  game.settings.register('brp', 'pointsMethod', {
    name: 'BRP.Settings.pointsMethod',
    hint: 'BRP.Settings.pointsMethodHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'useEDU', {
    name: 'BRP.Settings.useEDU',
    hint: 'BRP.Settings.useEDUHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'useSAN', {
    name: 'BRP.Settings.useSAN',
    hint: 'BRP.Settings.useSANHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'useFP', {
    name: 'BRP.Settings.useFP',
    hint: 'BRP.Settings.useFPHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'useMP', {
    name: 'BRP.Settings.useMP',
    hint: 'BRP.Settings.useMPHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'healMod', {
    name: 'BRP.Settings.healMod',
    hint: 'BRP.Settings.healModHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'hpMod', {
    name: 'BRP.Settings.hpMod',
    hint: 'BRP.Settings.hpModHint',
    scope: 'world',
    config: true,
    default: 1,
    type: Number,
  });

  game.settings.register('brp', 'usePers', {
    name: 'BRP.Settings.usePers',
    hint: 'BRP.Settings.usePersHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register('brp', 'enhancedPSP', {
    name: 'BRP.Settings.enhancedPSP',
    hint: 'BRP.Settings.enhancedPSPHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register('brp', 'ignoreAge', {
    name: 'BRP.Settings.ignoreAge',
    hint: 'BRP.Settings.ignoreAgeHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });
  
  game.settings.register('brp', "background1", {
    name: "BRP.Settings.background1",
    hint: "BRP.Settings.backgroundHint",
    scope: "world",
    config: true,
    type: String,
    default: "Background"
  });

  game.settings.register('brp', "background2", {
    name: "BRP.Settings.background2",
    hint: "BRP.Settings.backgroundHint",
    scope: "world",
    config: true,
    type: String,
    default: "Biography"
  });

  game.settings.register('brp', "background3", {
    name: "BRP.Settings.background3",
    hint: "BRP.Settings.backgroundHint",
    scope: "world",
    config: true,
    type: String,
    default: "Backstory"
  });

  // Derived Settings - not visible to users - see varaible-settings.mjs

  game.settings.register('brp', "xpFormula", {
    name: "BRP.Settings.xpFormula",
    scope: "world",
    config: false,
    type: String,
    default: '1d6'
  });

  game.settings.register('brp', "xpFixed", {
    name: "BRP.Settings.xpFixed",
    scope: "world",
    config: false,
    type: Number,
    default: 3
  });

    game.settings.register('brp', "PSPMulti", {
    name: "BRP.Settings.PSPMulti",
    scope: "world",
    config: false,
    type: Number,
    default: 10
  });

  game.settings.register('brp', "profEDU", {
    name: "BRP.Settings.ProfEDU",
    scope: "world",
    config: false,
    type: Number,
    default: 20
  });

  game.settings.register('brp', "profAge", {
    name: "BRP.Settings.ProfAge",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });

  game.settings.register('brp', "profStandard", {
    name: "BRP.Settings.ProfStandard",
    scope: "world",
    config: false,
    type: Number,
    default: 250
  });

  game.settings.register('brp', "skillCap", {
    name: "BRP.Settings.skilLCap",
    scope: "world",
    config: false,
    type: Number,
    default: 75
  });

}


