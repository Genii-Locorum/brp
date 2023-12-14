import { BRPUtilities } from '../../apps/utilities.mjs'
import { BRPSelectLists } from "../../apps/select-lists.mjs";

export class BRPProfessionSheet extends ItemSheet {

  static get defaultOptions () {
    return mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'profession'],
      template: 'systems/brp/templates/item/profession.html',
      width: 525,
      height: 520,
      dragDrop: [{ dragSelector: '.item' }],
      scrollY: ['.item-bottom-panel'],
      tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'skills'}]
    })
  }

  async getData () {
    const sheetData = super.getData()
    const itemData = sheetData.item
    sheetData.isGM = game.user.isGM
    sheetData.minWealthOptions = await BRPSelectLists.getWealthOptions(0,4)
    sheetData.maxWealthOptions = await BRPSelectLists.getWealthOptions(itemData.system.minWealth,4)
    sheetData.minWealth =game.i18n.localize("BRP.wealthLevel." + this.item.system.minWealth)
    sheetData.maxWealth =game.i18n.localize("BRP.wealthLevel." + this.item.system.maxWealth)
    const perSkill = [];
    const grpSkill = [];
    const perPower = [];
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

    for (let i of itemData.system.powers){
      const j = game.items.get(i)
      if(!j) {
        perPower.push({name : game.i18n.localize("BRP.invalid"), _id: i})
      } else {
        perPower.push(j);
      }
    }

    // Sort Skills
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

    // Sort Skills
    perPower.sort(function(a, b){
      let x = a.name;
      let y = b.name;
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });

    sheetData.perSkill = perSkill;
    sheetData.grpSkill = grpSkill;
    sheetData.perPower = perPower;
    return sheetData
  }

  activateListeners (html) {
    super.activateListeners(html)
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
    html.find('.item-delete').click(event => this._onItemDelete(event, 'skills'))
    html.find('.item-power-delete').click(event => this._onItemDelete(event, 'powers'))
    html.find('.group-item-delete').click(this._onGroupItemDelete.bind(this))
    html.find('.group-control').click(this._onGroupControl.bind(this))
    const dragDrop = new DragDrop({
      dropSelector: '.droppable',
      callbacks: { drop: this._onDrop.bind(this) }
    })
    dragDrop.bind(html[0])
  }

  //Allow for a skill being dragged and dropped on to the profession sheet either in the main skill list or an Optional Group
  async _onDrop (event, type = 'skill', collectionName = 'skills') {
    event.preventDefault()
    event.stopPropagation()
    
    const optionalSkill = event?.currentTarget?.classList?.contains('optional-skills')
    const mainPowers = event?.currentTarget?.classList?.contains('main-powers')
    if (mainPowers) {
      type='power';
      collectionName = 'powers';
    }
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
    
        groups[index].skills = groups[index].skills.concat(item._id)

      } else if(mainPowers){
        //Dropping in Main Powers list
          if (collection.find(el => el === item._id)) {
            ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
            continue
          }
        collection.push(item._id)
      } else {
        //Dropping in Main Skill list
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization and groups can be included many times
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