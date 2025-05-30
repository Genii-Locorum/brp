import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPMutationSheet extends foundry.appv1.sheets.ItemSheet {
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
      template: 'systems/brp/templates/item/mutation.html',
      width: 520,
      height: 520,
      scrollY: ['.tab.description'],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'details' }]
    })
  }

  async getData() {
    const sheetData = super.getData()
    const itemData = sheetData.item
    sheetData.hasOwner = this.item.isEmbedded === true
    sheetData.isGM = game.user.isGM
    sheetData.powerName = game.settings.get('brp', this.item.type + 'Label')
    if (sheetData.powerName === "") {
      sheetData.powerName = game.i18n.localize("BRP." + this.item.type)
    }
    //Get selection lists
    sheetData.catOptions = await BRPSelectLists.getMutationCatOptions();
    sheetData.catName = game.i18n.localize("BRP." + this.item.system.impact);
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

    return sheetData
  }

  //Activate event listeners using the prepared sheet HTML
  activateListeners(html) {
    super.activateListeners(html)
    if (!this.options.editable) return
    html.find('.item-toggle').click(this.onItemToggle.bind(this));
  }

  //Handle toggle states
  async onItemToggle(event) {
    event.preventDefault();
    const prop = event.currentTarget.closest('.item-toggle').dataset.property;
    let checkProp = {};
    if (prop === 'minorOnly' || prop === 'minor') {
      checkProp = { [`system.${prop}`]: !this.object.system[prop] }
    } else { return }

    //If current strength has just been toggled, the mutation is limited to Minor Only and current strength is minor then ignore
    if (prop === 'minor' && this.object.system.minorOnly && this.object.system.minor) {
      return
    }

    const item = await this.object.update(checkProp);
    return item;
  }

  _updateObject(event, formData) {
    super._updateObject(event, formData)
  }

}
