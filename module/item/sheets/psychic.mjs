import { BRPSelectLists } from "../../apps/select-lists.mjs";

export class BRPPsychicSheet extends ItemSheet {
  constructor (...args) {
    super(...args)
    this._sheetTab = 'items'
  }
  
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'item'],
      template: 'systems/brp/templates/item/psychic.html',
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
    sheetData.pcOwner = false
    if (sheetData.hasOwner) {
      if (this.item.parent.type === 'character') {
        sheetData.pcOwner = true
      }
    }    
    sheetData.isGM = game.user.isGM
    //Get drop down options from select-lists.mjs
      sheetData.catOptions = await BRPSelectLists.getSpellCatOptions();
      sheetData.catName = game.i18n.localize("BRP." + this.item.system.impact);
    itemData.system.total = itemData.system.base + itemData.system.xp + itemData.system.effects + itemData.system.personality + itemData.system.profession + itemData.system.personal;  

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

    return sheetData
  }
  
  //Activate event listeners using the prepared sheet HTML
  activateListeners (html) {
    super.activateListeners(html)
    if (!this.options.editable) return  
  }

  _updateObject (event, formData) {
    super._updateObject(event, formData)
  }

}