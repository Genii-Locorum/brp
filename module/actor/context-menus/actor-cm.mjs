import { BRPUtilities } from "../../apps/utilities.mjs";
import { BRPCharGen } from "../character-creation.mjs";
import { BRPChecks } from "../../rolls/checks.mjs";
import { BRPCombat } from "../../apps/combat.mjs";

//
// BRP Header Menu Options
//
export const brpMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.Brp"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
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

//
// Stats Menu Options
//
export const statMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.characteristics"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
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
    },
];

//
// Derived Stats Menu Options
//
export const statDerivOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.characteristics"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
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


//
//Culture Menu Options
//
export const CultureMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.culture"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
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
    condition: () => (game.user.isGM || actor.system.initialise),
    callback: (el) => {
      const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
    }
  },
];

//
// Hit Location Menu Options

export const HitLocMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.hitLoc"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
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
    name: game.i18n.localize("BRP.cm.restoreLoc"),
    icon: '<i class="fas fa-bone"></i>',
    condition: () => (game.user.isGM),
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem.dataset.itemid
      BRPCombat.restoreLocation(token, actor, itemId)
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

//
// Fatigue Point Menu Options
//
export const FPMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.fatigue"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
  {
    name: game.i18n.localize("BRP.cm.restoreMax"),
    icon: '<i class="fas fa-arrows-rotate"></i>',
    condition: () => true,
    callback: (el) => {
      BRPUtilities._restoreFP(token, actor,)
    }
  },
];

//
// Hit Point Menu Options
//
export const HPMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.health"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
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

//
// Power Point Menu Options
//

export const PPMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.PP"),
    icon: "",
    condition: () => !game.settings.get('brp','useMP'),
    callback: (el) => {}
  },
  {
    name: game.i18n.localize("BRP.MP"),
    icon: "",
    condition: () => game.settings.get('brp','useMP'),
    callback: (el) => {}
  },

  {
    name: game.i18n.localize("BRP.cm.restoreMax"),
    icon: '<i class="fas fa-arrows-rotate"></i>',
    condition: () => true,
    callback: (el) => {
      BRPUtilities._restorePP(token, actor,)
    }
  },
];

//
// Skill Development Menu Options
//
export const SkillDevelopMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.skill") + " " + game.i18n.localize("BRP.tabName"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
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

//
// Skill Grid Options
//
export const skillGridMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.skill"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
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
    name: game.i18n.localize("BRP.cm.toggleProf"),
    icon: '<i class="fas fa-user-tie-hair-long"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.toggleProf(el, actor, "itemId");
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

//
// Skill Menu Options
//
export const skillMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.skill"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
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
    name: game.i18n.localize("BRP.cm.roll"),
    icon: '<i class="fas fa-dice"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem?.closest(".item").dataset.itemId
      BRPChecks._onContextSkillRoll(actor,token,itemId,false,false)
    }
  },

  {
    name: game.i18n.localize("BRP.cm.quickRoll"),
    icon: '<i class="fas fa-dice-d20"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem?.closest(".item").dataset.itemId
      BRPChecks._onContextSkillRoll(actor,token,itemId,true,false)
    }
  },

  {
    name: game.i18n.localize("BRP.cm.gmRoll"),
    icon: '<i class="fas fa-user-secret"></i>',
    condition: () => game.user.isGM,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem?.closest(".item").dataset.itemId
      BRPChecks._onContextSkillRoll(actor,token,itemId,true,true)
    }
  },

  {
    name: game.i18n.localize("BRP.cm.toggleXP"),
    icon: '<i class="fas fa-certificate"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.toggleXP(el, actor, "itemId");
    }
  },

  {
    name: game.i18n.localize("BRP.cm.xpGain") + " (" + game.settings.get('brp','xpFormula') + ")",
    icon: '<i class="fas fa-square-plus"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem?.closest(".item").dataset.itemId
      BRPChecks._onSkillXPRoll(actor,token,itemId,true)
    }
  },

  {
    name: game.i18n.localize("BRP.cm.xpGain") + " (" + game.settings.get('brp','xpFixed') + ")",
    icon: '<i class="fas fa-plus"></i>',
    condition: () => true,
    callback: (el) => {
      const elem =  el.target ? el.target : el[0];
      const itemId =  elem?.closest(".item").dataset.itemId
      BRPChecks._onSkillXPRoll(actor,token,itemId,false)
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

//
// Wealth Menu Options
//
export const WealthMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.wealth"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
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

//
// Wound Menu Options
//
export const WoundMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.wounds"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
  
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

//
// Age Menu Options
//
export const AgeMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.age"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
  
  {
    name: game.i18n.localize("BRP.cm.increase"),
    icon: '<i class="fas fa-arrow-up"></i>',
    condition: () => true,
    callback: (el) => {
      BRPCharGen.changeAge(token, actor,1)
    }
  },
];

//
// Item Menu Options
//
export const itemMenuOptions = (actor, token) => [
  {
    name: game.i18n.localize("BRP.item"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
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