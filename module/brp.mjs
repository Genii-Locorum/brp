import { BRPActor } from "./actor/actor.mjs";
import { BRPItem } from "./item/item.mjs";
import { preloadHandlebarsTemplates } from "./setup/templates.mjs";
import { handlebarsHelper } from './setup/handlebar-helper.mjs';
import { BRP } from "./setup/config.mjs";
import { BRPHooks } from './hooks/index.mjs'
import { registerSettings } from './setup/register-settings.mjs'
import { BRPSystemSocket } from "./apps/socket.mjs"
import { BRPCharDev } from "./apps/charDev.mjs"
import { BRPLayer } from "./setup/layers.mjs"
import * as Chat from "./apps/chat.mjs";

//  Init Hook
Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.brp = {
    BRPActor,
    BRPItem,
    rollItemMacro
  };

  // Add custom constants for configuration.
  CONFIG.BRP = BRP;

  //Register Settings & Handlebar Helpers
  registerSettings();
  handlebarsHelper();

  // Define custom Document classes
  CONFIG.Actor.documentClass = BRPActor;
  CONFIG.Item.documentClass = BRPItem;

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

// Set Up Layers for Toolbar
const layers = { BRPgmtools: { layerClass: BRPLayer, group: "primary" } };
CONFIG.Canvas.layers = foundry.utils.mergeObject(Canvas.layers, layers);

//Turn sockets on
Hooks.on('ready', async () => {
  game.socket.on('system.brp', async data => {
    BRPSystemSocket.callSocket(data)
  });
});

//Remove certain Items types from the list of options to create under the items menu (can still be created directly from the character sheet)
Hooks.on("renderDialog", (dialog, html) => {
  let deprecatedTypes = ["wound"]; // 
  Array.from(html.find("#document-create option")).forEach(i => {
      if (deprecatedTypes.includes(i.value))
      {
          i.remove()
      }
  })
})

// Ready Hook
Hooks.once("ready", async function() {
  // Always reset GM Tool toggles to False
  if (game.user.isGM) {
    if (game.settings.get('brp' , 'development')) {game.settings.set('brp','development', false)};
  }  

  Hooks.on("hotbarDrop", (bar, data, slot) => {
    if (game.user) {
      createItemMacro(data, slot);
      return false;
    }
  }); 
});

BRPHooks.listen()

//Add Chat Log Hooks
Hooks.on('renderChatLog', (app, html, data) => Chat.addChatListeners(html));

//Add sub-titles in Config Settings for BRP- Advanced Rules
Hooks.on('renderSettingsConfig', (app, html, options) => {
  const systemTab = $(app.form).find('.tab[data-tab=system]')

  systemTab
    .find('input[name=brp\\.magic]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.powers') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.useHPL]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.optionalRules') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.diffValue]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.rollOptions') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.hpMod]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.gameModifiers') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.autoXP]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.xpModifiers') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.starterSkills]')
    .closest('div.form-group')
    .before(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.customise') +
        '</h3>'
    )
});

//Add GM controls to Scene - first bit is adding the GM Tools button
Hooks.on('getSceneControlButtons', (buttons) => {
  if(game.user.isGM) {
    const BRPGMTool = {
      icon: "fas fa-tools",
      layer: "BRPgmtools",
      name: "BRPgmtools",
      title: game.i18n.localize('BRP.gmTools'),
      tools: [],
      visible: true
    };

    // This adds a sub-button - the Development Phase - same as WinterPhase but without the year and history changes
    BRPGMTool.tools.push({
      name: "Development",
      icon: "fas fa-chevrons-up",
      title:  game.i18n.localize('BRP.developmentPhase'),
      active: game.settings.get('brp','development'),
      toggle: true,
      onClick: async toggle => await BRPCharDev.developmentPhase(toggle)
    });
       buttons.push(BRPGMTool);
    };
  })

// Hotbar Macros
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== "Item") return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn("You can only create macro buttons for owned Items");
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.brp.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: { "brp.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

// Create a Macro from an Item drop.
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then(item => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
    }

    // Trigger the item roll
    item.roll();
  });
}