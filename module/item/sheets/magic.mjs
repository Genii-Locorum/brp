import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPMagicSheet extends foundry.appv1.sheets.ItemSheet {
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
      template: 'systems/brp/templates/item/magic.html',
      width: 520,
      height: 580,
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
    //Get drop down options from select-lists.mjs
    sheetData.catOptions = await BRPSelectLists.getSpellCatOptions();
    sheetData.catName = game.i18n.localize("BRP." + this.item.system.impact);
    sheetData.skillCatOptions = await BRPSelectLists.getCategoryOptions();
    let skillCat = (await game.system.api.brpid.fromBRPIDBest({ brpid: this.item.system.category }))[0]
    if (skillCat) {
      sheetData.skillCatName = skillCat.name
    } else {
      sheetData.skillCatName = ""
    }
    itemData.system.total = itemData.system.base + itemData.system.xp + itemData.system.effects + itemData.system.personality + itemData.system.profession + itemData.system.personal + + itemData.system.culture;

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
    if (['mem', 'improve'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !this.object.system[prop] }
    } else { return }

    const item = await this.object.update(checkProp);
    return item;
  }

  _updateObject(event, formData) {
    super._updateObject(event, formData)
  }

}
