import { BRPUtilities } from '../apps/utilities.mjs'

export class BRPID {
  static init() {
    CONFIG.Actor.compendiumIndexFields.push('flags.brp.brpidFlag')
    CONFIG.Item.compendiumIndexFields.push('flags.brp.brpidFlag')
    CONFIG.JournalEntry.compendiumIndexFields.push('flags.brp.brpidFlag')
    CONFIG.RollTable.compendiumIndexFields.push('flags.brp.brpidFlag')
    game.system.api = {
      brpid: BRPID
    }
  }


  /**
   * Returns RegExp for valid type and format
   * @returns RegExp
   */
  static regExKey() {
    return new RegExp('^(' + Object.keys(BRPID.gamePropertyLookup).join('|') + ')\\.(.*?)\\.(.+)$')
  }

  /**
   * Get BRPID type.subtype. based on document
   * @param document
   * @returns string
   */
  static getPrefix(document) {
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
  static guessId(document) {
    return BRPID.getPrefix(document) + BRPUtilities.toKebabCase(document.name)
  }

  /**
   * Get BRPID type.subtype.partial-name(-removed)
   * @param key
   * @returns string
   */
  static guessGroupFromKey(id) {
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
  static guessGroupFromDocument(document) {
    return BRPID.guessGroupFromKey(document.flags?.brp?.brpidFlag?.id)
  }

  /**
   * Returns all items with matching BRPIDs, and language
   * ui.notifications.warn for missing keys
   * @param itemList array of BRPIDs
   * @param lang the language to match against ('en', 'es', ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   * @returns array
   */
  static async expandItemArray({ itemList, lang = game.i18n.lang, langFallback = true, showLoading = false } = {}) {
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
        ui.notifications.warn(game.i18n.format('BRP.BRPIDFlag.error.documents-not-found', { brpids: brpids.filter(x => !notmissing.includes(x)).join(', '), lang }))
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
  static findBRPIdInList(brpid, list) {
    let itemName = ''
    const BRPIDKeys = foundry.utils.flattenObject(game.i18n.translations.BRP.BRPIDFlag.keys)
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
  static makeGroupRegEx(brpids) {
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
   * Returns all documents with a BRPID matching the regex and matching the document type
   * and language, from the specified scope.
   * Empty array return for no matches
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ('en', 'es', ...)
   * @param scope defines where it will look:
   * **match** same logic as fromBRPID function,
   * **all**: find in both world & compendia,
   * **world**: only search in world,
   * **compendiums**: only search in compendiums
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   * @returns array
   */
  static async fromBRPIDRegexAll({ brpidRegExp, type, lang = game.i18n.lang, scope = 'match', langFallback = true, showLoading = false } = {}) {
    if (!brpidRegExp) {
      return []
    }
    const result = []

    let count = 0
    if (showLoading) {
      if (['match', 'all', 'world'].includes(scope)) {
        count++
      }
      if (['match', 'all', 'compendiums'].includes(scope)) {
        count = count + game.packs.size
      }
    }

    if (['match', 'all', 'world'].includes(scope)) {
      const worldDocuments = await BRPID.documentsFromWorld({ brpidRegExp, type, lang, langFallback, progressBar: count })
      if (scope === 'match' && worldDocuments.length) {
        if (showLoading) {
          SceneNavigation.displayProgressBar({ label: game.i18n.localize('SETUP.PackagesLoading'), pct: 100 })
        }
        return this.filterAllBRPID(worldDocuments, langFallback && lang !== 'en')
      }
      result.splice(0, 0, ...worldDocuments)
    }

    if (['match', 'all', 'compendiums'].includes(scope)) {
      const compendiaDocuments = await BRPID.documentsFromCompendia({ brpidRegExp, type, lang, langFallback, progressBar: count })
      result.splice(result.length, 0, ...compendiaDocuments)
    }

    if (showLoading) {
      SceneNavigation.displayProgressBar({ label: game.i18n.localize('SETUP.PackagesLoading'), pct: 100 })
    }

    return this.filterAllBRPID(result, langFallback && lang !== 'en')
  }

  /**
   * Returns all documents with a BRPID, and language.
   * Empty array return for no matches
   * @param brpid a single brpid
   * @param lang the language to match against ('en', 'es', ...)
   * @param scope defines where it will look:
   * **match** same logic as fromBRPID function,
   * **all**: find in both world & compendia,
   * **world**: only search in world,
   * **compendiums**: only search in compendiums
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   * @returns array
   */
  static async fromBRPIDAll({ brpid, lang = game.i18n.lang, scope = 'match', langFallback = true, showLoading = false } = {}) {
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
    return BRPID.fromBRPIDRegexAll({ brpidRegExp: new RegExp('^' + BRPUtilities.quoteRegExp(brpid) + '$'), type: parts[1], lang, scope, langFallback, showLoading })
  }

  /**
   * Gets only the highest priority documents for each BRPID that matches the RegExp and
   * language, with the highest priority documents in the World taking precedence over
   * any documents in compendium packs.
   * Empty array return for no matches
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ("en", "es", ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   */
  static async fromBRPIDRegexBest({ brpidRegExp, type, lang = game.i18n.lang, langFallback = true, showLoading = false } = {}) {
    const allDocuments = await this.fromBRPIDRegexAll({ brpidRegExp, type, lang, scope: 'all', langFallback, showLoading })
    const bestDocuments = this.filterBestBRPID(allDocuments)
    return bestDocuments
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
  static fromBRPID(brpid, lang = game.i18n.lang, langFallback = true) {
    return BRPID.fromBRPIDBest({ brpid, lang, langFallback })
  }

  /**
   * Gets only the highest priority document for BRPID that matches the language,
   * with the highest priority documents in the World taking precedence over
   * any documents
   * in compendium packs.
   * @param brpid string BRPID
   * @param lang the language to match against ("en", "es", ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param showLoading Show loading bar
   */
  static fromBRPIDBest({ brpid, lang = game.i18n.lang, langFallback = true, showLoading = false } = {}) {
    if (!brpid || typeof brpid !== 'string') {
      return []
    }
    const type = brpid.split('.')[0]
    const brpidRegExp = new RegExp('^' + BRPUtilities.quoteRegExp(brpid) + '$')
    return BRPID.fromBRPIDRegexBest({ brpidRegExp, type, lang, langFallback, showLoading })
  }

  /**
   * For an array of documents already processed by filterAllBRPID, returns only those that are the "best" version of their BRPID
   * @param documents
   * @returns
   */
  static filterBestBRPID(documents) {
    const bestMatchDocuments = new Map()
    for (const doc of documents) {
      const docBRPID = doc.getFlag('brp', 'brpidFlag')?.id
      if (docBRPID) {
        const currentDoc = bestMatchDocuments.get(docBRPID)
        if (typeof currentDoc === 'undefined') {
          bestMatchDocuments.set(docBRPID, doc)
          continue
        }

        // Prefer pack === '' if possible
        const docPack = (doc.pack ?? '')
        const existingPack = (currentDoc?.pack ?? '')
        const preferWorld = docPack === '' || existingPack !== ''
        if (!preferWorld) {
          continue
        }

        // Prefer highest priority
        let docPriority = parseInt(doc.getFlag('brp', 'brpidFlag')?.priority ?? Number.MIN_SAFE_INTEGER, 10)
        docPriority = isNaN(docPriority) ? Number.MIN_SAFE_INTEGER : docPriority
        let existingPriority = parseInt(currentDoc.getFlag('brp', 'brpidFlag')?.priority ?? Number.MIN_SAFE_INTEGER, 10)
        existingPriority = isNaN(existingPriority) ? Number.MIN_SAFE_INTEGER : existingPriority
        const preferPriority = docPriority >= existingPriority
        if (!preferPriority) {
          continue
        }

        bestMatchDocuments.set(docBRPID, doc)
      }
    }
    return [...bestMatchDocuments.values()]
  }

  /**
   * For an array of documents, returns filter out en documents if a translated one exists
   * @param documents
   * @param langFallback should the system fall back to en in case there is no translation
   * @returns
   */
  static filterAllBRPID(documents, langFallback) {
    if (!langFallback) {
      return documents
    }
    const bestMatchDocuments = new Map()
    for (const doc of documents) {
      const docBRPID = doc.getFlag('brp', 'brpidFlag')?.id
      if (docBRPID) {
        let docPriority = parseInt(doc.getFlag('brp', 'brpidFlag')?.priority ?? Number.MIN_SAFE_INTEGER, 10)
        docPriority = isNaN(docPriority) ? Number.MIN_SAFE_INTEGER : docPriority
        const key = docBRPID + '/' + (isNaN(docPriority) ? Number.MIN_SAFE_INTEGER : docPriority)

        const currentDoc = bestMatchDocuments.get(key)
        if (typeof currentDoc === 'undefined') {
          bestMatchDocuments.set(key, doc)
          continue
        }

        const docLang = doc.getFlag('brp', 'brpidFlag')?.lang ?? 'en'
        const existingLang = currentDoc?.getFlag('brp', 'brpidFlag')?.lang ?? 'en'
        if (existingLang === 'en' && existingLang !== docLang) {
          bestMatchDocuments.set(key, doc)
        }
      }
    }
    return [...bestMatchDocuments.values()]
  }

  /**
   * Get a list of all documents matching the BRPID regex, and language.
   * The document list is sorted with the highest priority first.
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ('en', 'es', ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param progressBar If greater than zero show percentage
   * @returns array
   */
  static async documentsFromWorld({ brpidRegExp, type, lang = game.i18n.lang, langFallback = true, progressBar = 0 } = {}) {
    if (!brpidRegExp) {
      return []
    }
    if (lang === '') {
      lang = game.i18n.lang
    }

    if (progressBar > 0) {
      SceneNavigation.displayProgressBar({ label: game.i18n.localize('SETUP.PackagesLoading'), pct: Math.floor(100 / progressBar) })
    }

    const gameProperty = BRPID.getGameProperty(`${type}..`)

    const candidateDocuments = game[gameProperty]?.filter((d) => {
      const brpidFlag = d.getFlag('brp', 'brpidFlag')
      if (typeof brpidFlag === 'undefined') {
        return false
      }
      return brpidRegExp.test(brpidFlag.id) && [lang, (langFallback ? 'en' : '-')].includes(brpidFlag.lang)
    })

    if (candidateDocuments === undefined) {
      return []
    }

    return candidateDocuments.sort(BRPID.compareBRPIDPrio)
  }

  /**
   * Get a list of all documents matching the BRPID regex, and language from the compendiums.
   * The document list is sorted with the highest priority first.
   * @param brpidRegExp regex used on the BRPID
   * @param type the first part of the wanted BRPID, for example 'i', 'a', 'je'
   * @param lang the language to match against ('en', 'es', ...)
   * @param langFallback should the system fall back to en incase there is no translation
   * @param progressBar If greater than zero show percentage
   * @returns array
   */
  static async documentsFromCompendia({ brpidRegExp, type, lang = game.i18n.lang, langFallback = true, progressBar = 0 }) {
    if (!brpidRegExp) {
      return []
    }
    if (lang === '') {
      lang = game.i18n.lang
    }

    const documentType = BRPID.getDocumentType(type).name
    const candidateDocuments = []

    let count = 1
    for (const pack of game.packs) {
      if (progressBar > 0) {
        SceneNavigation.displayProgressBar({ label: game.i18n.localize('SETUP.PackagesLoading'), pct: Math.floor(count * 100 / progressBar) })
        count++
      }
      if (pack.documentName === documentType) {
        if (!pack.indexed) {
          await pack.getIndex()
        }
        const indexInstances = pack.index.filter((i) => {
          const brpidFlag = i.flags?.brp?.brpidFlag
          if (typeof brpidFlag === 'undefined') {
            return false
          }
          return brpidRegExp.test(brpidFlag.id) && [lang, (langFallback ? 'en' : '-')].includes(brpidFlag.lang)
        })
        for (const index of indexInstances) {
          const document = await pack.getDocument(index._id)
          if (!document) {
            const msg = game.i18n.format('BRP.BRPIDFlag.error.document-not-found', {
              brpid: brpidRegExp,
              lang,
            })
            ui.notifications.error(msg)
            console.log('brp |', msg, index)
            throw new Error()
          } else {
            candidateDocuments.push(document)
          }
        }
      }
    }
    return candidateDocuments.sort(BRPID.compareBRPIDPrio)
  }

  /**
   * Sort a list of document on BRPID priority - the highest first.
   * @example
   * aListOfDocuments.sort(BRPID.compareBRPIDPrio)
   */
  static compareBRPIDPrio(a, b) {
    return (
      b.getFlag('brp', 'brpidFlag')?.priority -
      a.getFlag('brp', 'brpidFlag')?.priority
    )
  }

  /**
   * Translates the first part of a BRPID to what those documents are called in the `game` object.
   * @param brpid a single brpid
   */
  static getGameProperty(brpid) {
    const type = brpid.split('.')[0]
    const gameProperty = BRPID.gamePropertyLookup[type]
    if (!gameProperty) {
      ui.notifications.warn(game.i18n.format('BRP.BRPIDFlag.error.incorrect.type'))
      console.log('brp | ', brpid)
      throw new Error()
    }
    return gameProperty
  }

  static get gamePropertyLookup() {
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
  static getDocumentType(brpid) {
    const type = brpid.split('.')[0]
    const documentType = BRPID.documentNameLookup[type]
    if (!documentType) {
      ui.notifications.warn(game.i18n.format('BRP.BRPIDFlag.error.incorrect.type'))
      console.log('brp | ', brpid)
      throw new Error()
    }
    return documentType
  }

  static get documentNameLookup() {
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
}
