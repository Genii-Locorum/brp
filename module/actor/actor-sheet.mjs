import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects/effects.mjs";
import { BRPChecks } from "../rolls/checks.mjs";
import { BRPCharGen } from "../actor/character-creation.mjs";
import { BRPContextMenu } from '../setup/context-menu.mjs';
import { SkillSelectDialog} from "../apps/skill-selection-dialog.mjs";
import { SkillSpecSelectDialog} from "../apps/skill-spec-dialog.mjs";

import { brpMenuOptions} from "./context-menus/actor-cm.mjs";
import { statMenuOptions } from "./context-menus/actor-cm.mjs";
import { CultureMenuOptions } from "./context-menus/actor-cm.mjs";
import { statDerivOptions } from "./context-menus/actor-cm.mjs";
import { HitLocMenuOptions } from "./context-menus/actor-cm.mjs";
import { HPMenuOptions } from "./context-menus/actor-cm.mjs";
import { FPMenuOptions } from "./context-menus/actor-cm.mjs";
import { PPMenuOptions } from "./context-menus/actor-cm.mjs";
import { SkillDevelopMenuOptions } from "./context-menus/actor-cm.mjs";
import { skillGridMenuOptions } from "./context-menus/actor-cm.mjs";
import { skillMenuOptions } from "./context-menus/actor-cm.mjs";
import { WealthMenuOptions } from "./context-menus/actor-cm.mjs";
import { WoundMenuOptions} from "./context-menus/actor-cm.mjs";
import { AgeMenuOptions} from "./context-menus/actor-cm.mjs";
import { itemMenuOptions} from "./context-menus/actor-cm.mjs";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BRPActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["brp", "sheet", "actor"],
      template: "systems/brp/templates/actor/actor-sheet.html",
      width: 820,
      height: 650,
      scrollY: ['.bottom-panel'],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/brp/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  static confirmItemDelete(actor, itemId) {
    let item = actor.items.get(itemId);
    item.delete();
  }

  /** @override */
  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.isGM = game.user.isGM;
    context.pointsMethod = game.settings.get('brp', 'pointsMethod')
    context.useEDU = game.settings.get('brp','useEDU');
    context.useMP = game.settings.get('brp','useMP');
    context.useFP = game.settings.get('brp','useFP');
    context.useSAN = game.settings.get('brp','useSAN');
    context.useHPL = game.settings.get('brp','useHPL');
    context.background1 = game.settings.get('brp','background1');
    context.background2 = game.settings.get('brp','background2');
    context.background3 = game.settings.get('brp','background3');
    context.isInitialise = actorData.system.initialise;
    context.isDevelop = actorData.system.development;
    let resource = 2;
    if (game.settings.get('brp','useFP')) {resource++};
    if (game.settings.get('brp','useSAN')) {resource++};
    context.resource = resource;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle characteristics scores - add labels and make stat visisble is selected
    for (let [k, v] of Object.entries(context.system.stats)) {
      v.label = game.i18n.localize(CONFIG.BRP.stats[k]) ?? k;
      v.labelShort = game.i18n.localize(CONFIG.BRP.statsAbbreviations[k]) ?? k;
      v.labelDeriv = game.i18n.localize(CONFIG.BRP.statsDerived[k]) ?? k;
      v.visible = true;
      if (k === 'edu' && !game.settings.get('brp','useEDU')) { v.visible = false};
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gears = [];
    const skills = [];
    const skillsDev = [];
    const categories = [];
    const weapons = [];
    const hitloc = [];



    // Iterate through items, allocating to containers
    this.actor.system.totalProf = 0
    this.actor.system.totalPers = 0
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'gear') {
        gears.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill') {
        i.system.total = i.system.base + i.system.xp + i.system.effects + i.system.profession + i.system.personality + i.system.personal
        i.system.catBonus = this.actor.system.skillcategory[i.system.category].bonus
        i.system.capTotal = i.system.base + i.system.profession + i.system.personality + i.system.personal + i.system.catBonus
        i.system.totalAlt = i.system.capTotal + i.system.xp + i.system.effects

        skills.push(i);
        skillsDev.push(i);
        this.actor.system.totalProf = this.actor.system.totalProf + i.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + i.system.personal
      } else if (i.type === 'hit-location') {
        hitloc.push(i);
      }
    }

    //Add Cateogry Headings to Categories Skills 
    categories.push(
      {name : game.i18n.localize("BRP.cmmnmod"), isType: true, system: {category: "cmmnmod", total: this.actor.system.skillcategory.cmmnmod.bonus}},
      {name : game.i18n.localize("BRP.mnplmod"), isType: true, system: {category: "mnplmod", total: this.actor.system.skillcategory.mnplmod.bonus}},
      {name : game.i18n.localize("BRP.mntlmod"), isType: true, system: {category: "mntlmod", total: this.actor.system.skillcategory.mntlmod.bonus}},
      {name : game.i18n.localize("BRP.prcpmod"), isType: true, system: {category: "prcpmod", total: this.actor.system.skillcategory.prcpmod.bonus}},
      {name : game.i18n.localize("BRP.physmod"), isType: true, system: {category: "physmod", total: this.actor.system.skillcategory.physmod.bonus}},
      {name : game.i18n.localize("BRP.zcmbtmod"), isType: true, system: {category: "zcmbtmod", total: this.actor.system.skillcategory.zcmbtmod.bonus}}
    );

   //Push this categorty list to Skills resort based on Skill Category, Category v Skill and then Name 
   for (let i of categories) {
    skills.push(i);
  }

