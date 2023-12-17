import { BRPSelectLists } from "../apps/select-lists.mjs";

export async function registerSettings () {

  //Get option lists from select-lists.mjs
  let skillBonusOptions = await BRPSelectLists.getSkillBonusOptions();



  //Optional Statistics

  game.settings.register('brp', 'magic', {
    name: 'BRP.Settings.useMagic',
    hint: 'BRP.Settings.useMagicHint',
    scope: 'world',
    requiresReload: true,
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('brp', 'mutation', {
    name: 'BRP.Settings.useMutation',
    hint: 'BRP.Settings.useMutationHint',
    scope: 'world',
    requiresReload: true,
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('brp', 'psychic', {
    name: 'BRP.Settings.usePsychic',
    hint: 'BRP.Settings.usePsychicHint',
    scope: 'world',
    requiresReload: true,
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('brp', 'sorcery', {
    name: 'BRP.Settings.useSorcery',
    hint: 'BRP.Settings.useSorceryHint',
    scope: 'world',
    requiresReload: true,
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('brp', 'super', {
    name: 'BRP.Settings.useSuper',
    hint: 'BRP.Settings.useSuperHint',
    scope: 'world',
    requiresReload: true,
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('brp', 'useHPL', {
    name: 'BRP.Settings.useHPL',
    hint: 'BRP.Settings.useHPLHint',
    scope: 'world',
    requiresReload: true,
    config: true,
    type: Boolean,
    default: false,
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
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });
    
  game.settings.register('brp', 'useFP', {
    name: 'BRP.Settings.useFP',
    hint: 'BRP.Settings.useFPHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });
    
  game.settings.register('brp', 'useMP', {
    name: 'BRP.Settings.useMP',
    hint: 'BRP.Settings.useMPHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', "skillBonus", {
    name: "BRP.Settings.skillBonus",
    hint: "BRP.Settings.skillBonusHint",
    requiresReload: true,
    scope: "world",
    config: true,
    type: String,
    choices: skillBonusOptions,
    default: 0
  });

  game.settings.register('brp', 'useAVRand', {
    name: 'BRP.Settings.useAVRand',
    hint: 'BRP.Settings.useAVRandHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'hpMod', {
    name: 'BRP.Settings.hpMod',
    hint: 'BRP.Settings.hpModHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: 1,
    type: Number,
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
}

