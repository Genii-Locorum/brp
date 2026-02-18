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

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
export class BRPbrpidSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['brp', 'rulesmenu'],
    id: 'char-settings',
    actions: {
      reset: BRPbrpidSettings.onResetDefaults,
    },
    form: {
      handler: BRPbrpidSettings.formHandler,
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
    form: { template: 'systems/brp/templates/settings/brpid-settings.hbs',
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
