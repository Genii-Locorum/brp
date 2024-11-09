/* global game */
import { BRPIDEditor } from './brpid-editor.mjs'

export function addBRPIDSheetHeaderButton (headerButtons, sheet) {
  //if (game.user.isGM) {
    const sheetBRPID = sheet.object.flags?.brp?.brpidFlag
    const noId = (typeof sheetBRPID === 'undefined' || typeof sheetBRPID.id === 'undefined' || sheetBRPID.id === '')
    const BRPIDEditorButton = {
      class: (noId ? 'edit-brpid-warning' : 'edit-brpid-exisiting'),
      label: 'BRP.BRPIDFlag.id',
      icon: 'fas fa-fingerprint',
      onclick: () => { if(game.user.isGM) {
        new BRPIDEditor(sheet.object, {}).render(true, { focus: true })
      }
    }}
    const numberOfButtons = headerButtons.length
    //headerButtons.splice(numberOfButtons - 1, 0, BRPIDEditorButton)
    headerButtons.splice(0, 0, BRPIDEditorButton)
  //}
}