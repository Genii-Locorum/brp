import { BRPUtilities } from "../apps/utilities.mjs"
import { BRPCharDev } from "../apps/charDev.mjs"


class BRPMenuLayer extends (foundry.canvas?.layers?.PlaceablesLayer ?? PlaceablesLayer) {
  constructor () {
    super()
    this.objects = {}
  }

  static get layerOptions () {
    return foundry.utils.mergeObject(super.layerOptions, {
      name: 'brpmenu',
      zIndex: 60
    })
  }

  static get documentName () {
    return 'Token'
  }

  get placeables () {
    return []
  }
}

export class BRPMenu {
  static getButtons (controls) {
    canvas.brpgmtools = new BRPMenuLayer()
    const isGM = game.user.isGM
    const menu = {
      name: 'brpmenu',
      title: 'BRP.gmTools',
      layer: 'brpgmtools',
      icon: 'fas fa-tools',
      activeTool: 'brpdummy',
      visible: isGM,
      onChange: (event, active) => {
      },
      onToolChange: (event, tool) => {
      },
      tools: {
        brpdummy: {
          icon: '',
          name: 'brpdummy',
          active: false,
          title: '',
          onChange: () => {
          }
        },
        development: {
          toggle: true,
          icon: 'fas fa-chevrons-up',
          name: 'development',
          active: game.settings.get('brp', 'development'),
          title: 'BRP.developmentPhase',
          onChange: async toggle => await BRPCharDev.developmentPhase(toggle)
        },
        beastiary: {
          toggle: true,
          icon: 'fas fa-book-open-cover',
          //class: 'xp_toggle',
          name: 'beastiary',
          active: game.settings.get('brp', 'beastiary'),
          title: 'BRP.beastiaryMode',
          onChange: async toggle => await BRPUtilities.beastiaryMode(toggle)
        },
      }
    }
    if (Array.isArray(controls)) {
      menu.tools = Object.keys(menu.tools).reduce((c, i) => {
        if (i === 'brpdummy') {
          return c
        }
        c.push(menu.tools[i])
        return c
      }, [])
      controls.push(menu)
    } else {
      controls.brpmenu = menu
    }
  }

  static renderControls (app, html, data) {
    const isGM = game.user.isGM
    const gmMenu = html.querySelector('.fa-solid fa-hammer')?.parentNode
    if (gmMenu && !gmMenu.classList.contains('brpmenu')) {
      gmMenu.classList.add('brpmenu')
      if (isGM) {
        const menuLi = document.createElement('li')
        const menuButton = document.createElement('button')
        menuButton.classList.add('control', 'ui-control', 'tool', 'icon', 'brpmenu')
        menuButton.type = 'button'
      }
    }
  }
}
