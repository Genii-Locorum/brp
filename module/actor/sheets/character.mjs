import { BRPContextMenu } from '../../setup/context-menu.mjs';
import * as contextMenu from "../actor-cm.mjs";
import {BRPactorItemDrop} from '../actor-itemDrop.mjs';
import {BRPCheck} from '../../apps/check.mjs';
import {isCtrlKey} from '../../apps/helper.mjs'
import {BRPDamage} from '../../apps/damage.mjs';

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
    context.useEDU = game.settings.get('brp','useEDU');
    context.useMP = game.settings.get('brp','useMP');
    context.useFP = game.settings.get('brp','useFP');
    context.useSAN = game.settings.get('brp','useSAN');
    context.useHPL = game.settings.get('brp','useHPL');
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
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      if (i.type === 'gear') {
        i.system.equippedName = game.i18n.localize('BRP.'+i.system.equipStatus)
        gears.push(i);
      } else if (i.type ==='skill') {
        skills.push(i);
        skillsDev.push(i)
        this.actor.system.totalProf = this.actor.system.totalProf + i.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + i.system.personal
      } else if (i.type === 'hit-location') {
        hitlocs.push(i);
      } else if (i.type === 'wound') {
        wounds.push(i);
      } else if (i.type === 'magic'){
        magics.push(i);
        this.actor.system.totalProf = this.actor.system.totalProf + i.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + i.system.personal
      } else if (i.type === 'mutation'){
        mutations.push(i);
      } else if (i.type === 'psychic'){
        psychics.push(i);
        this.actor.system.totalProf = this.actor.system.totalProf + i.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + i.system.personal
      } else if (i.type === 'sorcery'){
        i.system.ppCost = i.system.currLvl * i.system.pppl
        if (i.system.mem) {
          i.system.ppCost = i .system.memLvl * i.system.pppl
        }
        sorceries.push(i);
      } else if (i.type === 'super'){
        superpowers.push(i);
      }  else if (i.type === 'failing'){
        failings.push(i);
      } else if (i.type === 'armour'){
        if(i.system.hitlocID) {
          let hitLocTemp = this.actor.items.get(i.system.hitlocID)
          if (hitLocTemp) {
            i.system.hitlocName = hitLocTemp.name
          }  
        }
        i.system.equippedName = game.i18n.localize('BRP.'+i.system.equipStatus)
        armours.push(i);
      }  else if (i.type === 'weapon'){
        if(i.system.range3 !="") {
          i.system.rangeName= i.system.range1 + "/" + i.system.range2 + "/" + i.system.range3
        } else if( i.system.range2 !="") {
          i.system.rangeName= i.system.range1 + "/" + i.system.range2
        } else {
          i.system.rangeName= i.system.range1
        }

        if (i.system.specialDmg) {
          i.system.dmgName = game.i18n.localize('BRP.special')
        } else if (i.system.dmg3 != "") {
          i.system.dmgName= i.system.dmg1 + "/" + i.system.dmg2 + "/" + i.system.dmg3
        } else if( i.system.dmg2 !="") {
          i.system.dmgName= i.system.dmg1 + "/" + i.system.dmg2
        } else {
          i.system.dmgName= i.system.dmg1
        }
        // Get the highest scoring skill that relates to this weapon
        let skillId ="";
        let score = 0;
        let skill1Name = ""
        let skill2Name = ""
        let skillSelect = "";
        if (i.system.skill1 != "none") {
          skillSelect = game.items.get(i.system.skill1)
          skill1Name = skillSelect ? skillSelect.name : "";
        }
        if (i.system.skill2 != "none") {
          skillSelect = game.items.get(i.system.skill2)
          skill2Name = skillSelect ? skillSelect.name : "";
        }  
        for (let j of this.actor.items) {
          if (j.type === 'skill' && (j.name === skill1Name || j.name === skill2Name)) {
            if (j.system.total > score) {
              score = j.system.total
              skillId = j._id
            }  
          }
        }
        i.system.skillId = skillId
        if (i.system.skillId) {
          i.system.skillScore = this.actor.items.get(i.system.skillId).system.total
          i.system.skillName = this.actor.items.get(i.system.skillId).name
        } else {
          i.system.skillScore = 0
          i.system.skillName = ""
        }        
        i.system.equippedName = game.i18n.localize('BRP.'+i.system.equipStatus)
        weapons.push(i);
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
    html.find('.rollable.charac-name').click(this._onStatRoll.bind(this));           // Rollable Characteristic
    html.find('.rollable.skill-name').click(this._onSkillRoll.bind(this));           // Rollable Skill
    html.find('.addWound').click(this._addWound.bind(this));                         // Add Inventory Item
    
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
     new BRPContextMenu(html, ".combat-name.contextmenu", contextMenu.combatMenuOptions(this.actor, this.token));
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
    console.log(prop,li)
    let checkProp={};
    if (prop === 'improve' || prop === 'mem' || prop ==='injured' || prop ==='bleeding' || prop ==='incapacitated' || prop ==='severed' || prop ==='dead' || prop ==='unconscious' ) {
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

  //Start Characteristic Roll
  async _onStatRoll(event){
    let altKey = event.altKey;
    let ctrlKey = isCtrlKey(event ?? false);
    let cardType = 'NO';
    let characteristic = event.currentTarget.dataset.characteristic;
    if (ctrlKey){ cardType='RE'}
    if (altKey){ 
      cardType='PP';
      characteristic='pow'
    }
    BRPCheck._trigger({
        rollType: 'CH',
        cardType,
        characteristic,
        event,
        actor: this.actor,
        token: this.token
    })
  }

  //Start Skill Roll
  async _onSkillRoll(event){
    let altKey = event.altKey;
    let ctrlKey = isCtrlKey(event ?? false);
    let cardType = 'NO';
    let skillId = event.currentTarget.closest('.item').dataset.itemId;
    // if (ctrlKey){cardType='OP'}
    // if (altKey){cardType='GR'}
  
    BRPCheck._trigger({
        rollType: 'SK',
        cardType,
        skillId,
        event,
        actor: this.actor,
        token: this.token
    })
  }


}
