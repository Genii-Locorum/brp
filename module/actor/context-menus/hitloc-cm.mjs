import { BRPUtilities } from "../../apps/utilities.mjs";
import { BRPCombat } from "../../apps/combat.mjs";

export const HitLocMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.cm.addWound"),
    icon: '<i class="fas fa-droplet"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem?.closest(".item").dataset.itemid
      BRPCombat.takeDamage(actor,token,itemId)
    }
  },

  {
    name: game.i18n.localize("BRP.cm.magicHeal"),
    icon: '<i class="fas fa-book-sparkles"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem.dataset.itemid
      BRPCombat.treatLocation(token, actor, itemId,0)
    }
  },

  {
    name: game.i18n.localize("BRP.cm.deleteWounds"),
    icon: '<i class="fas fa-trash"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem.dataset.itemid
      BRPCombat.deleteWound(token, actor, itemId, 999)
    }
  },


];