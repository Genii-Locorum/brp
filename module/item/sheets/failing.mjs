export class BRPFailingSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        template: 'systems/brp/templates/item/failing.html',
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