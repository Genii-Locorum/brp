import { BRPSelectLists } from "../../apps/select-lists.mjs";

export class BRPArmourSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        template: 'systems/brp/templates/item/armour.html',
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
        sheetData.burdenOptions = await BRPSelectLists.getArmourBurdenOptions();
        sheetData.priceOptions = await BRPSelectLists.getPriceOptions();
        if (actor) {
          sheetData.hitLocOptions = await BRPSelectLists.getHitLocOptions(actor);
        };
        sheetData.equippedOptions = await BRPSelectLists.getEquippedOptions(this.item.type);
      sheetData.burdenName = game.i18n.localize("BRP." + this.item.system.burden);  
      sheetData.priceName = game.i18n.localize("BRP." + this.item.system.price);  
      sheetData.equippedName = game.i18n.localize("BRP." + this.item.system.equipStatus);  
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
      if (prop === 'armVar' || prop === 'armBal' || prop === 'HPL') {
        checkProp = {[`system.${prop}`] : !this.object.system[prop]}
      } else {return }      
    
      const item = await this.object.update(checkProp);
      return item;
  }

    _updateObject (event, formData) {
      super._updateObject(event, formData)
    }

  }