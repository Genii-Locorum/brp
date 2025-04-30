import { BRPActiveEffect } from "../apps/active-effect.mjs"

export class BRPActiveEffectSheet {
  static getItemEffectsFromSheet(sheetData) {
    if (sheetData.hasOwner) {
      return sheetData.document.parent.effects.reduce((c, i) => {
        if (i.origin === sheetData.document.uuid) {
          c.push({
            uuid: i.uuid,
            name: i.name
          })
        }
        return c
      }, [])
    }
    return sheetData.document.effects.reduce((c, i) => {
      c.push({
        uuid: i.uuid,
        name: i.name
      })
      return c
    }, [])
  }

  static getAutoEffect(document) {
    if (document.parent) {
      return {
        effect: document.parent.effects.find(e => e.origin === document.uuid && (e.flags.brp?.autoActiveEffect ?? false)),
        document: document.parent,
      }
    }
    return {
      effect: document.effects.find(e => e.flags.brp?.autoActiveEffect ?? false),
      document: document
    }
  }

  static getEffectChangesFromSheet(document) {
    const effectChanges = []
    const effectKeys = foundry.utils.duplicate(CONFIG.BRP.keysActiveEffects)
    const effectData = BRPActiveEffectSheet.getAutoEffect(document)
    if (effectData.effect) {
      for (const change of effectData.effect.changes) {
        if (change.mode === CONST.ACTIVE_EFFECT_MODES.ADD) {
          effectChanges.push({
            key: change.key,
            name: effectKeys[change.key] ?? change.key,
            negative: (change.value < 0),
            value: Math.abs(change.value)
          })
          delete effectKeys[change.key]
        }
      }
    }
    return {
      effectKeys,
      effectChanges
    }
  }

  static async getActorEffectsFromSheet(sheetData) {
    const effectKeys = foundry.utils.duplicate(CONFIG.BRP.keysActiveEffects)
    let aEffects = this.getItemEffectsFromSheet(sheetData)
    let effects = []
    for (let eff of aEffects) {
      let brpAE = await fromUuid(eff.uuid)
      let item = await fromUuid(brpAE.origin)
      if (item) {
        for (let chng of brpAE.changes) {
          effects.push({
            id: item.id,
            sourceName: item.name,
            key: chng.key,
            name: game.i18n.localize((effectKeys[chng.key] ?? chng.key)),
            value: chng.value,
            isActive: brpAE.active ?? false
          })
        }
      }
    }
    return effects
  }

  static activateListeners(document, html) {
    if (game.user.isGM) {
      html.find('div[data-action="openActiveEffect"]').click(BRPActiveEffectSheet._onOpenActiveEffect.bind(document))
      html.find('div[data-action="addItemEffect"]').click(BRPActiveEffectSheet._onAddItemEffect.bind(document))
      html.find('div.active-effect-change-edit .fa-trash').click(BRPActiveEffectSheet._onDeleteItemEffectChange.bind(document))
      html.find('div.active-effect-change-edit select').click(BRPActiveEffectSheet._onChangeItemEffectChange.bind(document))
      html.find('div.active-effect-change-edit input').blur(BRPActiveEffectSheet._onChangeItemEffectChange.bind(document))
    }
  }

  static async _onAddItemEffect(event) {
    if (typeof event.currentTarget.dataset.key === 'string') {
      const effectData = BRPActiveEffectSheet.getAutoEffect(this.document)
      const newChange = {
        key: event.currentTarget.dataset.key,
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: 0
      }
      if (effectData.effect) {
        const changes = foundry.utils.duplicate(effectData.effect.changes)
        changes.push(newChange)
        await effectData.document.updateEmbeddedDocuments('ActiveEffect', [{
          _id: effectData.effect.id,
          changes: changes
        }])
      } else {
        const newDoc = {
          'flags.brp.autoActiveEffect': true,
          name: effectData.document.name,
          changes: [
            newChange
          ],
        }
        if (this.document.parent) {
          newDoc.origin = this.document.uuid
        }
        await effectData.document.createEmbeddedDocuments('ActiveEffect', [newDoc])
      }
      this.render(true)
    }
  }

  static async _onDeleteItemEffectChange(event) {
    const key = event.currentTarget.closest('div.active-effect-change-edit')?.dataset?.key
    if (typeof key === 'string') {
      const effectData = BRPActiveEffectSheet.getAutoEffect(this.document)
      if (effectData.effect) {
        const changes = foundry.utils.duplicate(effectData.effect.changes).filter(c => c.key !== key)
        if (changes.length) {
          await effectData.document.updateEmbeddedDocuments('ActiveEffect', [{
            _id: effectData.effect.id,
            changes: changes
          }])
        } else {
          await effectData.document.deleteEmbeddedDocuments('ActiveEffect', [
            effectData.effect.id,
          ])
        }
        this.render(true)
      }
    }
  }

  static async _onChangeItemEffectChange(event) {
    const outer = event.currentTarget.closest('div.active-effect-change-edit')
    const key = outer?.dataset?.key
    if (typeof key === 'string') {
      const effectData = BRPActiveEffectSheet.getAutoEffect(this.document)
      if (effectData.effect) {
        const changes = foundry.utils.duplicate(effectData.effect.changes)
        const index = changes.findIndex(c => c.key === key)
        if (index > -1) {
          const value = parseInt(outer.querySelector('select').value + outer.querySelector('input').value, 10)
          changes[index].value = value
          await effectData.document.updateEmbeddedDocuments('ActiveEffect', [{
            _id: effectData.effect.id,
            changes: changes
          }])
        }
      }
    }
  }

  static async _onOpenActiveEffect(event) {
    const uuid = event.currentTarget.dataset.uuid
    if (uuid) {
      (await fromUuid(uuid))?.sheet.render(true)
    }
  }
}
