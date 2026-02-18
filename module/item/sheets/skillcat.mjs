import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";


export class BRPSkillCategory extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['skillcat'],
    position: {
      width: 520,
      height: 610
    },
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/item.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/skillcat.detail.hbs',
      scrollable: ['']
    },
    description: { template: 'systems/brp/templates/item/item.description.hbs' },
    gmNotes: { template: 'systems/brp/templates/item/item.gmnotes.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)

    //Get drop down options from select-lists.mjs
    context.statOptions = await BRPSelectLists.addStatOptions();
    context.statName = game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.stat]);
    context.advStatOptionsStr = await BRPSelectLists.getAdvSkillCatOptions();
    context.advStatOptionsCon = await BRPSelectLists.getAdvSkillCatOptions();
    context.advStatOptionsInt = await BRPSelectLists.getAdvSkillCatOptions();
    context.advStatOptionsSiz = await BRPSelectLists.getAdvSkillCatOptions();
    context.advStatOptionsPow = await BRPSelectLists.getAdvSkillCatOptions();
    context.advStatOptionsDex = await BRPSelectLists.getAdvSkillCatOptions();
    context.advStatOptionsCha = await BRPSelectLists.getAdvSkillCatOptions();
    context.advStatOptionsEdu = await BRPSelectLists.getAdvSkillCatOptions();
    context.skillCatNameStr = game.i18n.localize('BRP.advSkillCat.' + this.item.system.attrib.str)
    context.skillCatNameCon = game.i18n.localize('BRP.advSkillCat.' + this.item.system.attrib.con)
    context.skillCatNameInt = game.i18n.localize('BRP.advSkillCat.' + this.item.system.attrib.int)
    context.skillCatNameSiz = game.i18n.localize('BRP.advSkillCat.' + this.item.system.attrib.siz)
    context.skillCatNamePow = game.i18n.localize('BRP.advSkillCat.' + this.item.system.attrib.pow)
    context.skillCatNameDex = game.i18n.localize('BRP.advSkillCat.' + this.item.system.attrib.dex)
    context.skillCatNameCha = game.i18n.localize('BRP.advSkillCat.' + this.item.system.attrib.cha)
    context.skillCatNameEdu = game.i18n.localize('BRP.advSkillCat.' + this.item.system.attrib.edu)

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
