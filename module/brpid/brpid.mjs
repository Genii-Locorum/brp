// ID 20: BRP Creatures

import { BRPUtilities } from '../apps/utilities.mjs'

export class BRPID {
  static init () {
    CONFIG.Actor.compendiumIndexFields.push('flags.brp.brpidFlag')
    CONFIG.Item.compendiumIndexFields.push('flags.brp.brpidFlag')
    CONFIG.JournalEntry.compendiumIndexFields.push('flags.brp.brpidFlag')
    CONFIG.RollTable.compendiumIndexFields.push('flags.brp.brpidFlag')
    game.system.api = { brpid:BRPID }
  }




  static #newProgressBar () {
    /* // FoundryVTT V12 */
    if (foundry.utils.isNewerVersion(game.version, '13')) {
      return ui.notifications.notify('SETUP.PackagesLoading', null, { localize: true, progress: true })
    }
    SceneNavigation.displayProgressBar({ label: game.i18n.localize('SETUP.PackagesLoading'), pct: 0 })
    return true
  }

  static #setProgressBar (bar, current, max) {
    /* // FoundryVTT V12 */
    if (bar === true) {
      SceneNavigation.displayProgressBar({ label: game.i18n.localize('SETUP.PackagesLoading'), pct: Math.floor(current * 100 / max) })
    } else if (bar !== false) {
      bar.update({ pct: current / max })
    }
  }


  /**
   * Returns the flattened BRPIDFlag.keys object, falling back
   * to game.i18n._fallback when the current language is not
   * supported by the system.
   * @returns object
   */
  static getBRPIDKeys() {
    const keys =
      game.i18n.translations?.BRP?.BRPIDFlag?.keys ??
      game.i18n._fallback?.BRP?.BRPIDFlag?.keys ??
      {}
    return foundry.utils.flattenObject(keys)
  }



  /**
   * Returns RegExp for valid type and format
   * @returns RegExp
   */
  static regExKey () {
    return new RegExp('^(' + Object.keys(BRPID.gamePropertyLookup).join('|') + ')\\.(.*?)\\.(.+)$')
  }

  /**
   * Get BRPID type.subtype. based on document
   * @param document
   * @returns string
   */
  static getPrefix (document) {
    for (const type in BRPID.documentNameLookup) {
      if (document instanceof BRPID.documentNameLookup[type]) {
        return type + '.' + (document.type ?? '') + '.'
      }
    }
    return ''
  }

 /**
   * Get BRPID type.subtype.name based on document
   * @param document
   * @returns string
   */
  static guessId (document) {
    return BRPID.getPrefix(document) + BRPUtilities.toKebabCase(document.name)
  }

  /**
   * Get BRPID type.subtype.partial-name(-removed)
   * @param key
   * @returns string
   */
  static guessGroupFromKey (id) {
    if (id) {
      const key = id.replace(/([^\\.-]+)$/, '')
      if (key.substr(-1) === '-') {
        return key
      }
    }
    return ''
  }

  /**
   * Get BRPID type.subtype.partial-name(-removed)
   * @param document
   * @returns string
   */
  static guessGroupFromDocument (document) {
    return BRPID.guessGroupFromKey(document.flags?.brp?.brpidFlag?.id)
  }

  /**
   * Returns all items with matching BRPIDs and language
   * ui.notifications.warn for missing keys
   * @param itemList array of BRPIDs
   * @param lang the language to match against ('en', 'es', ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   * @returns array
   */
  static async expandItemArray ({ itemList, lang = game.i18n.lang, langFallback = true, showLoading = false } = {}) {
    let items = []
    const brpids = itemList.filter(it => typeof it === 'string')
    items = itemList.filter(it => typeof it !== 'string')

    if (brpids.length) {
      const found = await BRPID.fromBRPIDRegexBest({ brpidRegExp: BRPID.makeGroupRegEx(brpids), type: 'i', lang, langFallback, showLoading })
      const all = []
      for (const brpid of brpids) {
        const item = found.find(i => i.flags.brp.brpidFlag.id === brpid)
        if (item) {
          all.push(item)
        }
      }
      if (all.length < brpids.length) {
        const notmissing = []
        for (const doc of all) {
          notmissing.push(doc.flags.brp.brpidFlag.id)
        }
        ui.notifications.warn(game.i18n.format('BRP.BRPIDFlag.error.documents-not-found', { brpids: brpids.filter(x => !notmissing.includes(x)).join(', '), lang}))
      }
      items = items.concat(all)
    }
    return items
  }

  /**
   * Returns item with matching BRPIDs from list
   * Empty array return for missing keys
   * @param brpid a single brpid
   * @param list array of items
   * @returns array
   */
  static findPIdInList (brpid, list) {
    let itemName = ''
    const BRPIDKeys = BRPID.getBRPIDKeys();
    if (typeof BRPIDKeys[brpid] !== 'undefined') {
      itemName = BRPIDKeys[brpid]
    }
    return (typeof list.filter === 'undefined' ? Object.values(list) : list).filter(i => i.flags?.brp?.brpidFlag?.id === brpid || (itemName !== '' && itemName === i.name))
  }

  /**
   * Returns RegExp matching all strings in array
   * @param brpids an array of BRPID strings
   * @param list array of items
   * @returns RegExp
   */
  static makeGroupRegEx (brpids) {
    if (typeof brpids === 'string') {
      brpids = [brpids]
    } else if (typeof brpids === 'undefined' || typeof brpids.filter !== 'function') {
      return undefined
    }
    const splits = {}
    const rgx = BRPID.regExKey()
    for (const i of brpids) {
      const key = i.match(rgx)
      if (key) {
        if (typeof splits[key[1]] === 'undefined') {
          splits[key[1]] = {}
        }
        if (typeof splits[key[1]][key[2]] === 'undefined') {
          splits[key[1]][key[2]] = []
        }
        splits[key[1]][key[2]].push(key[3])
      } else {
        // Sliently error
      }
    }
    const regExParts = []
    for (const t in splits) {
      const row = []
      for (const s in splits[t]) {
        if (splits[t][s].length > 1) {
          row.push(s + '\\.' + '(' + splits[t][s].join('|') + ')')
        } else {
          row.push(s + '\\.' + splits[t][s].join(''))
        }
      }
      if (row.length > 1) {
        regExParts.push(t + '\\.' + '(' + row.join('|') + ')')
      } else {
        regExParts.push(t + '\\.' + row.join(''))
      }
    }
    if (regExParts.length > 1) {
      return new RegExp('^(' + regExParts.join('|') + ')$')
    }
    return new RegExp('^' + regExParts.join('') + '$')
  }

  /**
   * Returns all documents with an BRPID matching the regex and matching the document type and language.
   * Empty array return for no matches
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ('en', 'es', ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param scope defines where it will look:
   * **all**: find in both world & compendia,
   * **world**: only search in world,
   * **compendiums**: only search in compendiums
   * @param showLoading Show loading bar
   * @returns array
   */
  static async fromBRPIDRegexAll ({ brpidRegExp, type, lang = game.i18n.lang, langFallback = true, scope = 'all', showLoading = false } = {}) {
    let progressBar = false
    let progressCurrent = 0
    let progressMax = (1 + game.packs.size) * 2 // Guess at how far bar goes
    if (showLoading) {
      progressBar = BRPID.#newProgressBar()
    }
    let candidates = await BRPID.#getDataFromScopes({ brpidRegExp, type, lang, langFallback, progressBar, progressCurrent, progressMax, scope })
    if (langFallback && lang !== 'en') {
      candidates = BRPID.#filterByLanguage(candidates, lang)
    }
    candidates.sort(BRPID.compareBRPIDPrio)
    const results = await BRPID.#onlyDocuments(candidates, progressBar, progressCurrent, progressMax)
    BRPID.#setProgressBar(progressBar, 1, 1)
    return results
  }

  /**
   * Returns all documents with a BRPID, and language.
   * Empty array return for no matches
   * @param brpid a single brpid
   * @param lang the language to match against ('en', 'es', ...)
   * @param scope defines where it will look:
   * **all**: find in both world & compendia,
   * **world**: only search in world,
   * **compendiums**: only search in compendiums
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   * @returns array
   */
  static async fromBRPIDAll ({ brpid, lang = game.i18n.lang, langFallback = true, scope = 'all', showLoading = false } = {}) {
    if (!brpid || typeof brpid !== 'string') {
      return []
    }
    const parts = brpid.match(BRPID.regExKey())
    if (!parts) {
      return []
    }
    if (lang === '') {
      lang = game.i18n.lang
    }
    return BRPID.fromBRPIDRegexAll({ brpidRegExp: new RegExp('^' + BRPUtilities.quoteRegExp(brpid) + '$'), type: parts[1], lang, langFallback, scope, showLoading })
  }

  /**
   * Gets only the highest priority documents for each BRPID that matches the RegExp and language
   * Empty array return for no matches
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ("en", "es", ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   */
  static async fromBRPIDRegexBest ({ brpidRegExp, type, lang = game.i18n.lang, langFallback = true, showLoading = false } = {}) {
    let progressBar = false
    let progressCurrent = 0
    let progressMax = (1 + game.packs.size) * 2 // Guess at how far bar goes
    if (showLoading) {
      progressBar = BRPID.#newProgressBar()
    }
    let candidates = await this.#getDataFromScopes({ brpidRegExp, type, lang, langFallback, progressBar, progressCurrent, progressMax })
    if (langFallback && lang !== 'en') {
      candidates = BRPID.#filterByLanguage(candidates, lang)
    }
    candidates.sort(BRPID.#compareBRPIDPrio)
    const ids = {}
    for (const candidate of candidates) {
      if (!Object.prototype.hasOwnProperty.call(ids, candidate.flags.brp.brpidFlag.id)) {
        ids[candidate.flags.brp.brpidFlag.id] = candidate
      }
    }
    const candidateIds = Object.values(ids)
    progressCurrent = candidateIds.length
    progressMax = progressCurrent * 2 // readjust max to give to leave progress at 50%
    const results = await BRPID.#onlyDocuments(candidateIds, progressBar, progressCurrent, progressMax)
    BRPID.#setProgressBar(progressBar, 1, 1)
    return results
  }

  /**
   * Gets only the highest priority document for BRPID that matches the language,
   * with the highest priority documents in the World taking precedence over
   * any documents
   * in compendium packs.
   * @param brpid string BRPID
   * @param lang the language to match against ("en", "es", ...)
   * @param langFallback should the system fall back to en incase there is no translation
   */
  static fromBRPID (brpid, lang = game.i18n.lang, langFallback = true) {
    return BRPID.fromBRPIDBest({ brpid, lang, langFallback })
  }

  /**
   * Gets only the highest priority document for BRPID that matches the language
   * @param brpid string BRPID
   * @param lang the language to match against ("en", "es", ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   */
  static fromBRPIDBest ({ brpid, lang = game.i18n.lang, langFallback = true, showLoading = false } = {}) {
    if (!brpid || typeof brpid !== 'string') {
      return []
    }
    const type = brpid.split('.')[0]
    const brpidRegExp = new RegExp('^' + BRPUtilities.quoteRegExp(brpid) + '$')
    return BRPID.fromBRPIDRegexBest({ brpidRegExp, type, lang, langFallback, showLoading })
  }

  /**
   * Returns all documents or indexes with an BRPID matching the regex and matching the document type and language.
   * Empty array return for no matches
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ('en', 'es', ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param progressBar If true show v12 progress bar, if not false show v13 progress bar
   * @param progressCurrent Current Progress
   * @param progressMax Max Progress
   * @param scope defines where it will look:
   * **all**: find in both world & compendia,
   * **world**: only search in world,
   * **compendiums**: only search in compendiums
   * @returns array
   */
  static async #getDataFromScopes ({ brpidRegExp, type, lang, langFallback, progressBar, progressCurrent, progressMax, scope = 'all' } = {}) {
    if (!brpidRegExp) {
      return []
    }

    let results = []
    if (['all', 'world'].includes(scope)) {
      results = results.concat(await BRPID.#docsFromWorld({ brpidRegExp, type, lang, langFallback, progressBar, progressCurrent: 0, progressMax }))
    }
    if (['all', 'compendiums'].includes(scope)) {
      results = results.concat(await BRPID.#indexesFromCompendia({ brpidRegExp, type, lang, langFallback, progressBar, progressCurrent: 1, progressMax }))
    }

    return results
  }

 /**
   * Get a list of all documents matching the BRPID regex and language from the world.
   * The document list is sorted with the highest priority first.
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ('en', 'es', ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param progressBar If true show v12 progress bar, if not false show v13 progress bar
   * @param progressCurrent Current Progress
   * @param progressMax Max Progress
   * @returns array
   */
  static async #docsFromWorld ({ brpidRegExp, type, lang, langFallback, progressBar, progressCurrent, progressMax } = {}) {
    if (!brpidRegExp) {
      return []
    }
    if (lang === '') {
      lang = game.i18n.lang
    }

    const gameProperty = BRPID.getGameProperty(`${type}..`)

    const candidateDocuments = game[gameProperty]?.filter((d) => {
      const brpidFlag = d.getFlag('brp', 'brpidFlag')
      if (typeof brpidFlag === 'undefined') {
        return false
      }
      return brpidRegExp.test(brpidFlag.id) && [lang, (langFallback ? 'en' : '-')].includes(brpidFlag.lang)
    })

    progressCurrent++
    BRPID.#setProgressBar(progressBar, progressCurrent, progressMax)

    if (candidateDocuments === undefined) {
      return []
    }

    return candidateDocuments
  }

  /**
   * Get a list of all indexes matching the BRPID regex and language from the compendiums.
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ('en', 'es', ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param progressBar If true show v12 progress bar, if not false show v13 progress bar
   * @param progressCurrent Current Progress
   * @param progressMax Max Progress
   * @returns array
   */
  static async #indexesFromCompendia ({ brpidRegExp, type, lang, langFallback, progressBar, progressCurrent, progressMax }) {
    if (!brpidRegExp) {
      return []
    }
    if (lang === '') {
      lang = game.i18n.lang
    }

    const documentType = BRPID.getDocumentType(type).name
    let indexDocuments = []

    for (const pack of game.packs) {
      if (pack.documentName === documentType) {
        if (!pack.indexed) {
          await pack.getIndex()
        }
        indexDocuments = indexDocuments.concat(pack.index.filter((i) => {
          if (typeof i.flags?.brp?.brpidFlag?.id !== 'string') {
            return false
          }
          return brpidRegExp.test(i.flags.brp.brpidFlag.id) && [lang, (langFallback ? 'en' : '-')].includes(i.flags.brp.brpidFlag.lang)
        }))
      }
      progressCurrent++
      BRPID.#setProgressBar(progressBar, progressCurrent, progressMax)
    }
    return indexDocuments
  }

  /**
   * Sort a list of document on BRPID priority - the highest first.
   * @example
   * aListOfDocuments.sort(BRPID.compareBRPIDPrio)
   */
  static #compareBRPIDPrio (a, b) {
    const ap = parseInt(a.flags.brp.brpidFlag.priority, 10)
    const bp = parseInt(b.flags.brp.brpidFlag.priority, 10)
    if (ap === bp) {
      const ao = a instanceof foundry.abstract.DataModel
      const bo = b instanceof foundry.abstract.DataModel
      if (ao === bo) {
        return 0
      } else {
        return (ao ? -1 : 1)
      }
    }
    return bp - ap
  }

  /**
   * Translates the first part of a BRPID to what those documents are called in the `game` object.
   * @param brpid a single brpid
   */
  static getGameProperty (brpid) {
    const type = brpid.split('.')[0]
    const gameProperty = BRPID.gamePropertyLookup[type]
    if (!gameProperty) {
      ui.notifications.warn(game.i18n.format('BRP.BRPIDFlag.error.incorrect.type'))
      console.log('brp | ', brpid)
      throw new Error()
    }
    return gameProperty
  }

  static get gamePropertyLookup () {
    return {
      a: 'actors',
      c: 'cards',
      i: 'items',
      je: 'journal',
      m: 'macros',
      p: 'playlists',
      rt: 'tables',
      s: 'scenes'
    }
  }

  /**
   * Translates the first part of a BRPID to what those documents are called in the `game` object.
   * @param brpid a single brpid
   */
  static getDocumentType (brpid) {
    const type = brpid.split('.')[0]
    const documentType = BRPID.documentNameLookup[type]
    if (!documentType) {
      ui.notifications.warn(game.i18n.format('BRP.BRPIDFlag.error.incorrect.type'))
      console.log('brp | ', brpid)
      throw new Error()
    }
    return documentType
  }

  static get documentNameLookup () {
    return {
      a: Actor,
      c: Card,
      i: Item,
      je: JournalEntry,
      m: Macro,
      p: Playlist,
      rt: RollTable,
      s: Scene
    }
  }

  /**
   * Replace indexes with their documents
   */
  static async #onlyDocuments (candidates, progressBar, progressCurrent, progressMax) {
    const len = candidates.length
    if (len > 0) {
      for (const offset in candidates) {
        if (!(candidates[offset] instanceof foundry.abstract.DataModel)) {
          candidates[offset] = await fromUuid(candidates[offset].uuid)
        }
        progressCurrent++
        BRPID.#setProgressBar(progressBar, progressCurrent, progressMax)
      }
    }
    return candidates
  }

  /**
   * Filter an array of index or documents.
   * If a BRPID has a version lang then remove the en versions
   */
  static #filterByLanguage (indexes, lang) {
    const ids = indexes.reduce((c, i) => {
      c[i.flags.brp.brpidFlag.id] = c[i.flags.brp.brpidFlag.id] || i.flags.brp.brpidFlag.lang === lang
      return c
    }, {})
    return indexes.filter(i => i.flags.brp.brpidFlag.lang !== 'en' || !ids[i.flags.brp.brpidFlag.id])
  }

}
