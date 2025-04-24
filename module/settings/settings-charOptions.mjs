const SETTINGS = {

  starterSkills: {
    name: "BRP.Settings.starterSkills",
    hint: "BRP.Settings.starterSkillsHint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  },

  starterTraits: {
    name: "BRP.Settings.starterTraits",
    hint: "BRP.Settings.starterTraitsHint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  },

  background1: {
    name: "BRP.Settings.background1",
    hint: "BRP.Settings.backgroundHint",
    scope: "world",
    config: false,
    type: String,
    default: "Background"
  },

  background2: {
    name: "BRP.Settings.background2",
    hint: "BRP.Settings.backgroundHint",
    scope: "world",
    config: false,
    type: String,
    default: "Biography"
  },

  background3: {
    name: "BRP.Settings.background3",
    hint: "BRP.Settings.backgroundHint",
    scope: "world",
    config: false,
    type: String,
    default: "Backstory"
  }

}

export class BRPCharSettings extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'BRP.brpSettings',
      classes: ["brp", "rulesmenu"],
      id: 'char-settings',
      template: 'systems/brp/templates/settings/char-settings.html',
      width: 550,
      height: 'auto',
      closeOnSubmit: true
    })
  }

  async getData() {
    const options = {}
    for (const [k, v] of Object.entries(SETTINGS)) {
      options[k] = {
        value: game.settings.get('brp', k),
        setting: v
      }
    }
    return options
  }

  static registerSettings() {
    for (const [k, v] of Object.entries(SETTINGS)) {
      game.settings.register('brp', k, v)
    }
  }

  activateListeners(html) {
    super.activateListeners(html)
    html.find('button[name=reset]').on('click', event => this.onResetDefaults(event))
  }

  async onResetDefaults(event) {
    event.preventDefault()
    for await (const [k, v] of Object.entries(SETTINGS)) {
      await game.settings.set('brp', k, v?.default)
    }
    return this.render()
  }

  async _updateObject(event, data) {
    for await (const key of Object.keys(SETTINGS)) {
      game.settings.set('brp', key, data[key])
    }
  }

}
