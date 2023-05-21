import { BRPUtilities } from "../../apps/utilities.mjs";

export const SpeciesMenuOptions = (actor, token) => [
    {
      name: game.i18n.localize("BRP.cm.delete"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
      }
    },
  
  ];