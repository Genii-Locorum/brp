import { BRPUtilities } from "../../apps/utilities.mjs";
import { BRPCharGen } from "../character-creation.mjs";

export const brpMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.cm.rerollAllStats"),
    icon: '<i class="fas fa-dice-d20"></i>',
    condition: () => (game.user.isGM || !actor.system.initialise),
    callback: (el) => {
      BRPCharGen.initializeAllCharacteristics(actor)
    }
  }, 

  {
    name: game.i18n.localize("BRP.cm.xpGainAll") + " (" + game.settings.get('brp','xpFormula') + ")",
    icon: '<i class="fas fa-square-plus"></i>',
    condition: () => true,
    callback: (el) => {
      BRPUtilities._onXPGainAll(actor,token,true)
    }
  },

  {
    name: game.i18n.localize("BRP.cm.xpGainAll") + " (" + game.settings.get('brp','xpFixed') + ")",
    icon: '<i class="fas fa-plus"></i>',
    condition: () => true,
    callback: (el) => {
      BRPUtilities._onXPGainAll(actor,token,false)
    }
  },

];

