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
  },

  useWealth: {
    name: 'BRP.Settings.useWealth',
    hint: 'BRP.Settings.useWealth',
    scope: 'world',
    config: false,
    default: true,
    type: Boolean
  },

  wealthLabel: {
    name: "BRP.Settings.wealthLabel",
    hint: "BRP.Settings.wealthLabelHint",
    scope: "world",
    config: false,
    type: String,
    default: "Gold"
  },


}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
export class BRPCharSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['brp', 'rulesmenu'],
    id: 'char-settings',
    actions: {
      reset: BRPCharSettings.onResetDefaults,
    },
    form: {
      handler: BRPCharSettings.formHandler,
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
    form: { template: 'systems/brp/templates/settings/char-settings.hbs',
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
