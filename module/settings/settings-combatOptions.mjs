const SETTINGS = {

  initStat: {
    name: 'BRP.Settings.initStat',
    hint: 'BRP.Settings.initStatHint',
    scope: 'world',
    config: false,
    default: "dex",
    type: String,
  },

  initMod: {
    name: 'BRP.Settings.initMod',
    hint: 'BRP.Settings.initModHint',
    scope: 'world',
    config: false,
    default: "+0",
    type: String,
  },

  initRound: {
    name: "BRP.Settings.initRound",
    hint: "BRP.Settings.initRoundHint",
    scope: "world",
    config: false,
    type: String,
    default: "no",
  },

  quickCombat: {
    name: "BRP.Settings.quickCombat",
    hint: "BRP.Settings.quickCombatHint",
    scope: "world",
    config: false,
    default: false,
    type: Boolean
  },

}

import { BRPSelectLists } from "../apps/select-lists.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
export class BRPCombatRuleSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['brp', 'rulesmenu'],
    id: 'char-settings',
    actions: {
      reset: BRPCombatRuleSettings.onResetDefaults,
    },
    form: {
      handler: BRPCombatRuleSettings.formHandler,
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
    form: { template: 'systems/brp/templates/settings/combat-settings.hbs',
            scrollable: ['']
     },
    footer: { template: 'templates/generic/form-footer.hbs' }
  }


  async _prepareContext(options) {
    const isGM = game.user.isGM;
    const optSet = {}
    optSet.initChoiceList = await BRPSelectLists.getStatOptions();
    optSet.initRoundList = {
      "no": game.i18n.localize('BRP.no'),
      "manual": game.i18n.localize('BRP.manual'),
      "auto": game.i18n.localize('BRP.automatic'),
    }
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
