import { BRPUtilities } from "../../apps/utilities.mjs";
import { BRPCombat } from "../../apps/combat.mjs";

export const FPMenuOptions = (actor, token) => [
    {
      name: game.i18n.localize("BRP.cm.restoreMax"),
      icon: '<i class="fas fa-arrows-rotate"></i>',
      condition: () => true,
      callback: (el) => {
        BRPUtilities._restoreFP(token, actor,)
      }
    },
  
  ];

  export const HPMenuOptions = (actor, token) => [

    {
      name: game.i18n.localize("BRP.cm.naturalHeal"),
      icon: '<i class="fas fa-heart"></i>',
      condition: () => true,
      callback: (el) => {
        BRPCombat.naturalHealing(token, actor,'1d3',0)
      }
    },

    {
      name: game.i18n.localize("BRP.cm.enhancedHeal"),
      icon: '<i class="fas fa-heart-circle-bolt"></i>',
      condition: () => true,
      callback: (el) => {
        BRPCombat.naturalHealing(token, actor,'2d3',0)
      }
    },

    {
      name: game.i18n.localize("BRP.cm.resetDaily"),
      icon: '<i class="fas fa-sunrise"></i>',
      condition: () => true,
      callback: (el) => {
        BRPCombat.resetDaily(token, actor,)
      }
    },

    {
      name: game.i18n.localize("BRP.cm.resMjrWnd"),
      icon: '<i class="fas fa-heart-pulse"></i>',
      condition: () => !game.settings.get('brp','useHPL'),
      callback: (el) => {
        BRPCombat.resMjrWnd(token, actor,)
      }
    },

    {
      name: game.i18n.localize("BRP.cm.restoreMax"),
      icon: '<i class="fas fa-arrows-rotate"></i>',
      condition: () => true,
      callback: (el) => {
        BRPUtilities._restoreHP(token, actor,)
      }
    },

  ];


  
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