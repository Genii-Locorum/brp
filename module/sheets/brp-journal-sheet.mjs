/* global RollTableConfig */
import { addBRPIDSheetHeaderButton } from '../brpid/brpid-button.mjs'


export class BRPJournalSheet extends foundry.appv1.sheets.JournalSheet {

  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }
}
