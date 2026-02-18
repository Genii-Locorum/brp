import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { BRPUtilities } from '../../apps/utilities.mjs'
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";

export class BRPSkillSheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
    this.#dragDrop = this.#createDragDropHandlers()
  }

  static DEFAULT_OPTIONS = {
    classes: ['skill'],
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.droppable' }],
    position: {
      width: 535,
      height: 620
    },
    form: {
      handler: BRPSkillSheet.mySkillHandler
    }
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/skill.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/skill.detail.hbs',
      scrollable: ['']
    },
    description: { template: 'systems/brp/templates/item/item.description.hbs' },
    gmNotes: { template: 'systems/brp/templates/item/item.gmnotes.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    const actor = this.item.parent
    const itemData = context.item
    context.pcOwner = false
    if (context.hasOwner) {
      if (this.item.parent.type === 'character') {
        context.pcOwner = true
      }
    }
    //Get drop down options from select-lists.mjs
    context.statOptions = await BRPSelectLists.getStatOptions();
    context.catOptions = await BRPSelectLists.getCategoryOptions();
    context.wpnOptions = await BRPSelectLists.getWpnCategoryOptions();
    context.funcOptions = await BRPSelectLists.getFunctionalOptions();
    context.stat1 = game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.baseFormula[1].stat]);
    context.stat2 = game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.baseFormula[2].stat]);
    context.catName = game.i18n.localize("BRP." + this.item.system.category.split('.')[2]);
    context.wpnType = game.i18n.localize("BRP." + this.item.system.subType);
    context.funcDisp = game.i18n.localize("BRP." + this.item.system.baseFormula.Func);
    itemData.system.total = itemData.system.base + itemData.system.xp + itemData.system.effects + itemData.system.personality + itemData.system.profession + itemData.system.personal + itemData.system.culture;
    //Ensure mainName is populated
    if (this.item.system.mainName === "") {
      this.item.update({ 'system.mainName': this.item.name });
    }
    const grpSkill = [];
    for (let skill of itemData.system.groupSkills) {
      let tempSkill = (await game.system.api.brpid.fromBRPIDBest({ brpid: skill.brpid }))[0]
      if (tempSkill) {
        grpSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: tempSkill.name, category: tempSkill.system.category, variable: tempSkill.system.variable, base: tempSkill.system.base, group: tempSkill.system.group })
      } else {
        grpSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: game.i18n.localize("BRP.invalid"), category: "", variable: "", base: "", group: "" })
      }
    }

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
  static async mySkillHandler(event, form, formData) {
    const skillName = formData.object['system.mainName'] || this.item.system.mainName
    if (this.item.system.specialism) {
      const specialization = formData.object['system.specName'] || this.item.system.specName
      formData.object.name = skillName + ' (' + specialization + ')'
    } else {
      formData.object.name = skillName
    }
    const system = foundry.utils.expandObject(formData.object)?.system
    if (typeof system != 'undefined') {
      if (system.groups) {
        formData['system.groups'] = Object.values(
          system.groups || []
        )
        for (let index = 0; index < this.item.system.groups.length; index++) {
          formData[`system.groups.${index}.skills`] = foundry.utils.duplicate(
            this.item.system.groups[index].skills
          )
        }
      }
    }
    await this.document.update(formData.object)
  }


  //-----------------------ACTIONS-----------------------------------

  //Allow for a skill being dragged and dropped on to the skill sheet either in the group skill list
  async _onDrop(event, type = 'skill', collectionName = 'groupSkills') {
    event.preventDefault()
    event.stopPropagation()

    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []

    for (const item of dataList) {
      if (!item || !item.system) continue
      if (![type].includes(item.type)) {
        continue
      }

      //Dropping in Main Skill list
      if ((item.system.specialism && item.system.chosen) || (!item.system.specialism)) {
        if (item.system.group) { //if this is a Group Skill then don't add it to main skill list
          ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.stopGroupSkill'));
          continue
        } else if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
          ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
          continue
        }
      }
      collection.push({ uuid: item.uuid, brpid: item.flags.brp.brpidFlag.id })
    }

    await this.item.update({ [`system.${collectionName}`]: collection })
  }


  //Delete's a skill in the main skill list
  async _onItemDelete(event, collectionName = 'groupSkills') {
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
