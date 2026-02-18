import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPActiveEffectSheet } from "../../sheets/brp-active-effect-sheet.mjs";
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";

export class BRPWoundSheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['wound'],
    position: {
      width: 520,
      height: 480
    },
    form: {
      handler: BRPWoundSheet.myWoundHandler
    }
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/item.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/wound.detail.hbs',
      scrollable: ['']
    },
    effects: {template: 'systems/brp/templates/item/item.active-effects.hbs'}
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
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
    }
    return context;
  }

  _getTabs(parts) {
    const tabGroup = 'primary';
    //Default tab
    if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = 'details';
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
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    //Only show GM tab if you are GM
    options.parts = ['header', 'tabs', 'details','effects'];
  }

  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
    BRPActiveEffectSheet.activateListeners(this)
  }

  //--------------------HANDLER----------------------------------
  static async myWoundHandler(event, form, formData) {
    if (!formData.object['system.value']) {
      formData.object['system.value'] = 0
    } else if (formData.object['system.value'] < 0) {
      formData.object['system.value'] = 0
    }
    await this.document.update(formData.object)
  }


  //-----------------------ACTIONS-----------------------------------

}

