import { BRPUtilities } from '../apps/utilities.mjs'

export class BRPIDEditor extends FormApplication {
  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'dialog', 'brpid-editor'],
      template: 'systems/brp/templates/brpid/brpid-editor.html',
      width: 900,
      height: 'auto',
      title: 'BRP.BRPIDFlag.title',
      closeOnSubmit: false,
      submitOnClose: true,
      submitOnChange: true
    })
  }

  async getData () {
    const sheetData = super.getData()

    sheetData.supportedLanguages = CONFIG.supportedLanguages

    this.options.editable = this.object.sheet.isEditable

    sheetData.guessCode = game.system.api.brpid.guessId(this.object)
    sheetData.idPrefix = game.system.api.brpid.getPrefix(this.object)

    sheetData.brpidFlag = this.object.flags?.brp?.brpidFlag

    sheetData.id = sheetData.brpidFlag?.id || ''
    sheetData.lang = sheetData.brpidFlag?.lang || game.i18n.lang
    sheetData.priority = sheetData.brpidFlag?.priority || 0

    const BRPIDKeys = foundry.utils.flattenObject(game.i18n.translations.BRP.BRPIDFlag.keys ?? {})
    const prefix = new RegExp('^' + BRPUtilities.quoteRegExp(sheetData.idPrefix))
    sheetData.existingKeys = Object.keys(BRPIDKeys).reduce((obj, k) => {
      if (k.match(prefix)) {
        obj.push({ k, name: BRPIDKeys[k] })
      }
      return obj
    }, []).sort(BRPUtilities.sortByNameKey)

    sheetData.isSystemID = (typeof BRPIDKeys[sheetData.id] !== 'undefined')
    const match = sheetData.id.match(/^([^\\.]+)\.([^\\.]*)\.(.+)/)
    sheetData._existing = (match && typeof match[3] !== 'undefined' ? match[3] : '')

    if (sheetData.id && sheetData.lang) {
      // Find out if there exists a duplicate BRPID
      const worldDocuments = await game.system.api.brpid.fromBRPIDAll({
        brpid: sheetData.id,
        lang: sheetData.lang,
        scope: 'world'
      })
      const uniqueWorldPriority = {}
      sheetData.worldDocumentInfo = await Promise.all(worldDocuments.map(async (d) => {
        return {
          priority: d.flags.brp.brpidFlag.priority,
          lang: d.flags.brp.brpidFlag.lang ?? 'en',
          link: await TextEditor.enrichHTML(d.link, { async: true }),
          folder: d?.folder?.name
        }
      }))
      const uniqueWorldPriorityCount = new Set(worldDocuments.map((d) => d.flags.brp.brpidFlag.priority)).size;
      if (uniqueWorldPriorityCount !== worldDocuments.length) {
        sheetData.warnDuplicateWorldPriority = true;
      }
      sheetData.worldDuplicates = worldDocuments.length ?? 0

      const compendiumDocuments = await game.system.api.brpid.fromBRPIDAll({
        brpid: sheetData.id,
        lang: sheetData.lang,
        scope: 'compendiums'
      })
      const uniqueCompendiumPriority = {}
      sheetData.compendiumDocumentInfo = await Promise.all(compendiumDocuments.map(async (d) => {
        return {
          priority: d.flags.brp.brpidFlag.priority,
          lang: d.flags.brp.brpidFlag.lang ?? 'en',
          link: await TextEditor.enrichHTML(d.link, { async: true }),
          folder: d?.folder?.name ?? ''
        }
      }))

      const uniqueCompendiumPriorityCount = new Set(compendiumDocuments.map((d) => d.flags.brp.brpidFlag.priority)).size;
      if (uniqueCompendiumPriorityCount !== compendiumDocuments.length) {
        sheetData.warnDuplicateCompendiumPriority = true;
      }
      sheetData.compendiumDuplicates = compendiumDocuments.length ?? 0
    } else {
      sheetData.compendiumDocumentInfo = []
      sheetData.worldDocumentInfo = []
      sheetData.worldDuplicates = 0
      sheetData.compendiumDuplicates = 0
      sheetData.warnDuplicateWorldPriority = false
      sheetData.warnDuplicateCompendiumPriority = false
    }
    return sheetData
  }

  activateListeners (html) {
    super.activateListeners(html)

    html.find('a.copy-to-clipboard').click(function (e) {
      BRPUtilities.copyToClipboard($(this).siblings('input').val())
    })

    if (!this.object.sheet.isEditable) return

    html.find('input[name=_existing').change(function (e) {
      const obj = $(this)
      const prefix = obj.data('prefix')
      let value = obj.val()
      if (value !== '') {
        value = prefix + BRPUtilities.toKebabCase(value)
      }
      html.find('input[name=id]').val(value).trigger('change')
    })

    html.find('select[name=known]').change(function (e) {
      const obj = $(this)
      html.find('input[name=id]').val(obj.val())
    })

    html.find('a[data-guess]').click(async function (e) {
      e.preventDefault()
      const obj = $(this)
      const guess = obj.data('guess')
      html.find('input[name=id]').val(guess).trigger('change')
    })
  }

  async _updateObject (event, formData) {
    const id = formData.id || ''
    await this.object.update({
      'flags.brp.brpidFlag.id': id,
      'flags.brp.brpidFlag.lang': formData.lang || game.i18n.lang,
      'flags.brp.brpidFlag.priority': formData.priority || 0
    })
    const html = $(this.object.sheet.element).find('header.window-header a.header-button.edit-brpid-warning,header.window-header a.header-button.edit-brpid-exisiting')
    if (html.length) {
      html.css({
        color: (id ? 'var(--color-text-light-highlight)' : 'red')
      })
    }
    this.render()
  }

}  