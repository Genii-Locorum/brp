const SETTINGS = {

  autoXP: {
    name: 'BRP.Settings.autoXP',
    hint: 'BRP.Settings.autoXPHint',
    scope: 'world',
    config: false,
    default: 0,
    type: String,
  },

  xpFormula: {
    name: "BRP.Settings.xpFormula",
    hint: 'BRP.Settings.xpFormulaHint',
    scope: "world",
    config: false,
    type: String,
    default: '1D6'
  },

  xpFixed: {
    name: "BRP.Settings.xpFixed",
    hint: 'BRP.Settings.xpFixedHint',
    scope: "world",
    config: false,
    type: Number,
    default: 3
  },

  xpRollDice: {
    name: "BRP.Settings.xpRollDice",
    hint: "BRP.Settings.xpRollDiceHint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  }
}

import { BRPSelectLists } from "../apps/select-lists.mjs";

export class BRPXPSettings extends FormApplication {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'BRP.brpSettings',
      classes: ["brp","rulesmenu"],
      id: 'combat-settings',
      template: 'systems/brp/templates/settings/xp-settings.html',
      width: 550,
      height: 'auto',
      closeOnSubmit: true
    })
  }
  
  async getData () {
    const options = {}
    for (const [k, v] of Object.entries(SETTINGS)) {
      options[k] = {
        value: game.settings.get('brp', k),
        setting: v
      }
    }

    options.xpOptions = await BRPSelectLists.getXPOptions();

    return options
  }
  
  static registerSettings () {
    for (const [k, v] of Object.entries(SETTINGS)) {
      game.settings.register('brp', k, v)
    }
  }

  activateListeners (html) {
    super.activateListeners(html)
    html.find('button[name=reset]').on('click', event => this.onResetDefaults(event))
  }

  async onResetDefaults (event) {
    event.preventDefault()
    for await (const [k, v] of Object.entries(SETTINGS)) {
      await game.settings.set('brp', k, v?.default)
    }
    return this.render()
  }

  async _updateObject (event, data) {
    for await (const key of Object.keys(SETTINGS)) {
      game.settings.set('brp', key, data[key])
    }
  }  

}    