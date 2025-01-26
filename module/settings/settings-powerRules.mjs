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

export class BRPPowerRuleSettings extends FormApplication {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'BRP.brpSettings',
      id: 'power-settings',
      template: 'systems/brp/templates/settings/power-settings.html',
      width: 550,
      height: 'auto',
      closeOnSubmit: true
    })
  }
  
  getData () {
    const options = {}
    for (const [k, v] of Object.entries(SETTINGS)) {
      options[k] = {
        value: game.settings.get('brp', k),
        setting: v
      }
    }
    return options
  }
  
  static registerSettings () {
    for (const [k, v] of Object.entries(SETTINGS)) {
      game.settings.register('brp', k, v)
    }
  }

  activateListeners (html) {
    super.activateListeners(html)
    html.find('button[name=reset]').on('click', event => this.onResetDefaults(event))
  }

  async onResetDefaults (event) {
    event.preventDefault()
    for await (const [k, v] of Object.entries(SETTINGS)) {
      await game.settings.set('brp', k, v?.default)
    }
    return this.render()
  }

  async _updateObject (event, data) {
    for await (const key of Object.keys(SETTINGS)) {
      game.settings.set('brp', key, data[key])
    }
  }  

}    