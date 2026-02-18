import { BRPUtilities } from '../../apps/utilities.mjs'
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";

export class BRPSuperSheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
    this.#dragDrop = this.#createDragDropHandlers()
  }

  static DEFAULT_OPTIONS = {
    classes: ['super'],
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.droppable' }],
    position: {
      width: 535,
      height: 550
    },
    form: {
      handler: BRPSuperSheet.mySuperHandler
    }
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/skill.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/super.detail.hbs',
      scrollable: ['']
    },
    description: { template: 'systems/brp/templates/item/item.description.hbs' },
    gmNotes: { template: 'systems/brp/templates/item/item.gmnotes.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    const actor = this.item.parent
    const itemData = context.item
    //If power label game setting  change item type label
    if (game.settings.get('brp', this.item.type + 'Label') != "") {
      context.itemType = game.settings.get('brp', this.item.type + 'Label')
    }

    const powerMods = [];
    if (actor) {
      for (let itm of itemData.system.powerMod) {
        let tempItm = fromUuidSync(itm.uuid)
        powerMods.push(tempItm);
      }
    }
    context.powerMods = powerMods.sort(BRPUtilities.sortByNameKey);

    //Ensure mainName is populated
    if (this.item.system.mainName === "") {
      this.item.update({ 'system.mainName': this.item.name });
    }
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
      if (game.settings.get('brp', 'defaultTab')) {
        this.tabGroups[tabGroup] = 'description';
      } else {
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
  }


  //--------------------HANDLER----------------------------------
  static async mySuperHandler(event, form, formData) {
    const skillName = formData.object['system.mainName'] || this.item.system.mainName
    if (this.item.system.specialism) {
      const specialization = formData.object['system.specName'] || this.item.system.specName
      formData.object.name = skillName + ' (' + specialization + ')'
    } else {
      formData.object.name = skillName
    }
    await this.document.update(formData.object)
  }


  //-----------------------ACTIONS-----------------------------------

  //Allow for a skill being dragged and dropped on to the peronality sheet either in the main skill list or an Optional Group
  async _onDrop(event, type = 'powerMod', collectionName = 'powerMod') {
    event.preventDefault()
    event.stopPropagation()
    //If the item isn't owned by an actor then don't allow the drop
    if (!this.item.parent) { return }
    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []

    for (const item of dataList) {
      if (!item || !item.system) continue
      if (![type].includes(item.type)) {
        continue
      }

      //Dropping in Main Skill list
      if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
        ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
        continue
      }

      //Create Embedded PowerMod on Actor Sheet and push the ID in to the collection (i.e. don't push the item)
      const actor = this.item.parent
      const itemData = foundry.utils.duplicate(item)
      let newItem = await Item.create(itemData, { parent: actor });
      collection.push({ uuid: newItem.uuid, brpid: newItem.flags.brp.brpidFlag.id })
    }
    await this.item.update({ [`system.${collectionName}`]: collection })
  }

  //Delete's a skill in the main skill list
  async _onItemDelete(event, collectionName = 'powerMod') {
    event.preventDefault();
    event.stopImmediatePropagation();
    const item = $(event.currentTarget).closest('.item')
    const itemId = item.data('item-id')
    const itemIndex = this.item.system[collectionName].findIndex(i => (itemId && i.uuid === itemId))
    if (itemIndex > -1) {
      const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
      collection.splice(itemIndex, 1)
      await this.item.update({ [`system.${collectionName}`]: collection })
      const oldItem = fromUuidSync(itemId);
      oldItem.delete();
    }
  }

  //View an item in the main list
  async _onItemView(event) {
    const target = $(event.currentTarget).closest('.item')
    const itemId = target.data('item-id')
    const item = await fromUuid(itemId)
    item.sheet.render(true);
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
