import * as RenderItemSheet from './render-item-sheet.mjs'
import * as RenderActorSheet from './render-actor-sheet.mjs'
import * as RenderDialog from './render-dialog.mjs'
import * as Init from './init.mjs'

export const BRPHooks = {
    listen () {
      Init.listen()
        RenderActorSheet.listen()
        RenderItemSheet.listen()
        RenderDialog.listen()
    }
  }