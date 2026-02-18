import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";

export class BRPSorcerySheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['sorcery'],
    position: {
      width: 520,
      height: 525
    },
    form: {
      handler: BRPSorcerySheet.mySorceryHandler
    }
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/item.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/sorcery.detail.hbs',
      scrollable: ['']
    },
    description: { template: 'systems/brp/templates/item/item.description.hbs' },
    gmNotes: { template: 'systems/brp/templates/item/item.gmnotes.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    //If power label game setting  change item type label
    if (game.settings.get('brp', this.item.type + 'Label') != "") {
      context.itemType = game.settings.get('brp', this.item.type + 'Label')
    }
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

  //--------------------HANDLER----------------------------------
  static async mySorceryHandler(event, form, formData) {
    const system = foundry.utils.expandObject(formData.object)?.system
    if (!formData.object['system.maxLvl']) {
      formData.object['system.maxLvl'] = this.item.system.maxLvl
    }
    if (formData.object['system.maxLvl'] < 1) { formData['system.maxLvl'] = 1 }

    if (!this.item.system.var) {
      formData.object['system.currLvl'] = formData.object['system.maxLvl']
      formData.object['system.memLvl'] = formData.object['system.maxLvl']
    } else {
      let currLvl = await Math.min(Math.max(formData.object['system.currLvl'], 1),formData.object['system.maxLvl'])
      let memLvl = await Math.min(Math.max(formData.object['system.memLvl'], 1),currLvl)
      formData.object['system.currLvl'] = currLvl
      formData.object['system.memLvl'] = memLvl
    }
    await this.document.update(formData.object)
    this.item.render(false);
  }

  //-----------------------ACTIONS-----------------------------------
}


