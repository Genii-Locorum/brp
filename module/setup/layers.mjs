import { BRPCharDev } from "../apps/charDev.mjs"
import { BRPUtilities } from "../apps/utilities.mjs"

//Add GM tools to Scene

class BRPLayer extends foundry.canvas.layers.PlaceablesLayer {

  constructor() {
    super()
    this.objects = {}
  }

  static get layerOptions() {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: 'brpmenu',
      zIndex: 60
    })
  }

  static get documentName() {
    return 'Token'
  }

  get placeables() {
    return []
  }

}

export class BRPMenu {
  static getButtons(controls) {
    canvas.brpgmtools = new BRPLayer()
    const isGM = game.user.isGM
    controls.push({
      name: 'brpmenu',
      title: game.i18n.localize('BRP.gmTools'),
      layer: 'brpgmtools',
      icon: 'fas fa-tools',
      visible: isGM,
      tools: [
        {
          toggle: true,
          icon: 'fas fa-chevrons-up',
          name: 'development',
          active: game.settings.get('brp', 'development'),
          title: game.i18n.localize('BRP.developmentPhase'),
          onClick: async toggle => await BRPCharDev.developmentPhase(toggle)
        },
        {
          toggle: true,
          icon: 'fas fa-book-open-cover',
          name: 'beastiary',
          active: game.settings.get('brp', 'beastiary'),
          title: game.i18n.localize('BRP.beastiaryMode'),
          onClick: async toggle => await BRPUtilities.beastiaryMode(toggle)
        }
      ]
    })

  }

  static renderControls(app, html, data) {
    const isGM = game.user.isGM
    const gmMenu = html.find('.fas-fa-tools').parent()
    gmMenu.addClass('brp-menu')
  }
}
