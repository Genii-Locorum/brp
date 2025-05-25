/* global RollTableConfig */
import { addBRPIDSheetHeaderButton } from '../brpid/brpid-button.mjs'


export class BRPRollTableConfig extends foundry.applications.sheets.RollTableSheet {
  constructor(data, context) {
    data.img = 'icons/svg/d20.svg'
    super(data, context)
  }

  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', "sheet", "roll-table-config"],
    })
  }
}
