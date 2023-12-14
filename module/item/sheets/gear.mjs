import { BRPSelectLists } from "../../apps/select-lists.mjs";

export class BRPGearSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        template: 'systems/brp/templates/item/gear.html',
        width: 520,
        height: 600,
        scrollY: ['.tab.description'],
        tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'details'}]
      })
    }

    async getData () {
      const sheetData = super.getData()
      const itemData = sheetData.item
      sheetData.hasOwner = this.item.isEmbedded === true
      const actor = this.item.parent
      sheetData.isGM = game.user.isGM
      //Get drop down options from select-lists.mjs
        sheetData.priceOptions = await BRPSelectLists.getPriceOptions();
        sheetData.equippedOptions = await BRPSelectLists.getEquippedOptions(this.item.type);
      sheetData.priceName = game.i18n.localize("BRP." + this.item.system.price);  
      return sheetData
    }
  
    /* -------------------------------------------- */
  
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners (html) {
      super.activateListeners(html)
    }
    
    _updateObject (event, formData) {
      super._updateObject(event, formData)
    }

  }