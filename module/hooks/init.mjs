import { registerSheets } from '../setup/register-sheets.mjs'
import { BRPID } from '../brpid/brpid.mjs'
import { BRPActor } from '../actor/actor.mjs'
import { BRPItem } from '../item/item.mjs'
import { BRP } from "../setup/config.mjs";
import { registerSettings } from '../settings/register-settings.mjs'
import { handlebarsHelper } from '../setup/handlebar-helper.mjs';
import { preloadHandlebarsTemplates } from "../setup/templates.mjs";
import { BRPCombat } from "../combat/combat.mjs";
import { BRPCombatTracker } from "../combat/combat-tracker.mjs";
import { BRPActiveEffect } from "../apps/active-effect.mjs";
import { BRPCheck } from '../apps/check.mjs';

export default function Init() {
  //Add classes to global game object
  game.brp = {
    BRPActor,
    BRPItem,
    rollItemMacro,
    rollCharMacro
  };
  //Add Custom Configuration
  CONFIG.BRP = BRP;

  //Register Settings and Handlebar Helpers
  registerSettings();
  handlebarsHelper();
  preloadHandlebarsTemplates();


  // Define custom Document classes
  CONFIG.Actor.documentClass = BRPActor;
  CONFIG.Item.documentClass = BRPItem;
  CONFIG.Combat.documentClass = BRPCombat;
  CONFIG.ui.combat = BRPCombatTracker;
  CONFIG.ActiveEffect.documentClass = BRPActiveEffect;




    BRPID.init()
    registerSheets()

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = true;

}

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

//Roll a Characteristic Roll for an actor from the hotbar - work in progress
function rollCharMacro(actor,characteristic) {
    BRPCheck._trigger({
      rollType: 'CH',
      cardType: 'NO',
      characteristic,
      shiftKey: 'false',
      actor: actor,
      token: ""
    })
}
