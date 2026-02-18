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

  actorTertiaryColour: {
    name: "BRP.Settings.actorTertiaryColour",
    hint: "BRP.Settings.actorTertiaryColourHint",
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

  brpIconPrimary: {
    name: "BRP.Settings.brpIconPrimary",
    hint: "BRP.Settings.brpIconPrimaryHint",
    scope: "world",
    config: false,
    type: String,
    default: ""
  },




}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
export class BRPDisplaySettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['brp', 'rulesmenu'],
    id: 'char-settings',
    actions: {
      reset: BRPDisplaySettings.onResetDefaults,
    },
    form: {
      handler: BRPDisplaySettings.formHandler,
      closeOnSubmit: true,
      submitOnChange: false
    },
    position: {
      width: 550,
      height: 'auto',
    },
    tag: 'form',
    window: {
      resizable: true,
      title: 'BRP.brpSettings',
      contentClasses: ["standard-form"]
    }
  }

  get title() {
    return `${game.i18n.localize(this.options.window.title)}`;
  }

  static PARTS = {
    form: { template: 'systems/brp/templates/settings/display-settings.hbs',
      scrollable: ['']
     },
    footer: { template: 'templates/generic/form-footer.hbs' }
  }

  async _prepareContext(options) {
    const isGM = game.user.isGM;
    const optSet = {}
    for (const [k, v] of Object.entries(SETTINGS)) {
      optSet[k] = {
        value: game.settings.get('brp', k),
        setting: v
      }
    }
    return {
      isGM,
      optSet,
      buttons: [
        { type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" },
        { type: "reset", action: "reset", icon: "fa-solid fa-undo", label: "SETTINGS.Reset" },
      ]
    }
  }

  static registerSettings() {
    for (const [k, v] of Object.entries(SETTINGS)) {
      game.settings.register('brp', k, v)
    }
  }

  static async onResetDefaults(event) {
    event.preventDefault()
    for await (const [k, v] of Object.entries(SETTINGS)) {
      await game.settings.set('brp', k, v?.default)
    }
    return this.render()
  }

  static async formHandler(event, form, formData) {
    const settings = foundry.utils.expandObject(formData.object)
    await Promise.all(
      Object.entries(settings)
        .map(([key, value]) => game.settings.set("brp", key, value))
    )
  }


}
