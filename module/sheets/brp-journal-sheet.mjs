/* global RollTableConfig */
import { addBRPIDSheetHeaderButton } from '../brpid/brpid-button.mjs'


export class BRPJournalSheet extends JournalSheet {

  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }
}
