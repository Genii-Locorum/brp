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
      return document.parent.effects.find(e => e.origin === document.uuid && (e.flags.brp?.autoActiveEffect ?? false))
    }
    return document.effects.find(e => e.flags.brp?.autoActiveEffect ?? false)
  }

  static getEffectChangesFromSheet(document) {
    const effectChanges = []
    const effectKeys = foundry.utils.duplicate(CONFIG.BRP.keysActiveEffects)
    const effect = BRPActiveEffectSheet.getAutoEffect(document)
    if (effect) {
      for (const change of effect.changes) {
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
      let item = await fromUuid (brpAE.origin)
      for (let chng of brpAE.changes) {
        effects.push({
          id: item.id,
          sourceName: item.name,
          key: chng.key,
          name: game.i18n.localize ((effectKeys[chng.key] ?? chng.key) ),
          value: chng.value,
          isActive: brpAE.active ?? false
        })
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
      const effect = BRPActiveEffectSheet.getAutoEffect(this.document)
      const newChange = {
        key: event.currentTarget.dataset.key,
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: 0
      }
      if (effect) {
        const changes = foundry.utils.duplicate(effect.changes)
        changes.push(newChange)
        await this.document.parent.updateEmbeddedDocuments('ActiveEffect', [{
          _id: effect.id,
          changes: changes
        }])
      } else {
        if (this.document.parent) {
          await this.document.parent.createEmbeddedDocuments('ActiveEffect', [{
            'flags.brp.autoActiveEffect': true,
            name: this.document.name,
            changes: [
              newChange
            ],
            origin: this.document.uuid
          }])
        } else {
          await this.document.createEmbeddedDocuments('ActiveEffect', [{
            'flags.brp.autoActiveEffect': true,
            name: this.document.name,
            changes: [
              newChange
            ]
          }])
        }
      }
      this.render(true)
    }
  }

  static async _onDeleteItemEffectChange(event) {
    const key = event.currentTarget.closest('div.active-effect-change-edit')?.dataset?.key
    if (typeof key === 'string') {
      const effect = BRPActiveEffectSheet.getAutoEffect(this.document)
      if (effect) {
        const changes = foundry.utils.duplicate(effect.changes).filter(c => c.key !== key)
        if (changes.length) {
          if (this.document.parent) {
            await this.document.parent.updateEmbeddedDocuments('ActiveEffect', [{
              _id: effect.id,
              changes: changes
            }])
          } else {
            await this.document.updateEmbeddedDocuments('ActiveEffect', [{
              _id: effect.id,
              changes: changes
            }])
          }
        } else if (this.document.parent) {
          await this.document.parent.deleteEmbeddedDocuments('ActiveEffect', [
            effect.id,
          ])
        } else {
          await this.document.deleteEmbeddedDocuments('ActiveEffect', [
            effect.id,
          ])
        }
      }
    }
  }

  static async _onChangeItemEffectChange(event) {
    const outer = event.currentTarget.closest('div.active-effect-change-edit')
    const key = outer?.dataset?.key
    if (typeof key === 'string') {
      const effect = BRPActiveEffectSheet.getAutoEffect(this.document)
      if (effect) {
        const changes = foundry.utils.duplicate(effect.changes)
        const index = changes.findIndex(c => c.key === key)
        if (index > -1) {
          const value = parseInt(outer.querySelector('select').value + outer.querySelector('input').value, 10)
          changes[index].value = value
          if (this.document.parent) {
            await this.document.parent.updateEmbeddedDocuments('ActiveEffect', [{
              _id: effect.id,
              changes: changes
            }])
          } else {
            await this.document.updateEmbeddedDocuments('ActiveEffect', [{
              _id: effect.id,
              changes: changes
            }])
          }
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
