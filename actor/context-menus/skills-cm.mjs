import { BRPUtilities } from "../../apps/utilities.mjs";
import { BRPChecks } from "../../rolls/checks.mjs";


export const skillMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.cm.roll"),
    icon: '<i class="fas fa-dice"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem?.closest(".item").dataset.itemId
      BRPChecks._onContextSkillRoll(actor,token,itemId,false)
    }
  },

  {
    name: game.i18n.localize("BRP.cm.quickRoll"),
    icon: '<i class="fas fa-dice-d20"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem?.closest(".item").dataset.itemId
      BRPChecks._onContextSkillRoll(actor,token,itemId,true)
    }
  },

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
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
    }
  },

];

