import { BRPCharGen } from "../character-creation.mjs";
import { BRPUtilities } from "../../apps/utilities.mjs";

export const SkillDevelopMenuOptions = (actor, token) => [
    {
      name: game.i18n.localize("BRP.cm.skillDevelop"),
      icon: '<i class="fas fa-list-check"></i>',
      condition: () => true,
      callback: (el) => {
        BRPCharGen.skillDevelop(token, actor,)
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
  
    {
      name: game.i18n.localize("BRP.cm.deleteAllSkills"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => (game.user.isGM),
      callback: (el) => {
        BRPUtilities.onDeleteAllSkills(actor)
      }
    }, 

  ];

  