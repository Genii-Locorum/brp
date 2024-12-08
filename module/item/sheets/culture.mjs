import { BRPUtilities } from '../../apps/utilities.mjs'
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPCultureSheet extends ItemSheet {

  //Add BRPID buttons to sheet
  _getHeaderButtons () {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  static get defaultOptions () {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'culture'],
      template: 'systems/brp/templates/item/culture.html',
      width: 525,
      height: 550,
      dragDrop: [{ dragSelector: '.item' }],
      scrollY: ['.tab.description'],
      tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'details'}]
    })
  }

  async getData () {
    const sheetData = super.getData()
    sheetData.isGM = game.user.isGM
    const itemData = sheetData.item
    const perSkill = [];
    const grpSkill = [];
    for (let skill of itemData.system.skills){
      let tempSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:skill.brpid}))[0]
      if (tempSkill) {
        perSkill.push({uuid: skill.uuid, brpid: skill.brpid, name: tempSkill.name, category: tempSkill.system.category, variable: tempSkill.system.variable, base: tempSkill.system.base, group: tempSkill.system.group, bonus: skill.bonus})
      } else {
        perSkill.push({uuid: skill.uuid, brpid: skill.brpid, name: game.i18n.localize("BRP.invalid"), category: "", variable: "", base: "", group: "",bonus: 0})
      }  
    }

    for (let index = 0; index < this.item.system.groups.length; index++) {
      for (let skill of this.item.system.groups[index].skills) {
        let tempSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:skill.brpid}))[0]
        if (tempSkill) {
          grpSkill.push({uuid: skill.uuid, brpid: skill.brpid, name: tempSkill.name, category: tempSkill.system.category, variable: tempSkill.system.variable, base: tempSkill.system.base, group: tempSkill.system.group, index: index, bonus: skill.bonus})
        } else {
          grpSkill.push({uuid: skill.uuid, brpid: skill.brpid, name: game.i18n.localize("BRP.invalid"), category: "", variable: "", base: "", group: "", index:index, bonus: 0})
        }  
      }
    }

    for (let [key, stat] of Object.entries(this.item.system.stats)) {
      stat.label = game.i18n.localize(CONFIG.BRP.statsAbbreviations[key]) ?? key;
      if (['str','int','pow','cha'].includes(key)) {
        stat.newrow = true
      } else {
        stat.newrow = false
      }
    }


    sheetData.perSkill = perSkill.sort(BRPUtilities.sortByNameKey);
    sheetData.grpSkill = grpSkill.sort(BRPUtilities.sortByNameKey);

    sheetData.enrichedDescriptionValue = await TextEditor.enrichHTML(
      sheetData.data.system.description,
      {
        async: true,
        secrets: sheetData.editable
      }
    )  
    
    sheetData.enrichedGMDescriptionValue = await TextEditor.enrichHTML(
      sheetData.data.system.gmDescription,
      {
        async: true,
        secrets: sheetData.editable
      }
    )  
    
    return sheetData
  }

  activateListeners (html) {
    super.activateListeners(html)
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
    html.find('.item-delete').click(event => this._onItemDelete(event, 'skills'))
    html.find('.item-view').click(this._onItemView.bind(this))
    html.find('.group-item-delete').click(this._onGroupItemDelete.bind(this))
    html.find('.group-control').click(this._onGroupControl.bind(this))
    const dragDrop = new DragDrop({
      dropSelector: '.droppable',
      callbacks: { drop: this._onDrop.bind(this) }
    })
    dragDrop.bind(html[0])
  }

  //Allow for a skill being dragged and dropped on to the peronality sheet either in the main skill list or an Optional Group
  async _onDrop (event, type = 'skill', collectionName = 'skills') {
    event.preventDefault()
    event.stopPropagation()
    
    const optionalSkill = event?.currentTarget?.classList?.contains('optional-skills')
    const ol = event?.currentTarget?.closest('ol')
    const index = ol?.dataset?.group
    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
    const groups = this.item.system.groups ? foundry.utils.duplicate(this.item.system.groups) : []
    let cultureBonus = 0



    for (const item of dataList) {
      if (!item || !item.system) {continue}
      if (![type].includes(item.type)) {continue}

      //If dropping in Optional Skill Group
      if (optionalSkill) {
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization can be included many times
          if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
            continue // If skill is already in main don't add it
          }
          if (groups[index].skills.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
            continue // If skill is already in this group don't add it (doesn't stop skill being added to different groups)
          }
        }
        let usage = await this.enterValue('culture','test')
        if (usage) {
          cultureBonus = Number(usage.get('myValue'));
        }
        //If culture bonus = 0 then don't drop the item
        if (cultureBonus === 0) {continue}
        groups[index].skills = groups[index].skills.concat({uuid:item.uuid, brpid:item.flags.brp.brpidFlag.id, bonus:cultureBonus})
      } else {
        //Dropping in Main Skill list
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization and group skill can be included many times, otherwise check skill name doesnt exist in the list.
          if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
            continue
          }
   
          for (let i = 0; i < groups.length; i++) {
            // If the same skill is in one of the group remove it from the groups
            const index = groups[i].skills.findIndex(
              el => el.brpid === item.flags.brp.brpidFlag.id
            )
            if (index !== -1) {
              groups[i].skills.splice(index, 1)
            }
          }
        }
        let usage = await this.enterValue('culture','test')
        if (usage) {
          cultureBonus = Number(usage.get('myValue'));
        }
        //If culture bonus = 0 then don't drop the item
        if (cultureBonus === 0) {continue}
        collection.push({uuid:item.uuid, brpid:item.flags.brp.brpidFlag.id, bonus:cultureBonus})
      }
    }
    await this.item.update({ 'system.groups': groups })
    await this.item.update({ [`system.${collectionName}`]: collection })
  }

  //Controls to add/delete Optional Skill Groups
  async _onGroupControl (event) {
    event.preventDefault()
    const a = event.currentTarget
    
    // Add a new Optional Skill Group
    if (a.classList.contains('add-group')) {
      await this._onSubmit(event) // Submit any unsaved changes
      const groups = this.item.system.groups
      await this.item.update({
        'system.groups': groups.concat([{ options: 1, skills: [] }])
      })
    }
    
    //Delete an Optional Skill Group
    if (a.classList.contains('remove-group')) {
      await this._onSubmit(event) // Submit any unsaved changes
      const groups = foundry.utils.duplicate(this.item.system.groups)
      const ol = a.closest('.item-list.group')
      groups.splice(Number(ol.dataset.group), 1)
      await this.item.update({ 'system.groups': groups })
    }
  }
    
  //Delete's a skill in the main skill list      
  async _onItemDelete (event, collectionName = 'items') {
    const item = $(event.currentTarget).closest('.item')
    const itemId = item.data('item-id')
    const itemIndex = this.item.system[collectionName].findIndex(i => (itemId && i.uuid === itemId))
    if (itemIndex > -1) {
      const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
      collection.splice(itemIndex, 1)
      await this.item.update({ [`system.${collectionName}`]: collection })
    }
  }

  //Delete's a skill in an Optional Skill Group
  async _onGroupItemDelete (event) {
    const item = $(event.currentTarget).closest('.item')
    const group = Number(item.closest('.item-list.group').data('group'))
    const groups = foundry.utils.duplicate(this.item.system.groups)
    if (typeof groups[group] !== 'undefined') {
      const itemId = item.data('item-id')
      const itemIndex = groups[group].skills.findIndex(i => (itemId && i.uuid === itemId))
      if (itemIndex > -1) {
        groups[group].skills.splice(itemIndex, 1)
        await this.item.update({ 'system.groups': groups })
      }
    }
  }
    
  _updateObject (event, formData) {
    const system = foundry.utils.expandObject(formData)?.system
    if(typeof system !='undefined') {
      if (system.groups) {
        formData['system.groups'] = Object.values(
          system.groups || []
        )
        for (let index = 0; index < this.item.system.groups.length; index++) {
          formData[`system.groups.${index}.skills`] = foundry.utils.duplicate(
            this.item.system.groups[index].skills
          )
        }
      }
    }
    super._updateObject(event, formData)
  }

  async _onItemView (event) {
    const item = $(event.currentTarget).closest('.item')
    const brpid = item.data('brpid')
    let tempItem = (await game.system.api.brpid.fromBRPIDBest({brpid:brpid}))[0]
    if (tempItem) {tempItem.sheet.render(true)};
  }  


  // Form to get a single value - for bonuses on culture
  async enterValue (type,name) {
    let title = ""
    if (type === 'culture') {
      title = game.i18n.localize('BRP.cultureBonus') +": "+name;
    } 
    const html = await renderTemplate(
      'systems/brp/templates/dialog/getValue.html',
      {type,
      }
    )
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: title,
        content: html,
        buttons: {
          validate: {
            label: game.i18n.localize('BRP.confirm'),
            callback: html => {
              formData = new FormData(
                html[0].querySelector('#get-value-form')
              )
              return resolve(formData)
            }
          }
        },
        default: 'validate',
        close: () => {
          return resolve(false)
        }
      }, {classes: ["brp", "sheet"]})
      dlg.render(true)
    })
  }
}