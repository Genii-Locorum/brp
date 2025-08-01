import { BRPUtilities } from '../../apps/utilities.mjs'
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPSuperSheet extends foundry.appv1.sheets.ItemSheet {

  //Turn off App V1 deprecation warnings
  //TODO - move to V2
  static _warnedAppV1 = true

  //Add BRPID buttons to sheet
  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'super'],
      template: 'systems/brp/templates/item/super.html',
      width: 525,
      height: 550,
      dragDrop: [{ dragSelector: '.item' }],
      scrollY: ['.tab.description'],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'details' }]
    })
  }

  async getData() {
    const sheetData = super.getData()
    sheetData.isGM = game.user.isGM
    sheetData.hasOwner = this.item.isEmbedded === true
    const itemData = sheetData.item
    sheetData.hasOwner = this.item.isEmbedded === true
    const actor = this.item.parent
    const powerMods = [];
    if (actor) {
      for (let itm of itemData.system.powerMod) {
        let tempItm = fromUuidSync(itm.uuid)
        powerMods.push(tempItm);
      }
    }

    sheetData.powerMods = powerMods.sort(BRPUtilities.sortByNameKey);

    //Ensure mainName is populated
    if (this.item.system.mainName === "") {
      this.object.update({ 'system.mainName': this.item.name });
    }

    sheetData.enrichedDescriptionValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      sheetData.data.system.description,
      {
        async: true,
        secrets: sheetData.editable
      }
    )
    sheetData.powerName = game.settings.get('brp', this.item.type + 'Label')
    if (sheetData.powerName === "") {
      sheetData.powerName = game.i18n.localize("BRP." + this.item.type)
    }
    sheetData.enrichedGMDescriptionValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      sheetData.data.system.gmDescription,
      {
        async: true,
        secrets: sheetData.editable
      }
    )

    return sheetData
  }

  activateListeners(html) {
    super.activateListeners(html)
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
    html.find('.item-delete').click(event => this._onItemDelete(event, 'powerMod'))
    html.find('.item-view').click(event => this._onItemView(event))
    html.find('.item-toggle').click(this.onItemToggle.bind(this));
    const dragDrop = new foundry.applications.ux.DragDrop.implementation({
      dropSelector: '.droppable',
      callbacks: { drop: this._onDrop.bind(this) }
    })
    dragDrop.bind(html[0])
  }

  //Allow for a skill being dragged and dropped on to the peronality sheet either in the main skill list or an Optional Group
  async _onDrop(event, type = 'powerMod', collectionName = 'powerMod') {
    event.preventDefault()
    event.stopPropagation()
    //If the item isn't owned by an actor then don't allow the drop
    if (!this.item.parent) { return }
    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []

    for (const item of dataList) {
      if (!item || !item.system) continue
      if (![type].includes(item.type)) {
        continue
      }

      //Dropping in Main Skill list
      if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
        ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
        continue
      }

      //Create Embedded PowerMod on Actor Sheet and push the ID in to the collection (i.e. don't push the item)
      const actor = this.item.parent
      const itemData = foundry.utils.duplicate(item)
      let newItem = await Item.create(itemData, { parent: actor });
      collection.push({ uuid: newItem.uuid, brpid: newItem.flags.brp.brpidFlag.id })
    }
    await this.item.update({ [`system.${collectionName}`]: collection })
  }

  //Handle toggle states
  async onItemToggle(event) {
    event.preventDefault();
    const prop = event.currentTarget.closest('.item-toggle').dataset.property;
    let checkProp = {};
    if (prop === 'specialism' || prop === 'chosen') {
      checkProp = { [`system.${prop}`]: !this.object.system[prop] }
    } else { return }

    const item = await this.object.update(checkProp);
    return item;
  }

  //Delete's an item in the main list
  async _onItemDelete(event, collectionName = 'items') {
    const item = $(event.currentTarget).closest('.item')
    const itemId = item.data('item-id')
    const itemIndex = this.item.system[collectionName].findIndex(i => (itemId && i.uuid === itemId))
    if (itemIndex > -1) {
      const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
      collection.splice(itemIndex, 1)
      await this.item.update({ [`system.${collectionName}`]: collection })
      const oldItem = fromUuidSync(itemId);
      oldItem.delete();
    }
  }

  //View an item in the main list
  async _onItemView(event) {
    const target = $(event.currentTarget).closest('.item')
    const itemId = target.data('item-id')
    const item = await fromUuid(itemId)
    item.sheet.render(true);
  }


}
