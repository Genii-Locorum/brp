import { BRPUtilities } from '../../apps/utilities.mjs'
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";

export class BRPPersonalitySheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
    this.#dragDrop = this.#createDragDropHandlers()
  }

  static DEFAULT_OPTIONS = {
    classes: ['personality'],
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.droppable' }],
    position: {
      width: 520,
      height: 550
    },
    form: {
      handler: BRPPersonalitySheet.myPersonalityHandler
    }
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/item.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/personality.detail.hbs',
      scrollable: ['']
    },
    description: { template: 'systems/brp/templates/item/item.description.hbs' },
    gmNotes: { template: 'systems/brp/templates/item/item.gmnotes.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    const actor = this.item.parent
    const itemData = context.item
    const perSkill = [];
    const grpSkill = [];
    for (let skill of itemData.system.skills) {
      let tempSkill = (await game.system.api.brpid.fromBRPIDBest({ brpid: skill.brpid }))[0]
      if (tempSkill) {
        perSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: tempSkill.name, category: tempSkill.system.category, variable: tempSkill.system.variable, base: tempSkill.system.base, group: tempSkill.system.group })
      } else {
        perSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: game.i18n.localize("BRP.invalid"), category: "", variable: "", base: "", group: "" })
      }
    }
    for (let index = 0; index < this.item.system.groups.length; index++) {
      for (let skill of this.item.system.groups[index].skills) {
        let tempSkill = (await game.system.api.brpid.fromBRPIDBest({ brpid: skill.brpid }))[0]
        if (tempSkill) {
          grpSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: tempSkill.name, category: tempSkill.system.category, variable: tempSkill.system.variable, base: tempSkill.system.base, group: tempSkill.system.group, index: index })
        } else {
          grpSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: game.i18n.localize("BRP.invalid"), category: "", variable: "", base: "", group: "", index: index })
        }
      }
    }
    context.perSkill = perSkill.sort(BRPUtilities.sortByNameKey);
    context.grpSkill = grpSkill.sort(BRPUtilities.sortByNameKey);
    context.tabs = this._getTabs(options.parts);
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'details':
      case 'description':
        context.tab = context.tabs[partId];
        context.enrichedDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.item.system.description,
          {
            secrets: this.document.isOwner,
            rollData: this.document.getRollData(),
            relativeTo: this.document,
          }
        );
        break;
      case 'gmNotes':
        context.tab = context.tabs[partId];
        context.enrichedGMDescription = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          this.item.system.gmDescription,
          {
            secrets: this.document.isOwner,
            rollData: this.document.getRollData(),
            relativeTo: this.document,
          }
        );
        break;
    }
    return context;
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
    //Default tab
    if (!this.tabGroups[tabGroup]) {
      if (game.settings.get('brp','defaultTab')) {
        this.tabGroups[tabGroup] = 'description';
      }  else {
        this.tabGroups[tabGroup] = 'details';
      }
    }
    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        id: '',
        icon: '',
        label: 'BRP.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'details':
          tab.id = 'details';
          tab.label += 'details';
          break;
        case 'description':
          tab.id = 'description';
          tab.label += 'description';
          break;
        case 'gmNotes':
          tab.id = 'gmNotes';
          tab.label += 'gmNotes';
          break;
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    //Only show GM tab if you are GM
    options.parts = ['header', 'tabs', 'details', 'description'];
    if (game.user.isGM) {
      options.parts.push('gmNotes');
    }
  }

  //Activate event listeners using the prepared sheet HTML
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element))
    this.element.querySelectorAll('.item-delete').forEach(n => n.addEventListener("click", this._onItemDelete.bind(this)));
    this.element.querySelectorAll('.item-view').forEach(n => n.addEventListener("click", this._onItemView.bind(this)));
    this.element.querySelectorAll('.group-item-delete').forEach(n => n.addEventListener("click", this._onGroupItemDelete.bind(this)));
    this.element.querySelectorAll('.group-control').forEach(n => n.addEventListener("click", this._onGroupControl.bind(this)));
  }

  //--------------------HANDLER----------------------------------
  static async myPersonalityHandler(event, form, formData) {
    const system = foundry.utils.expandObject(formData.object)?.system
    if (typeof system != 'undefined') {
      if (system.groups) {
        formData.object['system.groups'] = Object.values(
          system.groups || []
        )
        for (let index = 0; index < this.item.system.groups.length; index++) {
          formData.object[`system.groups.${index}.skills`] = foundry.utils.duplicate(
            this.item.system.groups[index].skills
          )
        }
      }
    }
    await this.document.update(formData.object)
  }


  //-----------------------ACTIONS-----------------------------------


  //Allow for a skill being dragged and dropped on to the peronality sheet either in the main skill list or an Optional Group
  async _onDrop(event, type = 'skill', collectionName = 'skills') {
    event.preventDefault()
    event.stopPropagation()

    const optionalSkill = event?.currentTarget?.classList?.contains('optional-skills')
    const ol = event?.currentTarget?.closest('ol')
    const index = ol?.dataset?.group
    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
    const groups = this.item.system.groups ? foundry.utils.duplicate(this.item.system.groups) : []
    for (const item of dataList) {
      if (!item || !item.system) { continue }
      if (![type].includes(item.type)) { continue }

      //If dropping in Optional Skill Group
      if (optionalSkill) {
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization can be included many times
          if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
            continue // If skill is already in main don't add it
          }
          if (groups[index].skills.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
            continue // If skill is already in this group don't add it (doesn't stop skill being added to different groups)
          }
        }

        groups[index].skills = groups[index].skills.concat({ uuid: item.uuid, brpid: item.flags.brp.brpidFlag.id })
      } else {
        //Dropping in Main Skill list
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization and group skill can be included many times, otherwise check skill name doesnt exist in the list.
          if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
            continue
          }

          for (let i = 0; i < groups.length; i++) {
            // If the same skill is in one of the group remove it from the groups
            const index = groups[i].skills.findIndex(
              el => el.brpid === item.flags.brp.brpidFlag.id
            )
            if (index !== -1) {
              groups[i].skills.splice(index, 1)
            }
          }
        }
        collection.push({ uuid: item.uuid, brpid: item.flags.brp.brpidFlag.id })
      }
    }
    await this.item.update({ 'system.groups': groups })
    await this.item.update({ [`system.${collectionName}`]: collection })
  }

  //Controls to add/delete Optional Skill Groups
  async _onGroupControl(event) {
    event.preventDefault()
    const a = event.currentTarget

    // Add a new Optional Skill Group
    if (a.classList.contains('add-group')) {
      //await this._onSubmit(event) // Submit any unsaved changes
      const groups = this.item.system.groups ? foundry.utils.duplicate(this.item.system.groups) : []
      let newGroups = groups.concat([{ options: 1, skills: [] }])
      await this.item.update({
        'system.groups': newGroups
      })
    }

    //Delete an Optional Skill Group
    if (a.classList.contains('remove-group')) {
      //await this._onSubmit(event) // Submit any unsaved changes
      const groups = this.item.system.groups ? foundry.utils.duplicate(this.item.system.groups) : []
      const ol = a.closest('.item-list.group')
      groups.splice(Number(ol.dataset.group), 1)
      await this.item.update({ 'system.groups': groups })
    }
  }

  //Delete's a skill in the main skill list
  async _onItemDelete(event, collectionName = 'skills') {
    event.preventDefault();
    event.stopImmediatePropagation();
    const item = $(event.currentTarget).closest('.item')
    const itemId = item.data('item-id')
    const itemIndex = this.item.system[collectionName].findIndex(i => (itemId && i.uuid === itemId))
    if (itemIndex > -1) {
      const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
      collection.splice(itemIndex, 1)
      await this.item.update({ [`system.${collectionName}`]: collection })
    }
  }

  //Delete's a skill in an Optional Skill Group
  async _onGroupItemDelete(event) {
    const item = $(event.currentTarget).closest('.item')
    const group = Number(item.closest('.item-list.group').data('group'))
    const groups = foundry.utils.duplicate(this.item.system.groups)
    if (typeof groups[group] !== 'undefined') {
      const itemId = item.data('item-id')
      const itemIndex = groups[group].skills.findIndex(i => (itemId && i.uuid === itemId))
      if (itemIndex > -1) {
        groups[group].skills.splice(itemIndex, 1)
        await this.item.update({ 'system.groups': groups })
      }
    }
  }

  async _onItemView(event) {
    const item = $(event.currentTarget).closest('.item')
    const brpid = item.data('brpid')
    let tempItem = (await game.system.api.brpid.fromBRPIDBest({ brpid: brpid }))[0]
    if (tempItem) { tempItem.sheet.render(true) };
  }

  // DragDrop
  //
  //
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }


  _onDragStart(event) {
    const li = event.currentTarget;
    if ('link' in event.target.dataset) return;

    let dragData = null;

    // Active Effect
    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  _onDragOver(event) { }

  async _onDropItem(event, data) {
    if (!this.item.isOwner) return false;
  }

  async _onDropFolder(event, data) {
    if (!this.item.isOwner) return [];
  }

  get dragDrop() {
    return this.#dragDrop;
  }

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop;

  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop.implementation(d);
    });
  }

}
