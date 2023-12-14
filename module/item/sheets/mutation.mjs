import { BRPSelectLists } from "../../apps/select-lists.mjs";

export class BRPMutationSheet extends ItemSheet {
  constructor (...args) {
    super(...args)
    this._sheetTab = 'items'
  }
  
  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'item'],
      template: 'systems/brp/templates/item/mutation.html',
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
    //Get selection lists
      sheetData.catOptions = await BRPSelectLists.getMutationCatOptions();
      sheetData.catName = game.i18n.localize("BRP." + this.item.system.impact);
    return sheetData
  }
  
  //Activate event listeners using the prepared sheet HTML
  activateListeners (html) {
    super.activateListeners(html)
    if (!this.options.editable) return  
    html.find('.item-toggle').click(this.onItemToggle.bind(this));
  }

  //Handle toggle states
  async onItemToggle(event){
    event.preventDefault();
    const prop=event.currentTarget.closest('.item-toggle').dataset.property;
    let checkProp={};
    if (prop === 'minorOnly'  || prop === 'minor') {
      checkProp = {[`system.${prop}`] : !this.object.system[prop]}
    } else {return}      
    
    //If current strength has just been toggled, the mutation is limited to Minor Only and current strength is minor then ignore
    if(prop === 'minor' && this.object.system.minorOnly && this.object.system.minor) {
      return
    }

    const item = await this.object.update(checkProp);
    return item;
  }

  _updateObject (event, formData) {
    super._updateObject(event, formData)
  }

}