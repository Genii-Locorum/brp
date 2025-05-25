
import { BRPCharacterSheet } from "./actor/sheets/character.mjs";
import { BRPHooks } from './hooks/index.mjs'
import { BRPSystemSocket } from "./apps/socket.mjs"
import { BRPUtilities } from "./apps/utilities.mjs"
import { BRPMenu } from "./setup/menu.mjs"
import * as Chat from "./apps/chat.mjs";
import Init from './hooks/init.mjs';
import renderSceneControls from "./hooks/render-scene-controls.mjs";



Hooks.once('init', Init);

//Turn sockets on
Hooks.on('ready', async () => {
  game.socket.on('system.brp', async data => {
    BRPSystemSocket.callSocket(data)
  });
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


