import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPHitLocSheet extends ItemSheet {
  constructor(...args) {
    super(...args)
    this._sheetTab = 'items'
  }

  //Add BRPID buttons to sheet
  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'item'],
      template: 'systems/brp/templates/item/hit-location.html',
      width: 520,
      height: 480,
      scrollY: ['.tab.description'],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'description' }]
    })
  }

  async getData() {
    const sheetData = super.getData()
    const itemData = sheetData.item
    sheetData.hasOwner = this.item.isEmbedded === true
    sheetData.isGM = game.user.isGM
    //Get drop down options from select-lists.mjs
    sheetData.locTypeOptions = await BRPSelectLists.getHitLocType();
    sheetData.hitLocName = game.i18n.localize('BRP.' + this.item.system.locType)

    return sheetData
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  activateListeners(html) {
    super.activateListeners(html)
    html.find('.item-toggle').click(event => this._toggleItem(event))
  }

  //Toggle hit location type
  async _toggleItem(event) {
    event.preventDefault();
    const prop = event.currentTarget.closest('.item-toggle').dataset.property;
    let checkProp = {};
    if (prop === 'dead' || prop === 'severed' || prop === 'bleeding' || prop === 'unconscious') {
      checkProp = { [`system.${prop}`]: !this.object.system[prop] };
    } else { return }

    const item = await this.object.update(checkProp);
    return item;
  }



  _updateObject(event, formData) {
    const displayName = formData['system.displayName'] || this.item.system.displayName
    const creatureType = formData['system.creatureType'] || this.item.system.creatureType
    if (creatureType === "") {
      formData.name = displayName
    } else {
      formData.name = displayName + ' (' + creatureType + ')'
    }
    super._updateObject(event, formData)
  }

}
