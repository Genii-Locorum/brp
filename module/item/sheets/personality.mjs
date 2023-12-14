import { BRPUtilities } from '../../apps/utilities.mjs'

export class BRPPersonalitySheet extends ItemSheet {

  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'personality'],
      template: 'systems/brp/templates/item/personality.html',
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
    for (let i of itemData.system.skills){
      const j = game.items.get(i)
      if(!j) {
        perSkill.push({name : game.i18n.localize("BRP.invalid"), _id: i})
      } else {
        perSkill.push(j);
      }
    }

    for (let index = 0; index < this.item.system.groups.length; index++) {
      for (let k of this.item.system.groups[index].skills) {
        const j = game.items.get(k)
        if(!j) {
          grpSkill.push({system: {index: index}, name : game.i18n.localize("BRP.invalid"), _id: k})
        } else {
        j.system.index = index
        grpSkill.push(j);
        }
      }
    }

    // Sort Skill Names
    perSkill.sort(function(a, b){
      let x = a.name;
      let y = b.name;
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });

    grpSkill.sort(function(a, b){
      let x = a.name;
      let y = b.name;
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });

    sheetData.perSkill = perSkill;
    sheetData.grpSkill = grpSkill;
    return sheetData
  }

  activateListeners (html) {
    super.activateListeners(html)
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
    html.find('.item-delete').click(event => this._onItemDelete(event, 'skills'))
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
    const collection = this.item.system[collectionName] ? duplicate(this.item.system[collectionName]) : []
    const groups = this.item.system.groups ? duplicate(this.item.system.groups) : []
 
    for (const item of dataList) {
      if (!item || !item.system) continue
      if (![type].includes(item.type)) {
        continue
      }

      //If dropping in Optional Skill Group
      if (optionalSkill) {
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization can be included many times
          if (collection.find(el => el === item._id)) {
            ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
            continue // If skill is already in main don't add it
          }
          if (groups[index].skills.find(el => el === item._id)) {
            ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
            continue // If skill is already in this group don't add it (doesn't stop skill being added to different groups)
          }
        }
       
      } else {
        //Dropping in Main Skill list
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization and group skill can be included many times, otherwise check skill name doesnt exist in the list.
          if (collection.find(el => el === item._id)) {
            ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
            continue
          }
   
          for (let i = 0; i < groups.length; i++) {
            // If the same skill is in one of the group remove it from the groups
            const index = groups[i].skills.findIndex(
              el => el === item._id
            )
            if (index !== -1) {
              groups[i].skills.splice(index, 1)
            }
          }
        }
        collection.push(item._id)
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
      const groups = duplicate(this.item.system.groups)
      const ol = a.closest('.item-list.group')
      groups.splice(Number(ol.dataset.group), 1)
      await this.item.update({ 'system.groups': groups })
    }
  }
    
  //Delete's a skill in the main skill list      
  async _onItemDelete (event, collectionName = 'items') {
    const item = $(event.currentTarget).closest('.item')
    const itemId = item.data('item-id')
    const itemIndex = this.item.system[collectionName].findIndex(i => (itemId && i === itemId))
    if (itemIndex > -1) {
      const collection = this.item.system[collectionName] ? duplicate(this.item.system[collectionName]) : []
      collection.splice(itemIndex, 1)
      await this.item.update({ [`system.${collectionName}`]: collection })
    }
  }

  //Delete's a skill in an Optional Skill Group
  async _onGroupItemDelete (event) {
    const item = $(event.currentTarget).closest('.item')
    const group = Number(item.closest('.item-list.group').data('group'))
    const groups = duplicate(this.item.system.groups)
    if (typeof groups[group] !== 'undefined') {
      const itemId = item.data('item-id')
      const itemIndex = groups[group].skills.findIndex(i => (itemId && i === itemId))
      if (itemIndex > -1) {
        groups[group].skills.splice(itemIndex, 1)
        await this.item.update({ 'system.groups': groups })
      }
    }
  }
    
  _updateObject (event, formData) {
    const system = expandObject(formData)?.system
    if(typeof system !='undefined') {
      if (system.groups) {
        formData['system.groups'] = Object.values(
          system.groups || []
        )
        for (let index = 0; index < this.item.system.groups.length; index++) {
          formData[`system.groups.${index}.skills`] = duplicate(
            this.item.system.groups[index].skills
          )
        }
      }
    }
    super._updateObject(event, formData)
  }
}