import * as RenderItemSheet from './render-item-sheet.mjs'
import * as Init from './init.mjs'

export const BRPHooks = {
    listen () {
      Init.listen()
      RenderItemSheet.listen()
    }
  }