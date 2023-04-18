export function registerSettings () {


  //GM Tools Settings
  game.settings.register('brp', 'sessionendEnabled', {
    name: 'End of session allowed',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'developmentEnabled', {
    name: 'Dev phased allowed',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'characterCreation', {
    name: 'Character creation allowed',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  });

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

  game.settings.register('brp', 'useMjrWnd', {
    name: 'BRP.Settings.useMjrWnd',
    hint: 'BRP.Settings.useMjrWndHint',
    scope: 'world',
    config: true,
    default: true,
    type: Boolean
  });

  game.settings.register('brp', "powerLevel", {
    name: "BRP.powerLevel.label",
    hint: "BRP.powerLevel.hint",
    scope: "world",
    config: true,
    type: String,
    choices: CONFIG.BRP.powerLevels,
    default: 0
  });

}


