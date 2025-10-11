import ChaosiumCanvasInterface from "./chaosium-canvas-interface.mjs";

export default class ChaosiumCanvasInterfaceDrawingToggle extends ChaosiumCanvasInterface {
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
    return 'fa-solid fa-pencil'
  }

  static defineSchema () {
    const fields = foundry.data.fields
    return {
      toggle: new fields.BooleanField({
        initial: false,
        label: 'BRP.ChaosiumCanvasInterface.DrawingToggle.Toggle.Title',
        hint: 'BRP.ChaosiumCanvasInterface.DrawingToggle.Toggle.Hint'
      }),
      drawingUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Drawing'
        }),
        {
          label: 'BRP.ChaosiumCanvasInterface.DrawingToggle.Drawing.Title',
          hint: 'BRP.ChaosiumCanvasInterface.DrawingToggle.Drawing.Hint'
        }
      ),
      journalEntryUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'JournalEntry'
        }),
        {
          label: 'BRP.ChaosiumCanvasInterface.DrawingToggle.JournalEntry.Title',
          hint: 'BRP.ChaosiumCanvasInterface.DrawingToggle.JournalEntry.Hint'
        }
      ),
      permissionDocument: new fields.NumberField({
        choices: Object.keys(ChaosiumCanvasInterfaceDrawingToggle.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceDrawingToggle.PERMISSIONS[k]); return c }, {}),
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        label: 'BRP.ChaosiumCanvasInterface.DrawingToggle.PermissionDocument.Title',
        hint: 'BRP.ChaosiumCanvasInterface.DrawingToggle.PermissionDocument.Hint',
        required: true
      }),
      journalEntryPageUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'JournalEntryPage'
        }),
        {
          label: 'BRP.ChaosiumCanvasInterface.DrawingToggle.JournalEntryPage.Title',
          hint: 'BRP.ChaosiumCanvasInterface.DrawingToggle.JournalEntryPage.Hint'
        }
      ),
      permissionPage: new fields.NumberField({
        choices: Object.keys(ChaosiumCanvasInterfaceDrawingToggle.PERMISSIONS).reduce((c, k) => { c[k] = game.i18n.localize(ChaosiumCanvasInterfaceDrawingToggle.PERMISSIONS[k]); return c }, {}),
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        label: 'BRP.ChaosiumCanvasInterface.DrawingToggle.PermissionPage.Title',
        hint: 'BRP.ChaosiumCanvasInterface.DrawingToggle.PermissionPage.Hint',
        required: true
      }),
      regionBehaviorUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'RegionBehavior'
        }),
        {
          label: 'BRP.ChaosiumCanvasInterface.DrawingToggle.RegionBehavior.Title',
          hint: 'BRP.ChaosiumCanvasInterface.DrawingToggle.RegionBehavior.Hint'
        }
      ),
      regionUuids: new fields.SetField(
        new fields.DocumentUUIDField({
          type: 'Region'
        }),
        {
          label: 'BRP.ChaosiumCanvasInterface.DrawingToggle.RegionUuids.Title',
          hint: 'BRP.ChaosiumCanvasInterface.DrawingToggle.RegionUuids.Hint'
        }
      ),
    }
  }

  async _handleMouseOverEvent () {
    return game.user.isGM
  }

  async _handleLeftClickEvent () {
    for (const uuid of this.drawingUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ hidden: !this.toggle })
      } else {
        console.error('Drawing ' + uuid + ' not loaded')
      }
    }
    const permissionDocument = (!this.toggle ? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE : this.permissionDocument)
    const permissionPage = (!this.toggle ? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE : this.permissionPage)
    for (const uuid of this.journalEntryUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ 'ownership.default': permissionDocument })
      } else {
        console.error('Journal Entry ' + uuid + ' not loaded')
      }
    }
    for (const uuid of this.journalEntryPageUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ 'ownership.default': permissionPage })
      } else {
        console.error('Journal Entry Page ' + uuid + ' not loaded')
      }
    }
    for (const uuid of this.regionBehaviorUuids) {
      const doc = await fromUuid(uuid)
      if (doc) {
        await doc.update({ disabled: !this.toggle })
      } else {
        console.error('Region Behavior ' + uuid + ' not loaded')
      }
    }
  }

  async _handleRightClickEvent () {
    await this._handleLeftClickEvent()
    for (const uuid of this.regionUuids) {
      setTimeout(() => {
        game.brp.ClickRegionLeftUuid(uuid)
      }, 100)
    }
  }
}
