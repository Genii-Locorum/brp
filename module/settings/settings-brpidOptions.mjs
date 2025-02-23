const SETTINGS = {

  actorBRPID: {
    name: "BRP.Settings.actorBRPID",
    hint: "BRP.Settings.actorBRPIDHint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  },

  itemBRPID: {
    name: "BRP.Settings.itemBRPID",
    hint: "BRP.Settings.itemBRPIDHint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  },

  firstAidBRPID: {
    name: "BRP.Settings.firstAidBRPID",
    hint: "BRP.Settings.firstAidBRPIDHint",
    scope: "world",
    config: false,
    type: String,
    default: "i.skill.first-aid"   
  },

  
}

export class BRPbrpidSettings extends FormApplication {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'BRP.brpSettings',
      classes: ["brp","rulesmenu"],
      id: 'char-settings',
      template: 'systems/brp/templates/settings/brpid-settings.html',
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