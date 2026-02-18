const SETTINGS = {

  useHPL: {
    name: 'BRP.Settings.useHPL',
    hint: 'BRP.Settings.useHPLHint',
    scope: 'world',
    config: false,
    type: Boolean,
    default: false,
  },

  useEDU: {
    name: 'BRP.Settings.useEDU',
    hint: 'BRP.Settings.useEDUHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  },

  useSAN: {
    name: 'BRP.Settings.useSAN',
    hint: 'BRP.Settings.useSANHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  },

  useFP: {
    name: 'BRP.Settings.useFP',
    hint: 'BRP.Settings.useFPHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  },

  useRes5: {
    name: 'BRP.Settings.useRes5',
    hint: 'BRP.Settings.useRes5Hint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  },

  hpLabelLong: {
    name: 'BRP.Settings.hpLabelLong',
    hint: 'BRP.Settings.hpLabelLongHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  hpLabelShort: {
    name: 'BRP.Settings.hpLabelShort',
    hint: 'BRP.Settings.hpLabelShortHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  ppLabelLong: {
    name: 'BRP.Settings.ppLabelLong',
    hint: 'BRP.Settings.ppLabelLongHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  ppLabelShort: {
    name: 'BRP.Settings.ppLabelShort',
    hint: 'BRP.Settings.ppLabelShortHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  fpLabelLong: {
    name: 'BRP.Settings.fpLabelLong',
    hint: 'BRP.Settings.fpLabelLongHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  fpLabelShort: {
    name: 'BRP.Settings.fpLabelShort',
    hint: 'BRP.Settings.fpLabelShortHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

    sanLabelLong: {
    name: 'BRP.Settings.sanLabelLong',
    hint: 'BRP.Settings.sanLabelLongHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  sanLabelShort: {
    name: 'BRP.Settings.sanLabelShort',
    hint: 'BRP.Settings.sanLabelShortHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  sanLabelLoss: {
    name: 'BRP.Settings.sanLabelLoss',
    hint: 'BRP.Settings.sanLabelLossHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  res5LabelLong: {
    name: 'BRP.Settings.res5LabelLong',
    hint: 'BRP.Settings.res5LabelLongHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  res5LabelShort: {
    name: 'BRP.Settings.res5LabelShort',
    hint: 'BRP.Settings.res5LabelShortHint',
    scope: 'world',
    config: false,
    default: "",
    type: String
  },

  skillBonus: {
    name: "BRP.Settings.skillBonus",
    hint: "BRP.Settings.skillBonusHint",
    scope: "world",
    config: false,
    type: String,
    default: 0
  },

  useAVRand: {
    name: 'BRP.Settings.useAVRand',
    hint: 'BRP.Settings.useAVRandHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  },

  useAlleg: {
    name: 'BRP.Settings.useAlleg',
    hint: 'BRP.Settings.useAllegHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  },

  usePassion: {
    name: 'BRP.Settings.usePassion',
    hint: 'BRP.Settings.usePassionHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  },

  useReputation: {
    name: 'BRP.Settings.useReputation',
    hint: 'BRP.Settings.useReputationHint',
    scope: 'world',
    config: false,
    default: 0,
    type: String
  },

  usePersTrait: {
    name: 'BRP.Settings.usePersTrait',
    hint: 'BRP.Settings.usePersTraitHint',
    scope: 'world',
    config: false,
    default: false,
    type: Boolean
  }
}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
export class BRPOptionalRuleSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['brp', 'rulesmenu'],
    id: 'char-settings',
    actions: {
      reset: BRPOptionalRuleSettings.onResetDefaults,
    },
    form: {
      handler: BRPOptionalRuleSettings.formHandler,
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
    form: { template: 'systems/brp/templates/settings/optional-settings.hbs',
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
    optSet.skillBonusList = {
      "0": game.i18n.localize('BRP.none'),
      "1": game.i18n.localize('BRP.simple'),
      "2": game.i18n.localize('BRP.advanced')
    }

    optSet.useRepList = {
      "0": game.i18n.localize('BRP.none'),
      "1": game.i18n.localize('BRP.single'),
      "2": game.i18n.localize('BRP.multiple'),
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
