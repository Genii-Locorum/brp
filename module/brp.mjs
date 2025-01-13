import { BRPActor } from "./actor/actor.mjs";
import { BRPItem } from "./item/item.mjs";
import { preloadHandlebarsTemplates } from "./setup/templates.mjs";
import { handlebarsHelper } from './setup/handlebar-helper.mjs';
import { BRP } from "./setup/config.mjs";
import { BRPHooks } from './hooks/index.mjs'
import { registerSettings } from './setup/register-settings.mjs'
import { BRPSystemSocket } from "./apps/socket.mjs"
import { BRPUtilities } from "./apps/utilities.mjs"
import { BRPMenu } from "./setup/layers.mjs"
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
    game.settings.set('brp','development', false);
    game.settings.set('brp','beastiary', false);
  }  

  let initForm = game.settings.get('brp','initStat')
  let initMod = game.settings.get('brp','initMod')
  let initiative = "@stats." + initForm + ".total"
  if (initForm === 'fixed') {initiative = ""}
  if (!["+","*","/"].includes(initMod.charAt(0))) {
    initMod = "+" + initMod
  }
  initiative = initiative + initMod
console.log(initiative)

  if (!Roll.validate(initiative)) {
    ui.notifications.error(game.i18n.format('BRP.initError',{formula:initiative}))
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
    .find('input[name=brp\\.resistLevels]')
    .closest('div.form-group')
    .after(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.initiative') +
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
    .find('input[name=brp\\.hpMod]')
    .closest('div.form-group')
    .after(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.xpModifiers') +
        '</h3>'
    )

    systemTab
    .find('input[name=brp\\.xpFixed]')
    .closest('div.form-group')
    .after(
      '<h3 class="setting-header">' +
        game.i18n.localize('BRP.sceneSettings') +
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

Hooks.on('getSceneControlButtons', BRPMenu.getButtons)
Hooks.on('renderSceneControls', BRPMenu.renderControls)

// Run a Macro from an Item drop.
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