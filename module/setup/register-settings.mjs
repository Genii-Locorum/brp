import { BRPSelectLists } from "../apps/select-lists.mjs";


export async function registerSettings () {

  //Get option lists from select-lists.mjs
  let skillBonusOptions = await BRPSelectLists.getSkillBonusOptions();
  let reputationOptions = await BRPSelectLists.getReputationOptions();


  //Allow Powers
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

  //Optional Rules
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

  game.settings.register('brp', 'useAlleg', {
    name: 'BRP.Settings.useAlleg',
    hint: 'BRP.Settings.useAllegHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'usePassion', {
    name: 'BRP.Settings.usePassion',
    hint: 'BRP.Settings.usePassionHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  game.settings.register('brp', 'useReputation', {
    name: 'BRP.Settings.useReputation',
    hint: 'BRP.Settings.useReputationHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: 0,
    choices: reputationOptions,
    type: String
  });

  game.settings.register('brp', 'usePersTrait', {
    name: 'BRP.Settings.usePersTrait',
    hint: 'BRP.Settings.usePersTraitHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });

  //Dice Roll Options
  game.settings.register('brp', 'diffValue', {
    name: 'BRP.Settings.diffValue',
    hint: 'BRP.Settings.diffValueHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register('brp', 'allowImp', {
    name: 'BRP.Settings.allowImp',
    hint: 'BRP.Settings.allowImpHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register('brp', 'resistRoll', {
    name: 'BRP.Settings.resistRoll',
    hint: 'BRP.Settings.resistRollHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register('brp', 'resistLevels', {
    name: 'BRP.Settings.resistLevels',
    hint: 'BRP.Settings.resistLevelsHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  //Game Modifiers
  game.settings.register('brp', 'hpMod', {
    name: 'BRP.Settings.hpMod',
    hint: 'BRP.Settings.hpModHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: 1,
    type: Number,
  });

  //XP Modifiers
  game.settings.register('brp', 'autoXP', {
    name: 'BRP.Settings.autoXP',
    hint: 'BRP.Settings.autoXPHint',
    requiresReload: true,
    scope: 'world',
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register('brp', "xpFormula", {
    name: "BRP.Settings.xpFormula",
    hint: 'BRP.Settings.xpFormulaHint',
    scope: "world",
    config: true,
    type: String,
    default: '1D6'
  });

  game.settings.register('brp', "xpFixed", {
    name: "BRP.Settings.xpFixed",
    hint: 'BRP.Settings.xpFixedHint',
    scope: "world",
    config: true,
    type: Number,
    default: 3
  });

  //Configuration
  game.settings.register('brp', "starterSkills", {
    name: "BRP.Settings.starterSkills",
    hint: "BRP.Settings.starterSkillsHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register('brp', "switchShift", {
    name: "BRP.Settings.switchShift",
    hint: "BRP.Settings.switchShiftHint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false
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

  game.settings.register('brp', "charSheetLogo", {
    name: "BRP.Settings.charSheetLogo",
    hint: "BRP.Settings.charSheetLogoHint",
    requiresReload: true,
    scope: "world",
    config: true,
    type: String,
    filePicker: 'Image',
    default: 'systems/brp/assets/char-sheet-logo.png',
  });

  //Invisible Game Settings 
  game.settings.register('brp', "development", {
    name: "",
    hint: "",
    scope: "world",
    requiresReload:false,
    config: false,
    type: Boolean,
    default: false
  });

  game.settings.register('brp', "beastiary", {
    name: "",
    hint: "",
    scope: "world",
    requiresReload:false,
    config: false,
    type: Boolean,
    default: false
  });

}

