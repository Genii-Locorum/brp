const SETTINGS = {

  magic: {
    name: 'BRP.Settings.useMagic',
    hint: 'BRP.Settings.useMagicHint',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  },

  magicLabel: {
    name: 'BRP.Settings.magicLabel',
    hint: 'BRP.Settings.magicLabelHint',
    scope: 'world',
    config: false,
    type: String,
    default: ""
  },

  mutation: {
    name: 'BRP.Settings.useMutation',
    hint: 'BRP.Settings.useMutationHint',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  },

  mutationLabel: {
    name: 'BRP.Settings.mutationLabel',
    hint: 'BRP.Settings.mutationLabelHint',
    scope: 'world',
    config: false,
    type: String,
    default: ""
  },

  psychic: {
    name: 'BRP.Settings.usePsychic',
    hint: 'BRP.Settings.usePsychicHint',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  },

  psychicLabel: {
    name: 'BRP.Settings.psychicLabel',
    hint: 'BRP.Settings.psychicLabelHint',
    scope: 'world',
    config: false,
    type: String,
    default: ""
  },

  sorcery: {
    name: 'BRP.Settings.useSorcery',
    hint: 'BRP.Settings.useSorceryHint',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  },

  sorceryLabel: {
    name: 'BRP.Settings.sorceryLabel',
    hint: 'BRP.Settings.sorceryLabelHint',
    scope: 'world',
    config: false,
    type: String,
    default: ""
  },

  super: {
    name: 'BRP.Settings.useSuper',
    hint: 'BRP.Settings.useSuperHint',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  },

  superLabel: {
    name: 'BRP.Settings.superLabel',
    hint: 'BRP.Settings.superLabelHint',
    scope: 'world',
    config: false,
    type: String,
    default: ""
  }
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
export class BRPPowerRuleSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['brp', 'rulesmenu'],
    id: 'char-settings',
    actions: {
      reset: BRPPowerRuleSettings.onResetDefaults,
    },
    form: {
      handler: BRPPowerRuleSettings.formHandler,
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
    form: { template: 'systems/brp/templates/settings/power-settings.hbs',
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
