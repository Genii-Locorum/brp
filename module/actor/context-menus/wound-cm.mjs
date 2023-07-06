import { BRPCombat } from "../../apps/combat.mjs";

export const WoundMenuOptions = (actor, token) => [
    {
      name: game.i18n.localize("BRP.cm.heal"),
      icon: '<i class="fas fa-kit-medical"></i>',
      condition: () => true,
      callback: (el) => {
        const elem =  el.target ? el.target : el[0];
        const itemId =  elem.dataset.itemid
        const itemIndex = elem.dataset.index
        BRPCombat.treatWound(token, actor, itemId, itemIndex,'treat')
      }
    },

    {
      name: game.i18n.localize("BRP.cm.sorceryHeal"),
      icon: '<i class="fas fa-hand-holding-magic"></i>',
      condition: () => true,
      callback: (el) => {
        const elem =  el.target ? el.target : el[0];
        const itemId =  elem.dataset.itemid
        const itemIndex = elem.dataset.index
        BRPCombat.treatWound(token, actor, itemId, itemIndex,'heal')
      }
    },

    {
      name: game.i18n.localize("BRP.cm.delete"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => true,
      callback: (el) => {
        const elem =  el.target ? el.target : el[0];
        const itemId =  elem.dataset.itemid
        const itemIndex = elem.dataset.index
        BRPCombat.deleteWound(token, actor, itemId, itemIndex)
      }
    },

  ];