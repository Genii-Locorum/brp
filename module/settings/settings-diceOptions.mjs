const SETTINGS = {

  diffValue: {
    name: 'BRP.Settings.diffValue',
    hint: 'BRP.Settings.diffValueHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  },

  allowImp: {
    name: 'BRP.Settings.allowImp',
    hint: 'BRP.Settings.allowImpHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  },

  resistRoll: {
    name: 'BRP.Settings.resistRoll',
    hint: 'BRP.Settings.resistRollHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  },

  resistLevels: {
    name: 'BRP.Settings.resistLevels',
    hint: 'BRP.Settings.resistLevelsHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean,
  }
}

export class BRPDiceSettings extends FormApplication {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'BRP.brpSettings',
      classes: ["brp","rulesmenu"],
      id: 'dice-settings',
      template: 'systems/brp/templates/settings/dice-settings.html',
      width: 550,
      height: 'auto',
      closeOnSubmit: true
    })
  }
  
  getData () {
    const options = {}
    for (const [k, v] of Object.entries(SETTINGS)) {
      options[k] = {
        value: game.settings.get('brp', k),
        setting: v
      }
    }

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