skills.sort(function(a, b){
  let x = a.name.toLowerCase();
  let y = b.name.toLowerCase();
  let r = a.isType ? a.isType:false;
  let s = b.isType ? b.isType:false;
  let p = a.system.category;
  let q = b.system.category;
  if (p < q) {return -1};
  if (p > q) {return 1};
  if (r < s) {return 1};
  if (s < r) {return -1};
  if (x < y) {return -1};
  if (x > y) {return 1};
  return 0;
});

// Sort skillsDev List
skillsDev.sort(function(a, b){
  let x = a.name;
  let y = b.name;
  if (x < y) {return -1};
  if (x > y) {return 1};
  return 0;
});

// Sort Hit Locations
  hitloc.sort(function(a, b){
  let x = a.system.lowRoll;
  let y = b.system.lowRoll;
  if (x < y) {return -1};
  if (x > y) {return 1};
  return 0;
});


    // Assign and return
    context.gears = gears;
    context.skills = skills;
    context.skillsDev= skillsDev;
    context.weapons = weapons;
    context.hitloc = hitloc;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Initialiase Character.
    html.find('.char-initial').click(BRPCharGen.onCharInitial.bind(this));

    // Roll for Stat.
    html.find('.rollable.stat-name').click(BRPChecks._onStatRoll.bind(this));

    // Roll for Stat Derived.
    html.find('.rollable.deriv-name').click(BRPChecks._onStatRoll.bind(this));

    // Roll for Skill.
    html.find('.rollable.skill-name').click(BRPChecks._onSkillRoll.bind(this));

    // Points Allocation.
    html.find('.stat-arrow').click(BRPCharGen.pointsAllocation.bind(this));

    // Toggleable icon.
    html.find('.icon-toggle').dblclick(this._toggleIcon.bind(this));

    // Inline Skill Edit.
    html.find(".inline-edit").change(this._onSkillEdit.bind(this));

    //Character Context Menu
    new BRPContextMenu(html, ".stat-name.contextmenu", statMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".deriv-name.contextmenu", statDerivOptions(this.actor, this.token));
    new BRPContextMenu(html, ".health.contextmenu", HPMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".fatigue.contextmenu", FPMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".power.contextmenu", PPMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".culture.contextmenu", CultureMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".personality.contextmenu", CultureMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".profession.contextmenu", CultureMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".skill-name.contextmenu", skillMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".skill-cell-name.contextmenu", skillGridMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".brp-header.contextmenu", brpMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".hitloc-name.contextmenu", HitLocMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".wealth.contextmenu", WealthMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".skilldevelop.contextmenu", SkillDevelopMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".wound.contextmenu", WoundMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".age.contextmenu", AgeMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".item-name.contextmenu", itemMenuOptions(this.actor, this.token));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    let item = await Item.create(itemData, {parent: this.actor});
    item.sheet.render(true);
    return
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  // Change default on Drop Item Create routine for requirements (single items and folder drop)-----------------------------------------------------------------
  async _onDropItemCreate(itemData) {
    const newItemData = [];
    itemData = itemData instanceof Array ? itemData : [itemData];
    //TODO: Consider adding a bypass to just create the items with no checks
    //      return this.actor.createEmbeddedDocuments("Item", itemData);
    for (let k of itemData) {
      let reqResult = 1;
      let errMsg = "";

    //Automatically allow items to be added
    if (k.type != 'item') {   

      //Stop Hit Location being directly added  
        if (k.type === 'hit-location') {
          reqResult = 0;
          errMsg = k.name + " : " +   game.i18n.localize('BRP.stopHitLoc')       
        }

      //Test to see if this is the GM or if character is in creation mode, then check if character already has a culture
        if (k.type === 'culture') {
          if (!game.user.isGM && !this.actor.system.initialise) {
            reqResult = 0;
            errMsg = k.name + " : " +   game.i18n.localize('BRP.notInitialise')        
          } else if (typeof this.actor.system.culture !== 'undefined') {
            reqResult = 0;
            errMsg = k.name + " : " +   game.i18n.localize('BRP.dupCulture')
          }
        }

      //Test to see if its a Specialist Group Skill
      if (k.type === 'skill' && k.system.specGroup) {
        reqResult = 0;
        errMsg = k.name + " : " +   game.i18n.localize('BRP.specGroupDrop') 
      }        

      //Test to see if the skill already exists
        if (k.type === 'skill') {
          if (k.system.specialism && !k.system.chosen){
            let usage = await SkillSpecSelectDialog.create(k)
            if (usage.get('new-skill-name')){
              k.system.specName = usage.get('new-skill-name')
              k.system.chosen = true
              k.name = k.system.mainName + " (" + k.system.specName + ")"
            }    
          }    
          for (let j of this.actor.items) {
            if(j.type === k.type && j.name === k.name && (!k.system.specialism || k.system.chosen)) {
              reqResult = 0;
              errMsg = k.name + " : " +   game.i18n.localize('BRP.dupItem-1') + k.type + game.i18n.localize('BRP.dupItem-2') 
            }
          }
          k.system.base = await this._calcBase(k)
        }  

      //Test for personality
        if (k.type === 'personality') {
          if (!game.settings.get('brp','usePers')) {
            reqResult = 0;
            errMsg = game.i18n.localize('BRP.noPers')
          } else if (!game.user.isGM && !this.actor.system.initialise) {
            reqResult = 0;
            errMsg = k.name + " : " +   game.i18n.localize('BRP.notInitialise')        
          } else if (typeof this.actor.system.personality !== 'undefined'){
            reqResult = 0;
            errMsg = k.name + " : " +   game.i18n.localize('BRP.dupPers')
          } else {
            k = await this._groupSkillsSelect(k)
          }  
        }  
  
      //Test for profession  
      if (k.type === 'profession') {
        if (!game.user.isGM && !this.actor.system.initialise) {
          reqResult = 0;
          errMsg = k.name + " : " +   game.i18n.localize('BRP.notInitialise')        
        } else if (typeof this.actor.system.profession !== 'undefined'){
          reqResult = 0;
          errMsg = k.name + " : " +   game.i18n.localize('BRP.dupProf')
        } else {
          k = await this._groupSkillsSelect(k)
          let wealth = k.system.minWealth
          if (wealth != k.system.maxWealth) {
            let usage = await BRPCharGen.startingWealth(k.system.minWealth, k.system.maxWealth)
            wealth = usage.get('wealth-level');
          }
          this.actor.update({'system.wealth': wealth})
        }  
      }  
    }  

    //Check to see if we can drop the Item
      if (reqResult !=1) {
        ui.notifications.warn(errMsg);
      } else {
        if(k.type === 'culture') {
          //If using Hits per location then drop hitlocs from culture, otherwise drop a single Hit Loc
          if (game.settings.get('brp','useHPL')){  
          for (let j of k.system.hitloc) {
            newItemData.push(j)    
          }
        } else {
          // Add default single Hit Location
          let hitloc = k.system.hitloc[0]
            hitloc.name = game.i18n.localize('BRP.totalHP')
            hitloc.system.lowRoll=1
            hitloc.system.highRoll=20
            hitloc.system.locType = true
            hitloc.system.fractionHP = 1
            newItemData.push(hitloc)   
        }
        }else if (k.type === 'personality'){
          for (let j of k.system.skills) {
            let skillReq=1
            for (let i of this.actor.items) {
              if (i.type === 'skill' && i.name === j.name) {
                skillReq= 0
                i.update({'system.personality': 20})
              }    
            }
            if (skillReq === 1) {
              j.system.personality = 20
              j.system.base = await this._calcBase(j)
              newItemData.push(j)
            }
          }
        }else if (k.type === 'profession'){
          for (let j of k.system.skills) {
            let skillReq=1
            for (let i of this.actor.items) {
              if (i.type === 'skill' && i.name === j.name) {
                skillReq= 0
                i.update({'system.occupation': true})
              }    
            }
            if (skillReq === 1) {
              j.system.occupation = true
              j.system.base = await this._calcBase(j)
              newItemData.push(j)
            }
          }
        }  
        newItemData.push(k);
      }
    }
  return this.actor.createEmbeddedDocuments("Item", newItemData);
  }

