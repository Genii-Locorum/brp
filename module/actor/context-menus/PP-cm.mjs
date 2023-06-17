import { BRPUtilities } from "../../apps/utilities.mjs";

export const PPMenuOptions = (actor, token) => [
    {
      name: game.i18n.localize("BRP.cm.restoreMax"),
      icon: '<i class="fas fa-arrows-rotate"></i>',
      condition: () => true,
      callback: (el) => {
        BRPUtilities._restorePP(token, actor,)
      }
    },
  
  ];