import { BRPUtilities } from "../../apps/utilities.mjs";

export const skillGridMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.cm.view"),
    icon: '<i class="fas fa-magnifying-glass"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
    }
  },

  {
    name: game.i18n.localize("BRP.cm.toggleProf"),
    icon: '<i class="fas fa-user-tie-hair-long"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.toggleProf(el, actor, "itemId");
    }
  },


  {
    name: game.i18n.localize("BRP.cm.delete"),
    icon: '<i class="fas fa-trash"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
    }
  },

];

