import ChaosiumCanvasInterface from "./chaosium-canvas-interface.mjs";

export default class ChaosiumCanvasInterfaceAmbientLightToggle extends ChaosiumCanvasInterface {
  static get PERMISSIONS () {
    return {
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.INHERIT]: 'OWNERSHIP.INHERIT',
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE]: 'OWNERSHIP.NONE',
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED]: 'OWNERSHIP.LIMITED',
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER]: 'OWNERSHIP.OBSERVER',
      [CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER]: 'OWNERSHIP.OWNER'
    }
  }

  static get icon () {
    return 'fa-solid fa-campfire'
  }

  static defineSchema () {
    const fields = foundry.data.fields
    return {
      lightUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          initial: undefined,
          type: 'AmbientLight'
        }),
        {
          label: 'BRP.ChaosiumCanvasInterface.AmbientLightToggle.Light.Title',
          hint: 'BRP.ChaosiumCanvasInterface.AmbientLightToggle.Light.Hint'
        }
      )
    }
  }

  async _handleMouseOverEvent () {
    return game.user.isGM
  }

  async _handleLeftClickEvent () {
    //game.socket.emit('system.rq2', { type: 'toggleMapNotes', toggle: true })
    game.settings.set('core', foundry.canvas.layers.NotesLayer.TOGGLE_SETTING, true)
    for (const uuid of this.lightUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ 'hidden': !doc.hidden })
      } else {
        console.error('Ambient Light ' + uuid + ' not loaded')
      }
    }
  }
}
