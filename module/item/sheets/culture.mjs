import { BRPItem } from '../item.mjs'
import { BRPUtilities } from '../../apps/utilities.mjs'

export class BRPCultureSheet extends ItemSheet {
  activateListeners (html) {
    super.activateListeners(html)
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
    html.find('.item-delete').click(event => this._onItemDelete(event, 'hitloc'))
    const dragDrop = new DragDrop({
      dropSelector: '.droppable',
      callbacks: { drop: this._onDrop.bind(this) }
    })
    dragDrop.bind(html[0])
  }

  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'culture'],
      template: 'systems/BRP/templates/item/culture.html',
      width: 525,
      height: 480,
      dragDrop: [{ dragSelector: '.item' }],
      scrollY: ['.tab.description'],
      tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'characteristics'}]
    })
  }

  async getData () {
    const sheetData = super.getData()
    sheetData.isGM = game.user.isGM
    const itemData = sheetData.item
    const hitloc = [];
    for (let i of itemData.system.hitloc){
      hitloc.push(i);
    }

    // Sort Hit Locations
    hitloc.sort(function(a, b){
      let x = a.system.lowRoll;
      let y = b.system.lowRoll;
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });
    sheetData.hitloc = hitloc;

    for (let [k, v] of Object.entries(itemData.system.stats)) {
      v.label = game.i18n.localize(CONFIG.BRP.stats[k]) ?? k;
    }


    return sheetData
  }

  //Allow for a hitloc being dragged and dropped on to the culture sheet 
  async _onDrop (event, type = 'hit-location', collectionName = 'hitloc') {
    event.preventDefault()
    event.stopPropagation()

    const ol = event?.currentTarget?.closest('ol')
    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? duplicate(this.item.system[collectionName]) : []
 
    for (const item of dataList) {
      if (!item || !item.system) continue
      if (![type].includes(item.type)) {
        continue
      }

        collection.push(item)
      
    }
    await this.item.update({ [`system.${collectionName}`]: collection })
  }

     
  //Delete a hit location      
  async _onItemDelete (event, collectionName = 'items') {
    const item = $(event.currentTarget).closest('.item')
    const itemId = item.data('item-id')
    const itemIndex = this.item.system[collectionName].findIndex(i => (itemId && i._id === itemId))
    if (itemIndex > -1) {
      const collection = this.item.system[collectionName] ? duplicate(this.item.system[collectionName]) : []
      collection.splice(itemIndex, 1)
      await this.item.update({ [`system.${collectionName}`]: collection })
    }
  }


    
  _updateObject (event, formData) {
    super._updateObject(event, formData)
  }
}