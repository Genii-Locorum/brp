import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";

export class BRPPsychicSheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['psychic'],
    position: {
      width: 520,
      height: 575
    },
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/item.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/psychic.detail.hbs',
      scrollable: ['']
    },
    description: { template: 'systems/brp/templates/item/item.description.hbs',
      scrollable: ['']
    },
    gmNotes: { template: 'systems/brp/templates/item/item.gmnotes.hbs',
      scrollable: ['']
    },
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    //If power label game setting  change item type label
    if (game.settings.get('brp', this.item.type + 'Label') != "") {
      context.itemType = game.settings.get('brp', this.item.type + 'Label')
    }
    //Get drop down options from select-lists.mjs
    context.pcOwner = false
    if (context.hasOwner) {
      if (this.item.parent.type === 'character') {
        context.pcOwner = true
      }
    }
    context.catOptions = await BRPSelectLists.getSpellCatOptions();
    context.catName = game.i18n.localize("BRP." + this.item.system.impact);
    context.skillCatOptions = await BRPSelectLists.getCategoryOptions();
    const itemData = context.item
    let skillCat = (await game.system.api.brpid.fromBRPIDBest({ brpid: this.item.system.category }))[0]
    if (skillCat) {
      context.skillCatName = skillCat.name
    } else {
      context.skillCatName = ""
    }
    itemData.system.total = itemData.system.base + itemData.system.xp + itemData.system.effects + itemData.system.personality + itemData.system.profession + itemData.system.personal + + itemData.system.culture;
    context.tabs = this._getTabs(options.parts);
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'details':
        context.tab = context.tabs[partId];
        break;
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
  _onRender(context, _options) {
  }

  //-----------------------ACTIONS-----------------------------------

}
