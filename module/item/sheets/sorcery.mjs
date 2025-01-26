import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPSorcerySheet extends ItemSheet {
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
      template: 'systems/brp/templates/item/sorcery.html',
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
    sheetData.powerName = game.settings.get('brp',this.item.type+'Label')
    if (sheetData.powerName === "") {
      sheetData.powerName = game.i18n.localize("BRP."+this.item.type)
    }  
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
    html.find('.item-toggle').click(this.onItemToggle.bind(this));
  }

  //Handle toggle states
  async onItemToggle(event){
    event.preventDefault();
    const prop=event.currentTarget.closest('.item-toggle').dataset.property;
    let checkProp={};
    if (prop === 'mem' || prop === 'var') {
      checkProp = {[`system.${prop}`] : !this.object.system[prop]}
    } else {return} 
    if (prop === 'var' & this.object.system.var) {
      checkProp = {
        'system.var' :false,
        'system.currLvl': this.object.system.maxLvl,
        'system.memLvl': this.object.system.maxLvl,
      }
    }     

    const item = await this.object.update(checkProp);
    return item;
  }

  _updateObject (event, formData) {
    const system = foundry.utils.expandObject(formData)?.system
    if (!formData['system.maxLvl']) {
      formData['system.maxLvl'] = this.object.system.maxLvl
    }
    if (formData['system.maxLvl'] < 1) {formData['system.maxLvl'] = 1}

    if (!this.object.system.var) {
      formData['system.currLvl'] = formData['system.maxLvl']
      formData['system.memLvl'] = formData['system.maxLvl']
    } else {
      formData['system.currLvl'] = Math.max(formData['system.currLvl'],1)
      formData['system.currLvl'] = Math.min(formData['system.currLvl'],formData['system.maxLvl'])
      formData['system.memLvl'] = Math.max(formData['system.memLvl'],1)
      formData['system.memLvl'] = Math.min(formData['system.memLvl'],formData['system.currLvl'])
    }
    super._updateObject(event, formData)
    this.item.render(false);

  }

}