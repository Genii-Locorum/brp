import { BRPActiveEffectSheet } from "../../sheets/brp-active-effect-sheet.mjs";
import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPGearSheet extends ItemSheet {
  constructor(...args) {
    super(...args)
    this._sheetTab = 'items'
  }

  //Add BRPID buttons to sheet
  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'item'],
      template: 'systems/brp/templates/item/gear.html',
      width: 520,
      height: 600,
      scrollY: ['.tab.description'],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'details' }]
    })
  }

  async getData() {
    const sheetData = super.getData()
    const itemData = sheetData.item
    sheetData.hasOwner = this.item.isEmbedded === true
    const actor = this.item.parent
    sheetData.isGM = game.user.isGM
    //Get drop down options from select-lists.mjs
    sheetData.priceOptions = await BRPSelectLists.getPriceOptions();
    sheetData.equippedOptions = await BRPSelectLists.getEquippedOptions(this.item.type);
    sheetData.priceName = game.i18n.localize("BRP." + this.item.system.price);

    sheetData.enrichedDescriptionValue = await TextEditor.enrichHTML(
      sheetData.data.system.description,
      {
        async: true,
        secrets: sheetData.editable
      }
    )

    sheetData.enrichedGMDescriptionValue = await TextEditor.enrichHTML(
      sheetData.data.system.gmDescription,
      {
        async: true,
        secrets: sheetData.editable
      }
    )

    sheetData.effects = BRPActiveEffectSheet.getItemEffectsFromSheet(sheetData)
    const changesActiveEffects = BRPActiveEffectSheet.getEffectChangesFromSheet(this.document.effects)
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

    BRPActiveEffectSheet.activateListeners(this, html)
  }

  _updateObject(event, formData) {
    super._updateObject(event, formData)
  }

}
