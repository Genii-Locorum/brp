import { BRPActiveEffectSheet } from "../../sheets/brp-active-effect-sheet.mjs";
import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPWeaponSheet extends foundry.appv1.sheets.ItemSheet {
  constructor(...args) {
    super(...args)
    this._sheetTab = 'items'
  }

  //Turn off App V1 deprecation warnings
  //TODO - move to V2
  static _warnedAppV1 = true

  //Add BRPID buttons to sheet
  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'item'],
      template: 'systems/brp/templates/item/weapon.html',
      width: 600,
      height: 640,
      scrollY: ['.tab.description'],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'details' }]
    })
  }

  async getData() {
    const sheetData = super.getData();
    const itemData = sheetData.item;
    sheetData.hasOwner = this.item.isEmbedded === true;
    sheetData.npcOwner = false
    if (sheetData.hasOwner) {
      if (this.item.parent.type === 'npc') {
        sheetData.npcOwner = true
      }
    }
    //const actor = this.item.parent;
    let skillSelect = "";
    sheetData.isGM = game.user.isGM;
    //Get drop down options from select-lists.mjs
    sheetData.weaponOptions = await BRPSelectLists.getWpnCategoryOptions();
    sheetData.priceOptions = await BRPSelectLists.getPriceOptions();
    sheetData.damOptions = await BRPSelectLists.getDamBonusOptions();
    sheetData.specialOptions = await BRPSelectLists.getSpecialOptions();
    sheetData.handedOptions = await BRPSelectLists.getHandedOptions();
    sheetData.equippedOptions = await BRPSelectLists.getEquippedOptions(this.item.type);
    sheetData.wpnSkillOptions1 = await BRPSelectLists.getWeaponSkillOptions("1");
    sheetData.wpnSkillOptions2 = await BRPSelectLists.getWeaponSkillOptions(this.item.system.skill1);
    sheetData.weaponCatName = game.i18n.localize("BRP." + this.item.system.weaponType);
    sheetData.priceName = game.i18n.localize("BRP." + this.item.system.price);
    sheetData.damName = game.i18n.localize("BRP." + this.item.system.db);
    sheetData.handedName = game.i18n.localize("BRP." + this.item.system.hands);
    sheetData.specName = game.i18n.localize("BRP." + this.item.system.special);
    sheetData.equippedName = game.i18n.localize("BRP." + this.item.system.equipStatus);
    sheetData.isAmmo = false;
    if (this.item.system.weaponType === 'firearm' || this.item.system.weaponType === 'energy' || this.item.system.weaponType === 'artillery' || this.item.system.weaponType === 'missile' || this.item.system.weaponType === 'heavy') {
      sheetData.isAmmo = true;
    }

    if (this.item.system.skill1 === 'none') {
      sheetData.skill1Name = game.i18n.localize("BRP.none")
    } else {
      skillSelect = (await game.system.api.brpid.fromBRPIDBest({ brpid: this.item.system.skill1 }))[0]
      sheetData.skill1Name = skillSelect ? skillSelect.name : "";
    }

    if (this.item.system.skill2 === 'none') {
      sheetData.skill2Name = game.i18n.localize("BRP.none")
    } else {
      skillSelect = (await game.system.api.brpid.fromBRPIDBest({ brpid: this.item.system.skill2 }))[0]
      sheetData.skill2Name = skillSelect ? skillSelect.name : "";
    }

    sheetData.enrichedDescriptionValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      sheetData.data.system.description,
      {
        async: true,
        secrets: sheetData.editable
      }
    )

    sheetData.enrichedGMDescriptionValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      sheetData.data.system.gmDescription,
      {
        async: true,
        secrets: sheetData.editable
      }
    )

    sheetData.effects = BRPActiveEffectSheet.getItemEffectsFromSheet(sheetData)
    const changesActiveEffects = BRPActiveEffectSheet.getEffectChangesFromSheet(this.document)
    sheetData.effectKeys = changesActiveEffects.effectKeys
    sheetData.effectChanges = changesActiveEffects.effectChanges

    return sheetData
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html)
    html.find('.item-toggle').click(this.onItemToggle.bind(this));
    BRPActiveEffectSheet.activateListeners(this, html)
  }

  //Handle toggle states
  async onItemToggle(event) {
    event.preventDefault();
    const prop = event.currentTarget.closest('.item-toggle').dataset.property;
    let checkProp = {};
    if (prop === 'parry' || prop === 'burst' || prop === 'stun' || prop === 'choke' || prop === 'entangle' || prop === 'fire' || prop === 'pierce' || prop === 'sonic' || prop === 'poison' || prop === 'explosive' || prop === 'emp') {
      checkProp = { [`system.${prop}`]: !this.object.system[prop] }
    } else { return }

    const item = await this.object.update(checkProp);
    return item;
  }

  _updateObject(event, formData) {
    super._updateObject(event, formData)
  }

}
