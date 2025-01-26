const SETTINGS = {

  actorFontColour: {
    name: "BRP.Settings.actorFontColour",
    hint: "BRP.Settings.actorFontColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""
  },

  actorTitleColour: {
    name: "BRP.Settings.actorTitleColour",
    hint: "BRP.Settings.actorTitleColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""
  },

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

  actorTabNameColour: {
    name: "BRP.Settings.actorTabNameColour",
    hint: "BRP.Settings.actorTabNameColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""   
  },

  actorTabNameActiveColour: {
    name: "BRP.Settings.actorTabNameActiveColour",
    hint: "BRP.Settings.actorTabNameActiveColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""   
  },

  actorTabNameHoverColour: {
    name: "BRP.Settings.actorTabNameHoverColour",
    hint: "BRP.Settings.actorTabNameHoverColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""   
  },

  actorTabNameShadowColour: {
    name: "BRP.Settings.actorTabNameShadowColour",
    hint: "BRP.Settings.actorTabNameShadowColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""   
  },

  actorTabActiveShadowColour: {
    name: "BRP.Settings.actorTabActiveShadowColour",
    hint: "BRP.Settings.actorTabActiveShadowColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""   
  },

  actorRollableColour: {
    name: "BRP.Settings.actorRollableColour",
    hint: "BRP.Settings.actorRollableColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""   
  },

  actorRollableShadowColour: {
    name: "BRP.Settings.actorRollableShadowColour",
    hint: "BRP.Settings.actorRollableShadowColourHint",
    scope: "world",
    config: false,
    type: String,
    default: ""   
  },

  actorSheetBackground: {
    name: "BRP.Settings.actorSheetBackground",
    hint: "BRP.Settings.actorSheetBackgroundHint",
    scope: "world",
    config: false,
    type: String,
    filePicker: 'Image',
    default: "",
  },

  charSheetLogo: {
    name: "BRP.Settings.charSheetLogo",
    hint: "BRP.Settings.charSheetLogoHint",
    scope: "world",
    config: false,
    type: String,
    filePicker: 'Image',
    default: 'systems/brp/assets/char-sheet-logo.png',
  },

  charSheetMainFont: {
    name: "BRP.Settings.charSheetMainFont",
    hint: "BRP.Settings.charSheetMainFontHint",
    scope: "world",
    config: false,
    type: String,
    filePicker: 'Other',
    default: "",
  },
  charSheetTitleFont: {
    name: "BRP.Settings.charSheetTitleFont",
    hint: "BRP.Settings.charSheetTitleFontHint",
    scope: "world",
    config: false,
    type: String,
    filePicker: 'Other',
    default: "",
  },
  charSheetMainFontSize: {
    name: "BRP.Settings.charSheetMainFontSize",
    hint: "BRP.Settings.charSheetMainFontSizeHint",
    scope: "world",
    config: false,
    type: Number,
    default: 16   
  },

  charSheetTitleFontSize: {
    name: "BRP.Settings.charSheetTitleFontSize",
    hint: "BRP.Settings.charSheetTitleFontSizeHint",
    scope: "world",
    config: false,
    type: Number,
    default: 20   
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