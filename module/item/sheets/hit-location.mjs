import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";

export class BRPHitLocSheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['hit-location'],
    position: {
      width: 520,
      height: 480
    },
    form: {
      handler: BRPHitLocSheet.myHitLocHandler
    }
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/item.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/hit-location.detail.hbs',
      scrollable: ['']
    },
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    context.headerDisplay = true;
    context.locTypeOptions = await BRPSelectLists.getHitLocType();
    context.hitLocName = game.i18n.localize('BRP.' + this.item.system.locType)
    context.tabs = this._getTabs(options.parts);
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'details':
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
      }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    //Only show GM tab if you are GM
    options.parts = ['header', 'tabs', 'details'];
  }

  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
  }

  //--------------------HANDLER----------------------------------
  static async myHitLocHandler(event, form, formData) {
    const displayName = formData.object['system.displayName'] || this.item.system.displayName
    const creatureType = formData.object['system.creatureType'] || this.item.system.creatureType
    if (creatureType === "") {
      formData.object.name = displayName
    } else {
      formData.object.name = displayName + ' (' + creatureType + ')'
    }

    await this.document.update(formData.object)
  }


  //-----------------------ACTIONS-----------------------------------

}

