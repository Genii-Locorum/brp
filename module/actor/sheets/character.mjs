import { BRPContextMenu } from '../../setup/context-menu.mjs';
import * as contextMenu from "../actor-cm.mjs";
import {BRPactorItemDrop} from '../actor-itemDrop.mjs';
import {BRPDamage} from '../../apps/damage.mjs';
import {BRPRollType} from '../../apps/rollType.mjs';


export class BRPCharacterSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    
    return mergeObject(super.defaultOptions, {
      classes: ["brp", "sheet", "actor"],
      template: "systems/brp/templates/actor/character-sheet.html",
      width: 850,
      height: 850,
      scrollY: ['.bottom-panel'],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  static confirmItemDelete(actor, itemId) {
    let item = actor.items.get(itemId);
    item.delete();
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.logo = game.settings.get('brp','charSheetLogo');
    context.useEDU = game.settings.get('brp','useEDU');
    context.useMP = game.settings.get('brp','useMP');
    context.useFP = game.settings.get('brp','useFP');
    context.useSAN = game.settings.get('brp','useSAN');
    context.useHPL = game.settings.get('brp','useHPL');
    context.useAlleg = game.settings.get('brp','useAlleg');
    context.usePassion = game.settings.get('brp','usePassion');    
    context.useAVRand = game.settings.get('brp','useAVRand');
    context.background1 = game.settings.get('brp','background1');
    context.background2 = game.settings.get('brp','background2');
    context.background3 = game.settings.get('brp','background3');
    let resource = 2;
    if (game.settings.get('brp','useFP')) {resource++};
    if (game.settings.get('brp','useSAN')) {resource++};
    context.resource = resource;

    // Prepare character data and items.
      this._prepareItems(context);
      this._prepareCharacterData(context);


    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  //
  _prepareCharacterData(context) {
  }  

  //
  _prepareItems(context) {
    // Initialize containers.
    const gears = [];
    const skills = [];
    const skillsDev = [];
    const hitlocs = [];
    const magics = [];
    const mutations = [];
    const psychics = [];
    const sorceries = [];
    const superpowers = [];
    const failings = [];
    const armours = [];
    const weapons = [];
    const wounds = [];
    const allegiances = [];
    const passions = [];


    // Iterate through items, allocating to containers
    this.actor.system.totalProf = 0
    this.actor.system.totalPers = 0

    // Sort items by name - saves sorting all containers by name separately
    context.items.sort(function(a, b){
      let x = a.name;
      let y = b.name;
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });


    // Add items to containers.
    for (let itm of context.items) {
      itm.img = itm.img || DEFAULT_TOKEN;
      if (itm.type === 'gear') {
        itm.system.equippedName = game.i18n.localize('BRP.'+itm.system.equipStatus)
        gears.push(itm);
      } else if (itm.type ==='skill') {
        skillsDev.push(itm)
          itm.system.grandTotal = itm.system.total + this.actor.system.skillcategory[itm.system.category].bonus
        skills.push(itm);
          
        this.actor.system.totalProf = this.actor.system.totalProf + itm.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + itm.system.personal
      } else if (itm.type === 'hit-location') {
        hitlocs.push(itm);
      } else if (itm.type === 'wound') {
        wounds.push(itm);
      } else if (itm.type === 'magic'){
        itm.system.grandTotal = itm.system.total + this.actor.system.skillcategory[itm.system.category].bonus
        magics.push(itm);
        this.actor.system.totalProf = this.actor.system.totalProf + itm.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + itm.system.personal
      } else if (itm.type === 'mutation'){
        mutations.push(itm);
      } else if (itm.type === 'psychic'){
        psychics.push(itm);
        this.actor.system.totalProf = this.actor.system.totalProf + itm.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + itm.system.personal
      } else if (itm.type === 'sorcery'){
        itm.system.ppCost = itm.system.currLvl * itm.system.pppl
        if (itm.system.mem) {
          itm.system.ppCost = itm .system.memLvl * itm.system.pppl
        }
        sorceries.push(itm);
      } else if (itm.type === 'super'){
        superpowers.push(itm);
      }  else if (itm.type === 'failing'){
        failings.push(itm);
      } else if (itm.type === 'armour'){
        if(itm.system.hitlocID) {
          let hitLocTemp = this.actor.items.get(itm.system.hitlocID)
          if (hitLocTemp) {
            itm.system.hitlocName = hitLocTemp.name
          }  
        }
        itm.system.equippedName = game.i18n.localize('BRP.'+itm.system.equipStatus)
        armours.push(itm);
      }  else if (itm.type === 'weapon'){
        if(itm.system.range3 !="") {
          itm.system.rangeName= itm.system.range1 + "/" + itm.system.range2 + "/" + itm.system.range3
        } else if( itm.system.range2 !="") {
          itm.system.rangeName= itm.system.range1 + "/" + itm.system.range2
        } else {
          itm.system.rangeName= itm.system.range1
        }

        if (itm.system.specialDmg) {
          itm.system.dmgName = game.i18n.localize('BRP.special')
        } else if (itm.system.dmg3 != "") {
          itm.system.dmgName= itm.system.dmg1 + "/" + itm.system.dmg2 + "/" + itm.system.dmg3
        } else if( itm.system.dmg2 !="") {
          itm.system.dmgName= itm.system.dmg1 + "/" + itm.system.dmg2
        } else {
          itm.system.dmgName= itm.system.dmg1
        }
        // Get the highest scoring skill that relates to this weapon
        if (itm.system.sourceID) {
          itm.system.skillScore = this.actor.items.get(itm.system.sourceID).system.total + this.actor.system.skillcategory[this.actor.items.get(itm.system.sourceID).system.category].bonus
          itm.system.skillName = this.actor.items.get(itm.system.sourceID).name
        } else {
          itm.system.skillScore = 0
          itm.system.skillName = ""
        }        
        itm.system.equippedName = game.i18n.localize('BRP.'+itm.system.equipStatus)
        weapons.push(itm);
      } else if (itm.type === 'allegiance'){
        if (itm.system.allegApoth) {
          itm.system.rank=game.i18n.localize('BRP.allegApoth')
        } else if (itm.system.allegAllied) {
          itm.system.rank=game.i18n.localize('BRP.allegAllied')
        }
        allegiances.push(itm);
      } else if (itm.type === 'passion'){
        passions.push(itm);
      } 
    }  

    //Add Cateogry Headings to Skills 
    skills.push(
      {name : game.i18n.localize("BRP.cmmnmod"), isType: true, system: {category: "cmmnmod", total: this.actor.system.skillcategory.cmmnmod.bonus}},
      {name : game.i18n.localize("BRP.mnplmod"), isType: true, system: {category: "mnplmod", total: this.actor.system.skillcategory.mnplmod.bonus}},
      {name : game.i18n.localize("BRP.mntlmod"), isType: true, system: {category: "mntlmod", total: this.actor.system.skillcategory.mntlmod.bonus}},
      {name : game.i18n.localize("BRP.percmod"), isType: true, system: {category: "percmod", total: this.actor.system.skillcategory.percmod.bonus}},
      {name : game.i18n.localize("BRP.physmod"), isType: true, system: {category: "physmod", total: this.actor.system.skillcategory.physmod.bonus}},
      {name : game.i18n.localize("BRP.zcmbtmod"), isType: true, system: {category: "zcmbtmod", total: this.actor.system.skillcategory.zcmbtmod.bonus}}
    );

    //Sort Skills by Category then Skill Name
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

    // Sort Hit Locations
    hitlocs.sort(function(a, b){
      let x = a.system.lowRoll;
      let y = b.system.lowRoll;
      if (x < y) {return 1};
      if (x > y) {return -1};
      return 0;
    });

    // Assign and return
    context.gears = gears;
    context.skills = skills;
    context.skillsDev= skillsDev;
    context.hitlocs = hitlocs;
    context.magics = magics;
    context.mutations = mutations;
    context.psychics = psychics;   
    context.sorceries =  sorceries;
    context.superpowers = superpowers;
    context.failings = failings;
    context.armours = armours;
    context.weapons = weapons;
    context.wounds = wounds;
    context.allegiances = allegiances;
    context.passions = passions;

    return context
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).closest(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    if (!this.isEditable) return;

    html.find(".inline-edit").change(this._onSkillEdit.bind(this));                  //Inline Skill Edit
    html.find(".actor-toggle").click(this._onActorToggle.bind(this));                // Actor Toggle
    html.find(".item-toggle").click(this._onItemToggle.bind(this));                  // Item Toggle
    html.find('.item-create').click(this._onItemCreate.bind(this));                  // Add Inventory Item
    html.find('.rollable.charac-name').click(BRPRollType._onStatRoll.bind(this));           // Rollable Characteristic
    html.find('.rollable.skill-name').click(BRPRollType._onSkillRoll.bind(this));           // Rollable Skill
    html.find('.rollable.allegiance-name').click(BRPRollType._onAllegianceRoll.bind(this));           // Rollable Allegiance
    html.find('.rollable.passion-name').click(BRPRollType._onPassionRoll.bind(this));           // Rollable Passion
    html.find('.addWound').click(this._addWound.bind(this));                         // Add Inventory Item
    html.find('.rollable.damage-name').click(BRPRollType._onDamageRoll.bind(this));         // Damage Roll
    html.find('.rollable.weapon-name').click(BRPRollType._onWeaponRoll.bind(this));         // Weapon Skill Roll
    html.find('.rollable.attribute').click(this._onAttribute.bind(this));            // Attribute modifier
    html.find('.rollable.ap-name').click(BRPRollType._onArmour.bind(this));                 // Armour roll
    
    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).closest(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

     //Context Menus
     new BRPContextMenu(html, ".stat-name.contextmenu", contextMenu.characteristicMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".profession.contextmenu", contextMenu.professionMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".personality.contextmenu", contextMenu.personalityMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".skills-tab.contextmenu", contextMenu.skillstabMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".combat-tab.contextmenu", contextMenu.combatMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".skill-name.contextmenu", contextMenu.skillMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".skill-cell-name.contextmenu", contextMenu.skillMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".hitloc-name.contextmenu", contextMenu.hitLocMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".power-name.contextmenu", contextMenu.powerMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".magic-name.contextmenu", contextMenu.magicMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".mutation-name.contextmenu", contextMenu.mutationMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".psychic-name.contextmenu", contextMenu.psychicMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".super-name.contextmenu", contextMenu.superMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".failing-name.contextmenu", contextMenu.failingMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".armour-name.contextmenu", contextMenu.armourMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".gear-name.contextmenu", contextMenu.gearMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".weapon-name.contextmenu", contextMenu.weaponMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".wound-name.contextmenu", contextMenu.woundMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".power.contextmenu", contextMenu.powerAttMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".fatigue.contextmenu", contextMenu.fatigueAttMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".allegiance-name.contextmenu", contextMenu.allegianceMenuOptions(this.actor, this.token));
     new BRPContextMenu(html, ".passion-name.contextmenu", contextMenu.passionMenuOptions(this.actor, this.token));
  }

  // Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
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

    if (type ==='wound') {
      let locId = header.dataset.itemId;
      itemData.name = game.i18n.localize('BRP.wound')
      itemData.system.locId = locId;
      itemData.system.value = 1
    }
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Create the item!
    const newItem = await Item.create(itemData, {parent: this.actor});

    //And in certain circumstances render the new item sheet
    if (itemData.type === 'gear') {
      newItem.sheet.render(true);
    }

  }

  // Handle clickable rolls.
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

  // Update skills etc without opening the item sheet
  async _onSkillEdit(event){
    event.preventDefault();
    const element = event.currentTarget;
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    const field = element.dataset.field;
    const target = 'system.'+field;
    let newScore = Number(element.value);
    await item.update ({ [target]: newScore});
    this.actor.render(false);
    return;
  }

  //Toggle Actor
  async _onActorToggle(event){
    const prop= event.currentTarget.dataset.property;
    let checkProp={};

    if (prop === "lock") {
      checkProp = {[`system.${prop}`] : !this.actor.system[prop]}
    }  else if (prop === 'improve'){
      checkProp = {'system.stats.pow.improve': !this.actor.system.stats.pow.improve}  
    } else if (prop === 'minorWnd'){
      checkProp = {'system.minorWnd': !this.actor.system.minorWnd,
                  'system.health.daily': 0}  
    } else if (prop === 'majorWnd'){
      checkProp = {'system.majorWnd': !this.actor.system.majorWnd,
                  'system.health.daily': 0}  
    } else {return} 

    await this.actor.update(checkProp);
    return
  }

  //Item Toggle
  async _onItemToggle(event) {
    const element = event.currentTarget;
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    const prop = element.dataset.property;
    let checkProp={};
    if (['improve','mem','injured','bleeding','incapacitated','severed','dead','unconscious'].includes(prop)) {
      checkProp = {[`system.${prop}`] : !item.system[prop]}
    } else if (prop === 'equipStatus') {
      if (item.system.equipStatus === 'carried' && item.type === 'armour') {
        checkProp = {'system.equipStatus': "worn"}   
      } else if (item.system.equipStatus === 'carried' && item.type != 'armour') {
        checkProp = {'system.equipStatus': "packed"}     
      } else if (item.system.equipStatus === 'worn') {
        checkProp = {'system.equipStatus': "packed"}   
      } else if (item.system.equipStatus === 'packed') {
        checkProp = {'system.equipStatus': "stored"}   
      } else if (item.system.equipStatus === 'stored') {
        checkProp = {'system.equipStatus': "carried"}   
      }
    } else {return }  

    await item.update (checkProp);
    this.actor.render(false);
    return;
  }

  // Change default on Drop Item Create routine for requirements (single items and folder drop)-----------------------------------------------------------------
  async _onDropItemCreate(itemData) {
    const newItemData = await BRPactorItemDrop._BRPonDropItemCreate(this.actor,itemData);
    return this.actor.createEmbeddedDocuments("Item", newItemData);
  }  

  //Add a Wound
  async _addWound(event) {
    await BRPDamage.takeDamage(event, this.actor, this.token,0)
  }


  //Start Attribute modify
    async _onAttribute(event) {
    let att = event.currentTarget.closest('.attribute').dataset.att
    let adj = event.currentTarget.closest('.attribute').dataset.adj
    let checkprop = ""
    let newVal = this.actor.system[att].value
    let newMax = this.actor.system[att].max
    if (adj === 'spend'){
      checkprop = {[`system.${att}.value`] : newVal-1}
    } else if (adj === 'recover' && newVal < newMax){
      checkprop = {[`system.${att}.value`] : newVal+1}      
    } else {return}
    
    this.actor.update(checkprop)    
  }


}