// When dropping an item with OptionalSkills select those skills and push to main list, plus update name for "Special skills"-----------------------------------------------------------------
 async _groupSkillsSelect(item) {
  
  
  let newItem = duplicate(item)
  for (let index = 0; index < newItem.system.groups.length; index++) {
    let skillList = []
    const dialogData = {}
    for (let j of newItem.system.groups[index].skills){
      if (j.system.specGroup) {
        for (let k of game.items){
          if(k.type === 'skill' && !k.system.specGroup && k.system.category === j.system.category) {
            if(j.system.subType === "" || k.system.subType === j.system.subType) {
              skillList.push(k)
            }
          }  
        }
    } else {
      skillList.push(j)
    }
  }

  skillList.sort(function(a, b){
    let x = a.name;
    let y = b.name;
    if (x < y) {return -1};
    if (x > y) {return 1};
    return 0;
  });
    
    dialogData.skills= skillList
    dialogData.actorId = this.id
    dialogData.optionsCount = Number(newItem.system.groups[index].options)
    dialogData.title = game.i18n.localize('BRP.SkillSelectionWindow')
    const selected = await SkillSelectDialog.create(dialogData)
    for (let j of selected){
      newItem.system.skills.push(j)
    }  

  }

  //Make user choose a name for Specialist skills
      let newSkills = []
      for (let index = 0; index < newItem.system.skills.length; index++) {
        let j = newItem.system.skills[index]
        if (j.system.specialism && !j.system.chosen){
            let usage = await SkillSpecSelectDialog.create(j)
            if (usage.get('new-skill-name')){
               j.system.specName = usage.get('new-skill-name')
               j.system.chosen = true
               j.name = j.system.mainName + " (" + j.system.specName + ")"
               newSkills.push(j)
            }
        } else {
          newSkills.push(j)
        }  
      }
      newItem.system.skills = newSkills
  return newItem;  
}  

