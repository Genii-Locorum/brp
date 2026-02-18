const SETTINGS = {

  autoXP: {
    name: 'BRP.Settings.autoXP',
    hint: 'BRP.Settings.autoXPHint',
    scope: 'world',
    config: false,
    default: 0,
    type: String,
  },

  xpFormula: {
    name: "BRP.Settings.xpFormula",
    hint: 'BRP.Settings.xpFormulaHint',
    scope: "world",
    config: false,
    type: String,
    default: '1D6'
  },

  xpFixed: {
    name: "BRP.Settings.xpFixed",
    hint: 'BRP.Settings.xpFixedHint',
    scope: "world",
    config: false,
    type: Number,
    default: 3
  },

  xpRollDice: {
    name: "BRP.Settings.xpRollDice",
    hint: "BRP.Settings.xpRollDiceHint",
    scope: "world",
    config: false,
    type: Boolean,
    default: false
  }
}

import { BRPSelectLists } from '../apps/select-lists.mjs'
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
export class BRPXPSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['brp', 'rulesmenu'],
    id: 'char-settings',
    actions: {
      reset: BRPXPSettings.onResetDefaults,
    },
    form: {
      handler: BRPXPSettings.formHandler,
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
    form: { template: 'systems/brp/templates/settings/xp-settings.hbs',
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
    optSet.xpOptions = await BRPSelectLists.getXPOptions();
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
