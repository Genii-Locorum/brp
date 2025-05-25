import { BRPMenu } from '../setup/menu.mjs'

export default function (app, html, data) {
  if (typeof html.querySelector === 'function') {
    html.querySelector('button[data-tool="brpdummy"]')?.closest('li').remove()
  }
  BRPMenu.renderControls(app, html, data)
}
