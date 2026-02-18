const SETTINGS = {


  tokenDropMode: {
    name: "BRP.Settings.tokenDropMode",
    hint: "BRP.Settings.tokenDropModeHint",
    scope: "world",
    config: false,
    default: "ask",
    type: String
  },

  npcName: {
    name: "BRP.Settings.tokenDropName",
    hint: "BRP.Settings.tokenDropNameHint",
    scope: "world",
    config: false,
    type: String,
    default: "NONE"
  },

  npcBars: {
    name: "BRP.Settings.tokenDropBars",
    hint: "BRP.Settings.tokenDropBarsHint",
    scope: "world",
    config: false,
    type: String,
    default: "NONE"
  }

}

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api
export class BRPNPCSettings extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    classes: ['brp', 'rulesmenu'],
    id: 'char-settings',
    actions: {
      reset: BRPNPCSettings.onResetDefaults,
    },
    form: {
      handler: BRPNPCSettings.formHandler,
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
    form: { template: 'systems/brp/templates/settings/npc-settings.hbs',
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
    optSet.tokenDropModeOptions = {
      "ask": game.i18n.localize('BRP.Settings.tokenDropModeAsk'),
      "roll": game.i18n.localize('BRP.Settings.tokenDropModeRoll'),
      "average": game.i18n.localize('BRP.Settings.tokenDropModeAverage'),
      "ignore": game.i18n.localize('BRP.Settings.tokenDropModeIgnore')
    }
    optSet.NPCNameOptions = {
      "NONE": game.i18n.localize("BRP.Settings.displayNONE"),
      "ALWAYS": game.i18n.localize("BRP.Settings.displayALWAYS"),
      "CONTROL": game.i18n.localize("BRP.Settings.displayCONTROL"),
      "OWNER": game.i18n.localize("BRP.Settings.displayOWNER"),
      "HOVER": game.i18n.localize("BRP.Settings.displayHOVER"),
      "OWNER_HOVER": game.i18n.localize("BRP.Settings.displayOWNER_HOVER")
    }
    optSet.NPCBarsOptions = {
      "NONE": game.i18n.localize("BRP.Settings.displayNONE"),
      "ALWAYS": game.i18n.localize("BRP.Settings.displayALWAYS"),
      "CONTROL": game.i18n.localize("BRP.Settings.displayCONTROL"),
      "OWNER": game.i18n.localize("BRP.Settings.displayOWNER"),
      "HOVER": game.i18n.localize("BRP.Settings.displayHOVER"),
      "OWNER_HOVER": game.i18n.localize("BRP.Settings.displayOWNER_HOVER")
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