// Update skills etc without opening the item sheet
async _onSkillEdit(event){
  event.preventDefault();
    const element = event.currentTarget;
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    const field = element.dataset.field;
    const target = 'system.'+field;
    let newScore = Number(element.value);
    if (field != 'ap') {
      let currentTotal =  this.actor.system.skillcategory[item.system.category].bonus + item.system.base + item.system.profession + item.system.personality + item.system.personal;
      let newTotal = currentTotal  - item.system[field];
      let pointsCap = 999
      if (field === 'personal') {
        pointsCap = Number(this.actor.system.maxPers - this.actor.system.totalPers + item.system.personal)
      } else if (field === 'profession') {
        pointsCap = Number(this.actor.system.maxProf - this.actor.system.totalProf + item.system.profession)
      } 
      newScore = Math.max(Math.min(newScore,pointsCap, (game.settings.get('brp',"skillCap") - newTotal)),0)
    }
    await item.update ({ [target]: newScore});
    this.actor.render(false);
    return;
}

 //Calculate Base Skill on Dropping the item on actor
async _calcBase(i){
  if (i.system.variable) {
    let stat1 = i.system.baseFormula[1].stat
    let stat2 = i.system.baseFormula[2].stat
    let opt1 = 0
    let opt2 = 0
    let newScore = 0
    if (stat1 !='fixed') {
      if (stat1 != 'edu' || game.settings.get('brp', 'useEDU')) {
      opt1 = Math.ceil((this.actor.system.stats[stat1].value + this.actor.system.stats[stat1].redist + this.actor.system.stats[stat1].adj) * i.system.baseFormula[1].value)
    }  
  }
  if (stat2 !='fixed') {
    if (stat2 != 'edu' || game.settings.get('brp', 'useEDU')) {
      opt2 = Math.ceil((this.actor.system.stats[stat2].value + this.actor.system.stats[stat2].redist + this.actor.system.stats[stat2].adj) * i.system.baseFormula[2].value)
    }  
  }
  if (i.system.baseFormula.Func === 'and') {
    newScore = opt1 + opt2          
  } else {
    newScore = Math.max(opt1, opt2)
  }
  return newScore
}
  return i.system.base
  }

// Toggle icons
async _toggleIcon(event) {
  const prop=event.currentTarget.dataset.property;
  let itemId = event.currentTarget.dataset.itemid;
  let item = this.actor.items.get(itemId);
  let checkProp={};
  if (prop === 'bleeding') {
    checkProp = {'system.bleeding': !item.system.bleeding};
  } else if (prop === 'incapacitated' && item.system.status != 'incapacitated') {
      checkProp = {'system.status': 'incapacitated'};
  } else if (prop === 'severed' && item.system.status != 'severed') {
      checkProp = {'system.status': 'severed'};
  } else if (prop === 'injured' && item.system.status != 'injured') {
      checkProp = {'system.status': 'injured'};     
  } else if (prop === 'severed' || prop === 'incapacitated' || prop === 'injured') {
      checkProp = {'system.status': ''};
  } else if (prop === 'majorWnd') {
      await this.actor.update({'system.majorWnd': false})
      return
  } else if (prop === 'minorWnd') {
    await this.actor.update({'system.minorWnd': false})
    return
  } else if (prop === 'unconscious') {
    await this.actor.update({'system.unconscious': false})
    return
  } else if (prop === 'equipped') {
    checkProp = {'system.equipped': !item.system.equipped}
  }

  item = await item.update(checkProp);
  return item;

}

}
