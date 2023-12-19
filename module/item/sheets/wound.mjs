export class BRPWoundSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        template: 'systems/brp/templates/item/wound.html',
        width: 520,
        height: 480,
        scrollY: ['.tab.description'],
        tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'description'}]
      })
    }

    async getData () {
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
      html.find('.item-toggle').click(this.onItemToggle.bind(this));
    }

    //Handle toggle states
    async onItemToggle(event){
      event.preventDefault();
      const prop=event.currentTarget.closest('.item-toggle').dataset.property;
      let checkProp={};
      if (prop === 'treated') {
        checkProp = {[`system.${prop}`] : !this.object.system[prop]}
      } else {return }      
    
      const item = await this.object.update(checkProp);
      return item;
  }

    _updateObject (event, formData) {
      if(!formData['system.value']) {
        formData['system.value'] = 0
      } else if(formData['system.value'] <0){
        formData['system.value'] = 0
      }
      super._updateObject(event, formData)
      this.close()
    }

  }