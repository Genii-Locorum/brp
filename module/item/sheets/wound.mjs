import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPActiveEffectSheet } from "../../sheets/brp-active-effect-sheet.mjs";

export class BRPWoundSheet extends foundry.appv1.sheets.ItemSheet {
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
      template: 'systems/brp/templates/item/wound.html',
      width: 520,
      height: 480,
      scrollY: ['.tab.description'],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'details' }]
    })
  }

  async getData() {
    const sheetData = super.getData()
    const itemData = sheetData.item
    sheetData.hasOwner = this.item.isEmbedded === true
    sheetData.isGM = game.user.isGM

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
    if (prop === 'treated') {
      checkProp = { [`system.${prop}`]: !this.object.system[prop] }
    } else { return }

    const item = await this.object.update(checkProp);
    return item;
  }

  _updateObject(event, formData) {
    if (!formData['system.value']) {
      formData['system.value'] = 0
    } else if (formData['system.value'] < 0) {
      formData['system.value'] = 0
    }
    super._updateObject(event, formData)
    this.close()
  }

}
