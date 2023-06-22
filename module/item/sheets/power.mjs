export class BRPPowerSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        width: 520,
        height: 480,
        tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'description'}]
      })
    }
  
    /** @override */
    get template () {
      return `systems/BRP/templates/item/${this.item.type}.html`
    }
  

    getData () {
      const sheetData = super.getData()
      const itemData = sheetData.item
      sheetData.hasOwner = this.item.isEmbedded === true
      sheetData.isGM = game.user.isGM
      sheetData.keyOptions = BRPPowerSheet.getKeywordOptions()
      sheetData.powerOptions = BRPPowerSheet.getPowerOptions()
      sheetData.powerLevel =game.i18n.localize(CONFIG.BRP.powerLevels[this.item.system.level])
      return sheetData
    }
  
    /* -------------------------------------------- */
  
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners (html) {
      super.activateListeners(html)
      // Everything below here is only needed if the sheet is editable
    }
  
  
    async _updateObject (event, formData) {
      return super._updateObject(event, formData)
    }



  //
  //Keyword Options 
  //
  static getKeywordOptions () {
    let options = {
      "": game.i18n.localize("BRP.keyword.none"),
      "magic": game.i18n.localize("BRP.keyword.magic"),
      "mutation": game.i18n.localize("BRP.keyword.mutation"),
      "psychic": game.i18n.localize("BRP.keyword.psychic"),
      "sorcery": game.i18n.localize("BRP.keyword.sorcery"),
      "superpower": game.i18n.localize("BRP.keyword.superpower"),
    };
    return options;
  } 

  //
  //Power Options 
  //
  static getPowerOptions () {
    let options = {
      "0": game.i18n.localize("BRP.powerLevel.normal"),
      "1": game.i18n.localize("BRP.powerLevel.heroic"),
      "2": game.i18n.localize("BRP.powerLevel.epic"),
      "3": game.i18n.localize("BRP.powerLevel.superhuman"),
    };
    return options;
  } 
}
