import {onManageActiveEffect, prepareActiveEffectCategories} from "../effects/effects.mjs";
import { BRPChecks } from "../rolls/checks.mjs";
import { statMenuOptions } from "./context-menus/characteristics-cm.mjs";
import { skillMenuOptions } from "./context-menus/skills-cm.mjs";
import { statDerivOptions } from "./context-menus/deriv-cm.mjs";
import { HPMenuOptions } from "./context-menus/HP-cm.mjs";
import { FPMenuOptions } from "./context-menus/FP-cm.mjs";
import { PPMenuOptions } from "./context-menus/PP-cm.mjs";
import { SpeciesMenuOptions } from "./context-menus/species-cm.mjs";
import { BRPCharGen } from "../actor/character-creation.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class BRPActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["brp", "sheet", "actor"],
      template: "systems/brp/actor/actor-sheet.html",
      width: 820,
      height: 650,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/brp/actor/actor-${this.actor.type}-sheet.html`;
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
    context.useEDU = game.settings.get('brp','useEDU');
    context.useMP = game.settings.get('brp','useMP');
    context.useFP = game.settings.get('brp','useFP');
    context.useSAN = game.settings.get('brp','useSAN');
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
    const gear = [];
    const species = [];
    const skills = [];
    const categories = [];
    const weapons = [];


    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'item') {
        gear.push(i);
      }
      // Append to skills.
      else if (i.type === 'skill') {
        i.system.total = i.system.base + i.system.xp + i.system.effects
        if (i.system.weapon) {
          weapons.push(i)
        } else {
        skills.push(i);
        }
      }
      // Append to species.
      else if (i.type === 'species') {
        species.push(i);
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

    // Assign and return
    context.gear = gear;
    context.skills = skills;
    context.species = species;
    context.weapons = weapons;
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

    // Roll for Stat.
    html.find('.rollable.skill-name').click(BRPChecks._onSkillRoll.bind(this));


    //Character Context Menu
    new ContextMenu(html, ".stat-name.contextmenu", statMenuOptions(this.actor, this.token));
    new ContextMenu(html, ".deriv-name.contextmenu", statDerivOptions(this.actor, this.token));
    new ContextMenu(html, ".health.contextmenu", HPMenuOptions(this.actor, this.token));
    new ContextMenu(html, ".fatigue.contextmenu", FPMenuOptions(this.actor, this.token));
    new ContextMenu(html, ".power.contextmenu", PPMenuOptions(this.actor, this.token));
    new ContextMenu(html, ".species.contextmenu", SpeciesMenuOptions(this.actor, this.token));
    new ContextMenu(html, ".skill-name.contextmenu", skillMenuOptions(this.actor, this.token));

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
    return await Item.create(itemData, {parent: this.actor});
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




}
