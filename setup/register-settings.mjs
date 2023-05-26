export function registerSettings () {

  //Game Settings

  game.settings.register('brp', 'pointsMethod', {
    name: 'BRP.Settings.pointsMethod',
    hint: 'BRP.Settings.pointsMethodHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'ignoreAge', {
    name: 'BRP.Settings.ignoreAge',
    hint: 'BRP.Settings.ignoreAgeHint',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'useEDU', {
    name: 'BRP.Settings.useEDU',
    hint: 'BRP.Settings.useEDUHint',
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

  game.settings.register('brp', 'hpMod', {
    name: 'BRP.Settings.hpMod',
    hint: 'BRP.Settings.hpModHint',
    scope: 'world',
    config: true,
    default: 1,
    type: Number,
  });

  game.settings.register('brp', 'useMjrWnd', {
    name: 'BRP.Settings.useMjrWnd',
    hint: 'BRP.Settings.useMjrWndHint',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
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

}


