import { BRPUtilities } from "../apps/utilities.mjs";
import { BRPDamage } from "../apps/damage.mjs";
import { BRPCheck } from "../apps/check.mjs";
import { BRPCharDev } from "../apps/charDev.mjs";

//Characteristic Name Context Menu Options
export const characteristicMenuOptions = (actor,token) => [
  {
    name: game.i18n.localize("BRP.characteristic"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
  {
    name: game.i18n.localize("BRP.card.NO"),
    icon: '<i class="fas fa-dice-d20"></i>',
    condition: () => true,
    callback: (el) => {
      BRPCheck._trigger({
        rollType: 'CH',
        cardType: 'NO',
        characteristic: el[0].dataset.characteristic,
        actor,
        token,}
      );
    }
  },
  {
    name: game.i18n.localize("BRP.card.RE"),
    icon: '<i class="fas fa-hand-fist"></i>',
    condition: () => true,
    callback: (el) => {
      BRPCheck._trigger({
        rollType: 'CH',
        cardType: 'RE',
        characteristic: el[0].dataset.characteristic,
        actor,
        token,}
        );
    }
  },
  {
    name: game.i18n.localize("BRP.card.PP"),
    icon: '<i class="fas fa-hand-sparkles"></i>',
    condition: (el) => (el[0].dataset.characteristic ==='pow'),
    callback: (el) => {
      BRPCheck._trigger({
        rollType: 'CH',
        cardType: 'PP',
        characteristic: el[0].dataset.characteristic,
        actor,
        token,}
        );
    }
  },
  {
    name: game.i18n.localize("BRP.powImprove")+"(1D3-1)",
    icon: '<i class="fas fa-dice-d6"></i>',
    condition: (el) => (el[0].dataset.characteristic ==='pow' && game.settings.get('brp','development') && actor.system.stats.pow.improve),
    callback: (el) => {
      BRPCharDev.powImprov(actor, token, "roll");
    }
  },
  {
    name: game.i18n.localize("BRP.powImprove")+"(1)",
    icon: '<i class="fas fa-dice-one"></i>',
    condition: (el) => (el[0].dataset.characteristic ==='pow' && game.settings.get('brp','development') && actor.system.stats.pow.improve),
    callback: (el) => {
      BRPCharDev.powImprov(actor, token, "fixed");
    }
  }
]  

//Profession Name Context Menu Options
export const professionMenuOptions = (actor,token) => [
  {
    name: game.i18n.localize("BRP.profession"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
  {
    name: game.i18n.localize("BRP.view"),
    icon: '<i class="fas fa-magnifying-glass"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
    }
  },
  {
    name: game.i18n.localize("BRP.delete"),
    icon: '<i class="fas fa-trash"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.professionDelete(el, actor);
    }
  }
]  

//Personality Name Context Menu Options
export const personalityMenuOptions = (actor,token) => [
  {
    name: game.i18n.localize("BRP.personality"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
  {
    name: game.i18n.localize("BRP.view"),
    icon: '<i class="fas fa-magnifying-glass"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
    }
  },
  {
    name: game.i18n.localize("BRP.delete"),
    icon: '<i class="fas fa-trash"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPUtilities.personalityDelete(el, actor);
    }
  }
]  

//Skills Tab Name Context Menu Options
export const skillstabMenuOptions = (actor,token) => [
  {
    name: game.i18n.localize("BRP.skills"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
  {
    name: game.i18n.localize("BRP.xpAllGain")+ " (" + game.settings.get('brp','xpFormula') + ")",
    icon: '<i class="fas fa-dice-d6"></i>',
    condition: () => game.settings.get('brp','development'),
    callback: (el) => {
      const itemId = BRPCharDev.onXPGainAll(actor, token,"roll");
    }
  },
  {
    name: game.i18n.localize("BRP.xpAllGain")+ " (" + game.settings.get('brp','xpFixed') + ")",
    icon: '<i class="fas fa-dice-three"></i>',
    condition: () => game.settings.get('brp','development'),
    callback: (el) => {
      const itemId = BRPCharDev.onXPGainAll(actor, token, "fixed");
    }
  }
]


//Combat Tab Name Context Menu Options
export const combatMenuOptions = (actor,token) => [
  {
    name: game.i18n.localize("BRP.combat"),
    icon: "",
    condition: () => true,
    callback: (el) => {}
  },
  {
    name: game.i18n.localize("BRP.naturalHealing"),
    icon: '<i class="fas fa-clock"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPDamage.naturalHeal(el, actor);
    }
  },
  {
    name: game.i18n.localize("BRP.allHeal"),
    icon: '<i class="fas fa-staff-snake"></i>',
    condition: () => true,
    callback: (el) => {
      const itemId = BRPDamage.allHeal(el, actor);
    }
  },
  {
    name: game.i18n.localize("BRP.resetDaily"),
    icon: '<i class="fas fa-sunrise"></i>',
    condition: () => !game.settings.get('brp','useHPL'),
    callback: (el) => {
      const itemId = BRPDamage.resetDaily(el, actor);
    }
  }
] 

//Skill Name Context Menu Options
export const skillMenuOptions = (actor,token) => [
    {
      name: game.i18n.localize("BRP.skill"),
      icon: "",
      condition: () => true,
      callback: (el) => {}
    },
    {
      name: game.i18n.localize("BRP.card.NO"),
      icon: '<i class="fas fa-dice-d20"></i>',
      condition: () => true,
      callback: (el) => {
        console.log(el)
        BRPCheck._trigger({
          rollType: 'SK',
          cardType: 'NO',
          skillId: el[0].dataset.itemId,
          actor,
          token,}
        );
      }
    },
    {
      name: game.i18n.localize("BRP.card.GR"),
      icon: '<i class="fas fa-list-check"></i>',
      condition: () => true,
      callback: (el) => {
        BRPCheck._trigger({
          rollType: 'SK',
          cardType: 'GR',
          skillId: el[0].dataset.itemId,
          actor,
          token,}
        );
      }
    },
    {
      name: game.i18n.localize("BRP.card.OP"),
      icon: '<i class="fas fa-handshake-simple"></i>',
      condition: () => true,
      callback: (el) => {
        BRPCheck._trigger({
          rollType: 'SK',
          cardType: 'OP',
          skillId: el[0].dataset.itemId,
          actor,
          token,}
        );
      }
    },
    {
      name: game.i18n.localize("BRP.card.CO"),
      icon: '<i class="fas fa-hand-fist"></i>',
      condition: () => true,
      callback: (el) => {
        BRPCheck._trigger({
          rollType: 'SK',
          cardType: 'CO',
          skillId: el[0].dataset.itemId,
          actor,
          token,}
        );
      }
    },
    {
      name: game.i18n.localize("BRP.xpGain")+ " (" + game.settings.get('brp','xpFormula') + ")",
      icon: '<i class="fas fa-dice-d6"></i>',
      condition: (el) => (game.settings.get('brp','development') && el[0].dataset.xp === 'true'),
      callback: (el) => {
        BRPCharDev.onXPGainSingle(el[0].dataset.itemId,actor,token,"formula");
      }
    },    
    {
      name: game.i18n.localize("BRP.xpGain")+ " (" + game.settings.get('brp','xpFixed') + ")",
      icon: '<i class="fas fa-dice-three"></i>',
      condition: (el) => (game.settings.get('brp','development') && el[0].dataset.xp === 'true'),
      callback: (el) => {
        BRPCharDev.onXPGainSingle(el[0].dataset.itemId,actor,token,"fixed");
      }
    },    
    {
      name: game.i18n.localize("BRP.view"),
      icon: '<i class="fas fa-magnifying-glass"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
      }
    },
    {
      name: game.i18n.localize("BRP.delete"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
      }
    }
  ]  

  //Hit Location Name Context Menu Options
  export const hitLocMenuOptions = (actor, token) => [
    {
      name: game.i18n.localize("BRP.hitLoc"),
      icon: "",
      condition: () => true,
      callback: (el) => {}
    },
    {
      name: game.i18n.localize("BRP.view"),
      icon: '<i class="fas fa-magnifying-glass"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
      }
    },
    {
      name: game.i18n.localize("BRP.delete"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
      }
    }
  ];

  //Power Name Context Menu Options 
  export const powerMenuOptions = (actor,token) => [
    {
      name: game.i18n.localize("BRP.power"),
      icon: "",
      condition: () => true,
      callback: (el) => {}
    },
    {
      name: game.i18n.localize("BRP.view"),
      icon: '<i class="fas fa-magnifying-glass"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
      }
    },
    {
      name: game.i18n.localize("BRP.deletePower"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => !actor.system.lock,
      callback: (el) => {
        const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
      }
    }
  ];  

  //Magic Name Context Menu Options 
  export const magicMenuOptions = (actor,token) => [
    {
      name: game.i18n.localize("BRP.magic"),
      icon: "",
      condition: () => true,
      callback: (el) => {}
    },
    {
      name: game.i18n.localize("BRP.view"),
      icon: '<i class="fas fa-magnifying-glass"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
      }
    },
    {
      name: game.i18n.localize("BRP.delete"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
      }
    }
  ];
  
  //Mutation Name Context Menu Options 
  export const mutationMenuOptions = (actor,token) => [
    {
      name: game.i18n.localize("BRP.mutation"),
      icon: "",
      condition: () => true,
      callback: (el) => {}
    },
    {
      name: game.i18n.localize("BRP.view"),
      icon: '<i class="fas fa-magnifying-glass"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
      }
    },
    {
      name: game.i18n.localize("BRP.delete"),
      icon: '<i class="fas fa-trash"></i>',
      condition: () => true,
      callback: (el) => {
        const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
      }
    }
  ];  

    //Psychic Ability Name Context Menu Options 
    export const psychicMenuOptions = (actor,token) => [
      {
        name: game.i18n.localize("BRP.psyAbility"),
        icon: "",
        condition: () => true,
        callback: (el) => {}
      },
      {
        name: game.i18n.localize("BRP.view"),
        icon: '<i class="fas fa-magnifying-glass"></i>',
        condition: () => true,
        callback: (el) => {
          const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
        }
      },
      {
        name: game.i18n.localize("BRP.delete"),
        icon: '<i class="fas fa-trash"></i>',
        condition: () => true,
        callback: (el) => {
          const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
        }
      }
    ];  

    //Superpower Ability Name Context Menu Options 
    export const superMenuOptions = (actor,token) => [
      {
        name: game.i18n.localize("BRP.super"),
        icon: "",
        condition: () => true,
        callback: (el) => {}
      },
      {
        name: game.i18n.localize("BRP.view"),
        icon: '<i class="fas fa-magnifying-glass"></i>',
        condition: () => true,
        callback: (el) => {
          const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
        }
      },
      {
        name: game.i18n.localize("BRP.delete"),
        icon: '<i class="fas fa-trash"></i>',
        condition: () => true,
        callback: (el) => {
          const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
        }
      }
    ];  

        //Character Failing Name Context Menu Options 
        export const failingMenuOptions = (actor,token) => [
          {
            name: game.i18n.localize("BRP.failing"),
            icon: "",
            condition: () => true,
            callback: (el) => {}
          },
          {
            name: game.i18n.localize("BRP.view"),
            icon: '<i class="fas fa-magnifying-glass"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
            }
          },
          {
            name: game.i18n.localize("BRP.delete"),
            icon: '<i class="fas fa-trash"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
            }
          }
        ]; 

        //Armour Item Context Menu Options 
        export const armourMenuOptions = (actor,token) => [
          {
            name: game.i18n.localize("BRP.armour"),
            icon: "",
            condition: () => true,
            callback: (el) => {}
          },
          {
            name: game.i18n.localize("BRP.view"),
            icon: '<i class="fas fa-magnifying-glass"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
            }
          },
          {
            name: game.i18n.localize("BRP.delete"),
            icon: '<i class="fas fa-trash"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
            }
          }
        ];         

        //Gear Item Context Menu Options 
        export const gearMenuOptions = (actor,token) => [
          {
            name: game.i18n.localize("BRP.equipment"),
            icon: "",
            condition: () => true,
            callback: (el) => {}
          },
          {
            name: game.i18n.localize("BRP.view"),
            icon: '<i class="fas fa-magnifying-glass"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
            }
          },
          {
            name: game.i18n.localize("BRP.delete"),
            icon: '<i class="fas fa-trash"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
            }
          }
        ];        

        //Weapon Item Context Menu Options 
        export const weaponMenuOptions = (actor,token) => [
          {
            name: game.i18n.localize("BRP.weapon"),
            icon: "",
            condition: () => true,
            callback: (el) => {}
          },
          {
            name: game.i18n.localize("BRP.card.CM"),
            icon: '<i class="fas fa-swords"></i>',
            condition: () => true,
            callback: (el) => {
              BRPCheck._trigger({
                rollType: 'CM',
                cardType: 'NO',
                itemId: el[0].dataset.itemId,
                skillId: el[0].dataset.skillId,
                actor,
                token,}
              );
            }
          },
          {
            name: game.i18n.localize("BRP.card.DM"),
            icon: '<i class="fas fa-bullseye-arrow"></i>',
            condition: () => true,
            callback: (el) => {
              BRPCheck._trigger({
                rollType: 'DM',
                cardType: 'NO',
                itemId: el[0].dataset.itemId,
                actor,
                token,}
              );
            }
          },
          {
            name: game.i18n.localize("BRP.view"),
            icon: '<i class="fas fa-magnifying-glass"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
            }
          },
          {
            name: game.i18n.localize("BRP.delete"),
            icon: '<i class="fas fa-trash"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
            }
          }
        ];        

        //Wound Context Menu Options 
        export const woundMenuOptions = (actor,token) => [
          {
            name: game.i18n.localize("BRP.wound"),
            icon: "",
            condition: () => true,
            callback: (el) => {}
          },
          {
            name: game.i18n.localize("BRP.view"),
            icon: '<i class="fas fa-magnifying-glass"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerEdit(el, actor, "itemId");
            }
          },
          {
            name: game.i18n.localize("BRP.treatWound"),
            icon: '<i class="fas fa-kit-medical"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPDamage.treatWound(el, actor, "itemId","medical");
            }
          },
          {
            name: game.i18n.localize("BRP.castHealing"),
            icon: '<i class="fas fa-hand-sparkles"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPDamage.treatWound(el, actor, "itemId","magic");
            }
          },
          {
            name: game.i18n.localize("BRP.delete"),
            icon: '<i class="fas fa-trash"></i>',
            condition: () => true,
            callback: (el) => {
              const itemId = BRPUtilities.triggerDelete(el, actor, "itemId");
            }
          }  
        ];        