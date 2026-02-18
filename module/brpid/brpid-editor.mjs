import { BRP } from '../setup/config.mjs'
import { BRPUtilities } from '../apps/utilities.mjs'

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class BRPIDEditor extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    tag: 'form',
    name: "brpidEditor",
    classes: ['brp', 'dialog', 'brpid-editor'],
    form: {
      handler: BRPIDEditor._updateObject,
      closeOnSubmit: false,
      submitOnClose: true,
      submitOnChange: true,
    },
    position: {
      width: 900,
      height: "auto",
    },
    actions: {
      copyToClip: BRPIDEditor.copyToClip,
      guess: BRPIDEditor.guessID,
    },



    window: {
      title: 'BRP.BRPIDFlag.title',
      contentClasses: ["standard-form"],
    }
  }

  get title() {
    return `${game.i18n.localize(this.options.window.title)}`;
  }

  static PARTS = {
    form: { template: 'systems/brp/templates/brpid/brpid-editor.hbs' },
  }

  static addBRPIDSheetHeaderButton (application, element) {
    if (typeof application.options.actions.brpid !== 'undefined') return
    application.options.actions.brpid = {
      handler: (event, element) => {
        event.preventDefault()
        event.stopPropagation()
        if (event.detail > 1) return // Ignore repeated clicks
        if (event.button === 2 && (application.document.flags.brp?.brpidFlag?.id ?? false)) {
          game.clipboard.copyPlainText(application.document.flags.brp.brpidFlag.id)
          ui.notifications.info('BRP.WhatCopiedClipboard', { format: { what: game.i18n.localize('BRP.BRPIDFlag.key') }, console: false })
        } else {
          new BRPIDEditor({ document: application.document }, {}).render(true, { focus: true })
        }
      },
      buttons: [0, 2]
    }
    const copyUuid = element.querySelector('button.header-control.fa-solid.fa-passport')
    if (copyUuid) {
      const button = document.createElement('button')
      button.type = 'button'
      button.classList = 'header-control fa-solid fa-fingerprint icon'
      if (!(application.document.flags.brp?.brpidFlag?.id ?? false)) {
        button.classList.add('invalid-brpid')
      }
      button.dataset.action = 'brpid'
      button.dataset.tooltip = 'BRP.BRPIDFlag.id'
      copyUuid.after(button)
    }
  }

  async _prepareContext(options) {

    this.document = this.options.document
    const sheetData = await super._prepareContext()
    sheetData.objtype = this.document.type
    sheetData.objid = this.document.id
    sheetData.objuuid = this.document.uuid
    sheetData.supportedLanguages = CONFIG.supportedLanguages
    sheetData.isEditable = this.document.sheet.isEditable
    sheetData.guessCode = game.system.api.brpid.guessId(this.document)
    sheetData.idPrefix = game.system.api.brpid.getPrefix(this.document)
    sheetData.brpidFlag = this.document.flags?.brp?.brpidFlag
    sheetData.id = sheetData.brpidFlag?.id || ''
    sheetData.lang = sheetData.brpidFlag?.lang || game.i18n.lang
    sheetData.priority = sheetData.brpidFlag?.priority || 0

    //const BRPIDKeys = foundry.utils.flattenObject(game.i18n.translations.BRP.BRPIDFlag.keys ?? {})
    const BRPIDKeys = game.system.api.brpid.getBRPIDKeys()

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
          link: await foundry.applications.ux.TextEditor.implementation.enrichHTML(d.link, { async: true }),
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
          link: await foundry.applications.ux.TextEditor.implementation.enrichHTML(d.link, { async: true }),
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

  _onRender(context, options) {
    if (this.element.querySelector('input[name=_existing')) {
      this.element.querySelector('input[name=_existing').addEventListener("change", function (e) {
        const obj = $(this)
        const prefix = obj.data('prefix')
        let value = obj.val()
        if (value !== '') {
          value = prefix + BRPUtilities.toKebabCase(value)
        }
        let target = document.querySelector('input[name=id]');
        target.value = value
      })
    }


    if (this.element.querySelector('select[name=known]')) {
      this.element.querySelector('select[name=known]').addEventListener("change", function (e) {
        const obj = $(this)
        let value = obj.val()
        let target = document.querySelector('input[name=id]');
        target.value = value
      })
    }

  }

  static async copyToClip(event, target) {
    await BRPUtilities.copyToClipboard($(target).siblings('input').val())
  }

  static async guessID(event, target) {
    const guess = target.dataset.guess
    const priority = this.document.flags.brp?.brpidFlag?.priority ?? 0
    const lang = this.document.flags.brp?.brpidFlag?.lang ?? game.i18n.lang

    await this.document.update({
      'flags.brp.brpidFlag.id': guess,
      'flags.brp.brpidFlag.lang': lang,
      'flags.brp.brpidFlag.priority': priority,
    })
    const html = $(this.document.sheet.element).find('header.window-header .edit-brpid-warning,header.window-header .edit-brpid-exisiting')
    if (html.length) {
      html.css({
        color: (guess ? 'var(--color-text-light-highlight)' : 'red')
      })
    }
    this.render()
  }

  static async _updateObject(event, form, formData) {
    const usage = foundry.utils.expandObject(formData.object)
    const id = usage.id || ''
    const priority = usage.priority || 0
    const lang = usage.lang || game.i18n.lang
    await this.document.update({
      'flags.brp.brpidFlag.id': id,
      'flags.brp.brpidFlag.lang': lang,
      'flags.brp.brpidFlag.priority': priority,
    })
    const html = $(this.document.sheet.element).find('header.window-header .edit-brpid-warning,header.window-header .edit-brpid-exisiting')
    if (html.length) {
      html.css({
        color: (id ? 'var(--color-text-light-highlight)' : 'red')
      })
    }
    this.render()
  }

}
