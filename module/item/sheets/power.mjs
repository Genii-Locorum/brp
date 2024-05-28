import { BRPSelectLists } from "../../apps/select-lists.mjs";

export class BRPPowerSheet extends ItemSheet {
  constructor (...args) {
    super(...args)
    this._sheetTab = 'items'
  }
  
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'item'],
      template: 'systems/brp/templates/item/power.html',
      width: 520,
      height: 520,
      scrollY: ['.tab.description'],
      tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'details'}]
    })
  }
  
  async getData () {
    const sheetData = super.getData()
    const itemData = sheetData.item
    sheetData.hasOwner = this.item.isEmbedded === true
    sheetData.isGM = game.user.isGM
    //Get drop down options from select-lists.mjs
      sheetData.catOptions = await BRPSelectLists.getPowerCatOptions();
      sheetData.catName = game.i18n.localize("BRP." + this.item.system.category);
      sheetData.lvlOptions = await BRPSelectLists.getPowerLvlOptions();
      sheetData.lvlName = game.i18n.localize("BRP." + this.item.system.level);
    return sheetData
  }
  
  //Activate event listeners using the prepared sheet HTML
  activateListeners (html) {
    super.activateListeners(html)
    if (!this.options.editable) return  
  }

  //Update object - change power name to be made up of Category & Level
  _updateObject (event, formData) {
    formData.name = game.i18n.localize("BRP." + formData['system.category']);
    super._updateObject(event, formData)
  }

}