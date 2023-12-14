import { BRPUtilities } from "../apps/utilities.mjs";

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

//Skill Name Context Menu Options
export const skillMenuOptions = (actor,token) => [
    {
      name: game.i18n.localize("BRP.skill"),
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