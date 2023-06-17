import { BRPUtilities } from "../../apps/utilities.mjs";

export const WealthMenuOptions = (actor, token) => [
    {
      name: game.i18n.localize("BRP.cm.increase"),
      icon: '<i class="fas fa-arrow-up"></i>',
      condition: () => true,
      callback: (el) => {
        BRPUtilities.changeWealth(token, actor,1)
      }
    },
  
    {
      name: game.i18n.localize("BRP.cm.decrease"),
      icon: '<i class="fas fa-arrow-down"></i>',
      condition: () => true,
      callback: (el) => {
        BRPUtilities.changeWealth(token, actor,-1)
      }
    },

  ];