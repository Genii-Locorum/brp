
import { BRPCharacterSheet } from "./actor/sheets/character.mjs";
import { BRPHooks } from './hooks/index.mjs'
import { BRPSystemSocket } from "./apps/socket.mjs"
import { BRPUtilities } from "./apps/utilities.mjs"
import { BRPMenu } from "./setup/menu.mjs"
import * as Chat from "./apps/chat.mjs";
import Init from './hooks/init.mjs';
import renderSceneControls from "./hooks/render-scene-controls.mjs"
import RenderRegionConfig from './hooks/render-region-config.mjs'
import RenderJournalEntryPageTextSheet from './hooks/render-journal-entry-page-text-sheet.mjs'
import RenderJournalEntrySheet from './hooks/render-journal-entry-sheet.mjs'
import RenderJournalSheet from './hooks/render-journal-sheet.mjs'
import RenderJournalTextPageSheet from './hooks/render-journal-text-page-sheet.mjs'
import createToken from "./hooks/create-token.mjs";
import { BRPSelectLists } from "./apps/select-lists.mjs";
import { updateWorld } from "./setup/update.mjs";

Hooks.once('init', Init);


Hooks.on('ready', async () => {
  //Turn sockets on
  game.socket.on('system.brp', async data => {
    BRPSystemSocket.callSocket(data)
  });

  //Preload certain lists
  game.brp.categories = BRPSelectLists.preLoadCategoriesCategories()

  // Determine if a system update has occured
  if (!game.user.isGM) return;
  const currentVersion = game.settings.get(
    "brp",
    "gameVersion",
  );
  const needsUpdate = foundry.utils.isNewerVersion(game.system.version, currentVersion ?? '0')
  if (needsUpdate) {
    updateWorld();
  }

});



// Ready Hook
Hooks.once("ready", async function () {
  let initForm = game.settings.get('brp', 'initStat')
  let initMod = game.settings.get('brp', 'initMod')
  let initiative = "@stats." + initForm + ".total"
  if (initForm === 'fixed') { initiative = "" }
  if (!["+", "*", "/"].includes(initMod.charAt(0))) {
    initMod = "+" + initMod
  }
  initiative = initiative + initMod

  if (!Roll.validate(initiative)) {
    ui.notifications.error(game.i18n.format('BRP.initError', { formula: initiative }))
    initiative = "@stats.dex.total+0"
  }
  CONFIG.Combat.initiative = {
    formula: initiative,
    decimals: 0
  };

  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (game.user) {
      return BRPUtilities.createMacro(bar, data, slot);
    }
  });
});

BRPHooks.listen()

//Add Chat Log Hooks
Hooks.on('getSceneControlButtons', BRPMenu.getButtons)
Hooks.on('renderSceneControls', renderSceneControls)
Hooks.on('renderActorSheet', BRPCharacterSheet.renderSheet)
Hooks.on('renderRegionConfig', RenderRegionConfig)
Hooks.on('createToken', createToken);

//Add Journal Format Hooks
Hooks.on('renderJournalEntryPageTextSheet', RenderJournalEntryPageTextSheet)
Hooks.on('renderJournalEntrySheet', RenderJournalEntrySheet)
Hooks.on('renderJournalSheet', RenderJournalSheet)
Hooks.on('renderJournalTextPageSheet', RenderJournalTextPageSheet)
