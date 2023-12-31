import { BRPChat } from '../apps/chat.mjs'

export function listen(){
  Hooks.on('renderChatMessage', (app, html, data) => {
    BRPChat.renderMessageHook(app, html, data)
  })
}