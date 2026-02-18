import { BRPActiveEffectSheet } from "../../sheets/brp-active-effect-sheet.mjs";
import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";


export class BRPGearSheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['gear'],
    position: {
      width: 520,
      height: 600
    },
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/item.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/gear.detail.hbs',
      scrollable: ['']
    },
    effects: { template: 'systems/brp/templates/item/item.active-effects.hbs' },
    description: { template: 'systems/brp/templates/item/item.description.hbs' },
    gmNotes: { template: 'systems/brp/templates/item/item.gmnotes.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    const actor = this.item.parent
    context.burdenOptions = await BRPSelectLists.getArmourBurdenOptions();
    context.priceOptions = await BRPSelectLists.getPriceOptions();
    if (actor) {
      context.hitLocOptions = await BRPSelectLists.getHitLocOptions(actor);
    };
    context.equippedOptions = await BRPSelectLists.getEquippedOptions(this.document.type);
    context.priceName = game.i18n.localize("BRP." + this.item.system.price);
    context.priceOptions = await BRPSelectLists.getPriceOptions();
    context.effects = BRPActiveEffectSheet.getItemEffectsFromSheet(this.document)
    const changesActiveEffects = BRPActiveEffectSheet.getEffectChangesFromSheet(this.document)
    context.effectKeys = changesActiveEffects.effectKeys
    context.effectChanges = changesActiveEffects.effectChanges
    context.tabs = this._getTabs(options.parts);
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'details':
      case 'effects':
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
        case 'effects':
          tab.id = 'effects';
          tab.label += 'effects';
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
    options.parts = ['header', 'tabs', 'details', 'effects', 'description'];
    if (game.user.isGM) {
      options.parts.push('gmNotes');
    }
  }

  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
    BRPActiveEffectSheet.activateListeners(this)
  }

  //-----------------------ACTIONS-----------------------------------
}




