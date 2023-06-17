import { BRPUtilities } from "../../apps/utilities.mjs";
import { BRPCharGen } from "../character-creation.mjs";

export const brpMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.cm.rerollAllStats"),
    icon: '<i class="fas fa-dice-d20"></i>',
    condition: () => (game.user.isGM || actor.system.initialise),
    callback: (el) => {
      BRPCharGen.onCharInitial(actor)
    }
  }, 

  {
    name: game.i18n.localize("BRP.cm.toggleInitial"),
    icon: '<i class="fas fa-user-lock"></i>',
    condition: () => (game.user.isGM),
    callback: (el) => {
      BRPCharGen.toggleInitial(actor)
    }
  }, 

];

