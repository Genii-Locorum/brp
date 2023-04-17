import { BRPChecks } from "../../rolls/checks.mjs";


export const statDerivOptions = (actor, token) => [
    {
      name: game.i18n.localize("BRP.cm.roll"),
      icon: '<i class="fas fa-dice"></i>',
      condition: () => true,
      callback: (el) => {
        BRPChecks._onContextStatRoll(actor,token,el[0].dataset.label,el[0].dataset.target,false,el[0].dataset.type)
      }
    },

    {
        name: game.i18n.localize("BRP.cm.quickRoll"),
        icon: '<i class="fas fa-dice-d20"></i>',
        condition: () => true,
        callback: (el) => {
          BRPChecks._onContextStatRoll(actor,token,el[0].dataset.label,el[0].dataset.target,true,el[0].dataset.type)
        }
      }
  
  ];

