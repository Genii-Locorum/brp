import { BRPActiveEffectSheet } from "../../sheets/brp-active-effect-sheet.mjs";
import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPItemSheetV2 } from "./base-item-sheet.mjs";

export class BRPWeaponSheet extends BRPItemSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['armour'],
    position: {
      width: 600,
      height: 640
    },
  }

  static PARTS = {
    header: { template: 'systems/brp/templates/item/item.header.hbs' },
    tabs: { template: 'systems/brp/templates/global/parts/tab-navigation.hbs' },
    details: {
      template: 'systems/brp/templates/item/weapon.detail.hbs',
      scrollable: ['']
    },
    effects: { template: 'systems/brp/templates/item/item.active-effects.hbs' },
    description: { template: 'systems/brp/templates/item/item.description.hbs' },
    gmNotes: { template: 'systems/brp/templates/item/item.gmnotes.hbs' }
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    const actor = this.item.parent

    context.npcOwner = false
    if (context.hasOwner) {
      if (this.item.parent.type === 'npc') {
        context.npcOwner = true
      }
    }
    let skillSelect = "";
    //Get drop down options from select-lists.mjs
    context.priceOptions = await BRPSelectLists.getPriceOptions();
    context.equippedOptions = await BRPSelectLists.getEquippedOptions(this.document.type);
    context.priceName = game.i18n.localize("BRP." + this.item.system.price);
    context.equippedName = game.i18n.localize("BRP." + this.item.system.equipStatus);
    context.weaponOptions = await BRPSelectLists.getWpnCategoryOptions();
    context.damOptions = await BRPSelectLists.getDamBonusOptions();
    context.specialOptions = await BRPSelectLists.getSpecialOptions();
    context.handedOptions = await BRPSelectLists.getHandedOptions();
    context.wpnSkillOptions1 = await BRPSelectLists.getWeaponSkillOptions("1");
    context.wpnSkillOptions2 = await BRPSelectLists.getWeaponSkillOptions(this.item.system.skill1);
    context.weaponCatName = game.i18n.localize("BRP." + this.item.system.weaponType);
    context.damName = game.i18n.localize("BRP." + this.item.system.db);
    context.handedName = game.i18n.localize("BRP." + this.item.system.hands);
    context.specName = game.i18n.localize("BRP." + this.item.system.special);
    context.isAmmo = false;
    if (this.item.system.weaponType === 'firearm' || this.item.system.weaponType === 'energy' || this.item.system.weaponType === 'artillery' || this.item.system.weaponType === 'missile' || this.item.system.weaponType === 'heavy') {
      context.isAmmo = true;
    }
    if (this.item.system.skill1 === 'none') {
      context.skill1Name = game.i18n.localize("BRP.none")
    } else {
      skillSelect = (await game.system.api.brpid.fromBRPIDBest({ brpid: this.item.system.skill1 }))[0]
      context.skill1Name = skillSelect ? skillSelect.name : "";
    }
    if (this.item.system.skill2 === 'none') {
      context.skill2Name = game.i18n.localize("BRP.none")
    } else {
      skillSelect = (await game.system.api.brpid.fromBRPIDBest({ brpid: this.item.system.skill2 }))[0]
      context.skill2Name = skillSelect ? skillSelect.name : "";
    }
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
