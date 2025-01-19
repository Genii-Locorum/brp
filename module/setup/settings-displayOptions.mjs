const SETTINGS = {

  actorBackColour: {
    name: "BRP.Settings.actorBackColour",
    hint: "BRP.Settings.actorBackColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""
  },

  secBackColour: {
    name: "BRP.Settings.secBackColour",
    hint: "BRP.Settings.secBackColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""
  },

}

export class BRPDisplaySettings extends FormApplication {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'BRP.brpSettings',
      classes: ["brp","rulesmenu"],
      id: 'display-settings',
      template: 'systems/brp/templates/settings/display-settings.html',
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