import ChaosiumCanvasInterface from "./chaosium-canvas-interface.mjs";

export default class ChaosiumCanvasInterfaceMapPinToggle extends ChaosiumCanvasInterface {
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
    return 'fa-solid fa-map-pin'
  }

  static defineSchema () {
    const fields = foundry.data.fields
    return {
      triggerButton: new fields.NumberField({
        choices: ChaosiumCanvasInterface.triggerButtons,
        initial: ChaosiumCanvasInterface.triggerButton.Left,
        label: 'BRP.ChaosiumCanvasInterface.MapPinToggle.Button.Title',
        hint: 'BRP.ChaosiumCanvasInterface.MapPinToggle.Button.Hint'
      }),
      action: new fields.NumberField({
        choices: ChaosiumCanvasInterface.actionToggles,
        initial: ChaosiumCanvasInterface.actionToggle.Off,
        label: 'AOV.ChaosiumCanvasInterface.MapPinToggle.Action.Title',
        hint: 'AOV.ChaosiumCanvasInterface.MapPinToggle.Action.Hint',
        required: true
      }),
      noteUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Note'
        }),
        {
          label: 'BRP.ChaosiumCanvasInterface.MapPinToggle.Note.Title',
          hint: 'BRP.ChaosiumCanvasInterface.MapPinToggle.Note.Hint'
        }
      ),
      documentUuids: new fields.SetField(
        new fields.DocumentUUIDField({
        }),
        {
          label: 'BRP.ChaosiumCanvasInterface.MapPinToggle.Document.Title',
          hint: 'BRP.ChaosiumCanvasInterface.MapPinToggle.Document.Hint'
        }
      ),
      permissionShow: new fields.NumberField({
        choices: Object.keys(ChaosiumCanvasInterfaceMapPinToggle.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceMapPinToggle.PERMISSIONS[k]); return c }, {}),
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
        label: 'BRP.ChaosiumCanvasInterface.MapPinToggle.PermissionShow.Title',
        hint: 'BRP.ChaosiumCanvasInterface.MapPinToggle.PermissionShow.Hint',
        required: true
      }),
      permissionHide: new fields.NumberField({
        choices: Object.keys(ChaosiumCanvasInterfaceMapPinToggle.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceMapPinToggle.PERMISSIONS[k]); return c }, {}),
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
        label: 'BRP.ChaosiumCanvasInterface.MapPinToggle.PermissionHide.Title',
        hint: 'BRP.ChaosiumCanvasInterface.MapPinToggle.PermissionHide.Hint',
        required: true
      })
    }
  }

  static migrateData (source) {
    if (typeof source.toggle !== 'undefined' && typeof source.action === 'undefined') {
      source.action = (source.toggle ? ChaosiumCanvasInterface.actionToggle.On : ChaosiumCanvasInterface.actionToggle.Off)
    }
    return source
  }

  async _handleMouseOverEvent () {
    return game.user.isGM
  }

  async #handleClickEvent () {
    game.socket.emit('system.brp', { type: 'toggleMapNotes', toggle: true })
    game.settings.set('core', foundry.canvas.layers.NotesLayer.TOGGLE_SETTING, true)
    let toggle = false
    switch (this.action) {
      case ChaosiumCanvasInterface.actionToggle.On:
        toggle = true
        break
      case ChaosiumCanvasInterface.actionToggle.Toggle:
        {
          const firstUuid = this.documentUuids.first()
          if (firstUuid) {
            const doc = await fromUuid(firstUuid)
            toggle = doc.ownership.default === this.permissionHide
          }
        }
        break
    }
    for (const uuid of this.documentUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        const permission = (toggle ? this.permissionShow : this.permissionHide)
        await doc.update({ 'ownership.default': permission })
      } else {
        console.error('Document ' + uuid + ' not loaded')
      }
    }
    for (const uuid of this.noteUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        const texture = (toggle ? 'systems/brp/assets/map-pin.svg' : 'systems/brp/assets/map-pin-dark.svg')
        await doc.update({ 'texture.src': texture })
      } else {
        console.error('Note ' + uuid + ' not loaded')
      }
    }
  }

  async _handleLeftClickEvent () {
    if (this.triggerButton === ChaosiumCanvasInterface.triggerButton.Left) {
      this.#handleClickEvent()
    }
  }

  async _handleRightClickEvent () {
    if (this.triggerButton === ChaosiumCanvasInterface.triggerButton.Right) {
      this.#handleClickEvent()
    }
  }
}
