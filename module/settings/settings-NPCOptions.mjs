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

import { BRPSelectLists } from "../apps/select-lists.mjs";

export class BRPNPCSettings extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'BRP.brpSettings',
      classes: ["brp", "rulesmenu"],
      id: 'npc-settings',
      template: 'systems/brp/templates/settings/npc-settings.html',
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

    options.xpOptions = await BRPSelectLists.getXPOptions();
    options.tokenDropModeOptions = {
      "ask": game.i18n.localize('BRP.Settings.tokenDropModeAsk'),
      "roll": game.i18n.localize('BRP.Settings.tokenDropModeRoll'),
      "average": game.i18n.localize('BRP.Settings.tokenDropModeAverage'),
      "ignore": game.i18n.localize('BRP.Settings.tokenDropModeIgnore')
    }
    options.NPCNameOptions = {
      "NONE": game.i18n.localize("BRP.Settings.displayNONE"),
      "ALWAYS": game.i18n.localize("BRP.Settings.displayALWAYS"),
      "CONTROL": game.i18n.localize("BRP.Settings.displayCONTROL"),
      "OWNER": game.i18n.localize("BRP.Settings.displayOWNER"),
      "HOVER": game.i18n.localize("BRP.Settings.displayHOVER"),
      "OWNER_HOVER": game.i18n.localize("BRP.Settings.displayOWNER_HOVER")
    }
    options.NPCBarsOptions = {
      "NONE": game.i18n.localize("BRP.Settings.displayNONE"),
      "ALWAYS": game.i18n.localize("BRP.Settings.displayALWAYS"),
      "CONTROL": game.i18n.localize("BRP.Settings.displayCONTROL"),
      "OWNER": game.i18n.localize("BRP.Settings.displayOWNER"),
      "HOVER": game.i18n.localize("BRP.Settings.displayHOVER"),
      "OWNER_HOVER": game.i18n.localize("BRP.Settings.displayOWNER_HOVER")
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
