import { BRPUtilities } from "../../apps/utilities.mjs";

export const CultureMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.cm.view"),
    icon: '<i class="fas fa-magnifying-glass"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
    }
  },

  {
      name: game.i18n.localize("BRP.cm.delete"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => (game.user.isGM || actor.system.initialise),
      callback: (el) => {
        const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
      }
    },
  
];