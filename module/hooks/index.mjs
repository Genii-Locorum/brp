import * as DrawNote from "./draw-note.mjs";
import * as RenderItemSheet from './render-item-sheet.mjs'
import * as RenderActorSheet from './render-actor-sheet.mjs'
import * as RenderDialog from './render-dialog.mjs'
import * as RenderChatMessage from './render-chat-message.mjs'
import * as RenderNoteConfig from './render-note-config.js'



export const BRPHooks = {
  listen() {
    DrawNote.listen()
    RenderActorSheet.listen()
    RenderItemSheet.listen()
    RenderDialog.listen()
    RenderChatMessage.listen()
    RenderNoteConfig.listen()
  }
}
