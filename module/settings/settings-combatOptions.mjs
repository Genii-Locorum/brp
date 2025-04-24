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

export class BRPCombatRuleSettings extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'BRP.brpSettings',
      classes: ["brp", "rulesmenu"],
      id: 'combat-settings',
      template: 'systems/brp/templates/settings/combat-settings.html',
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

    options.initChoiceList = await BRPSelectLists.getStatOptions();

    options.initRoundList = {
      "no": game.i18n.localize('BRP.no'),
      "manual": game.i18n.localize('BRP.manual'),
      "auto": game.i18n.localize('BRP.automatic'),
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
