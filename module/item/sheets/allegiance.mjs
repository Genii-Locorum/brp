import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPAllegianceSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
  //Add BRPID buttons to sheet
  _getHeaderButtons () {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

    static get defaultOptions () {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        template: 'systems/brp/templates/item/allegiance.html',
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

      sheetData.enrichedBenefitsValue = await TextEditor.enrichHTML(
        sheetData.data.system.benefits,
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
      html.find('.item-toggle').click(this.onItemToggle.bind(this));
    }
    
    //Handle toggle states
    async onItemToggle(event){
      event.preventDefault();
      const prop=event.currentTarget.closest('.item-toggle').dataset.property;
      let checkProp={};
      if (['allegEnemy','allegApoth','allegAllied','improve'].includes(prop)) {
        checkProp = {[`system.${prop}`] : !this.object.system[prop]}
      } else {return }      
    
      const item = await this.object.update(checkProp);
      return item;
  }

    _updateObject (event, formData) {
      super._updateObject(event, formData)
    }

  }