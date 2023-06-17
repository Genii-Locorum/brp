import { BRPUtilities } from "../../apps/utilities.mjs";

export const HitLocMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.cm.view"),
    icon: '<i class="fas fa-magnifying-glass"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
    }
  },

  
];