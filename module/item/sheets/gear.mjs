export class BRPGearSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        width: 520,
        height: 380,
        tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'description'}]
      })
    }
  
    /** @override */
    get template () {
      return `systems/brp/templates/item/${this.item.type}.html`
    }
  

    getData () {
      const sheetData = super.getData()
      const itemData = sheetData.item
      sheetData.hasOwner = this.item.isEmbedded === true
      sheetData.isGM = game.user.isGM
      return sheetData
    }
  
    /* -------------------------------------------- */
  
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners (html) {
      super.activateListeners(html)
      html.find('.icon-toggle').dblclick(this._toggleIcon.bind(this));
    }
  
  
    async _updateObject (event, formData) {
      return super._updateObject(event, formData)
    }


// Toggle icons
async _toggleIcon(event) {
  const prop=event.currentTarget.dataset.property;
  let checkProp={};
  if (prop === 'equipped') {
    checkProp = {'system.equipped': !this.item.system.equipped}
  }

  await this.item.update(checkProp);
  return;

}

}
