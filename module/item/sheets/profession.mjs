import { BRPUtilities } from '../../apps/utilities.mjs'
import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPProfessionSheet extends foundry.appv1.sheets.ItemSheet {

  //Turn off App V1 deprecation warnings
  //TODO - move to V2
  static _warnedAppV1 = true

  //Add BRPID buttons to sheet
  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['brp', 'sheet', 'profession'],
      template: 'systems/brp/templates/item/profession.html',
      width: 525,
      height: 520,
      dragDrop: [{ dragSelector: '.item' }],
      scrollY: ['.item-bottom-panel'],
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'skills' }]
    })
  }

  async getData() {
    const sheetData = super.getData()
    const itemData = sheetData.item
    sheetData.isGM = game.user.isGM
    sheetData.minWealthOptions = await BRPSelectLists.getWealthOptions(0, 4)
    sheetData.maxWealthOptions = await BRPSelectLists.getWealthOptions(itemData.system.minWealth, 4)
    sheetData.minWealth = game.i18n.localize("BRP.wealthLevel." + this.item.system.minWealth)
    sheetData.maxWealth = game.i18n.localize("BRP.wealthLevel." + this.item.system.maxWealth)
    const perSkill = [];
    const grpSkill = [];
    const perPower = [];
    for (let skill of itemData.system.skills) {
      let tempSkill = (await game.system.api.brpid.fromBRPIDBest({ brpid: skill.brpid }))[0]
      if (tempSkill) {
        perSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: tempSkill.name, category: tempSkill.system.category, variable: tempSkill.system.variable, base: tempSkill.system.base, group: tempSkill.system.group })
      } else {
        perSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: game.i18n.localize("BRP.invalid"), category: "", variable: "", base: "", group: "" })
      }
    }

    for (let index = 0; index < this.item.system.groups.length; index++) {
      for (let skill of this.item.system.groups[index].skills) {
        let tempSkill = (await game.system.api.brpid.fromBRPIDBest({ brpid: skill.brpid }))[0]
        if (tempSkill) {
          grpSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: tempSkill.name, category: tempSkill.system.category, variable: tempSkill.system.variable, base: tempSkill.system.base, group: tempSkill.system.group, index: index })
        } else {
          grpSkill.push({ uuid: skill.uuid, brpid: skill.brpid, name: game.i18n.localize("BRP.invalid"), category: "", variable: "", base: "", group: "", index: index })
        }
      }
    }


    for (let power of this.item.system.powers) {
      let tempPower = (await game.system.api.brpid.fromBRPIDBest({ brpid: power.brpid }))[0]
      if (tempPower) {
        perPower.push({ uuid: power.uuid, brpid: power.brpid, name: tempPower.name })
      } else {
        perPower.push({ uuid: power.uuid, brpid: power.brpid, name: game.i18n.localize("BRP.invalid") })
      }
    }

    sheetData.perSkill = perSkill.sort(BRPUtilities.sortByNameKey);
    sheetData.grpSkill = grpSkill.sort(BRPUtilities.sortByNameKey);
    sheetData.perPower = perPower.sort(BRPUtilities.sortByNameKey);

    sheetData.enrichedDescriptionValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      sheetData.data.system.description,
      {
        async: true,
        secrets: sheetData.editable
      }
    )

    sheetData.enrichedGMDescriptionValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      sheetData.data.system.gmDescription,
      {
        async: true,
        secrets: sheetData.editable
      }
    )

    return sheetData
  }

  activateListeners(html) {
    super.activateListeners(html)
    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return
    html.find('.item-delete').click(event => this._onItemDelete(event, 'skills'))
    html.find('.item-view').click(this._onItemView.bind(this))
    html.find('.item-power-delete').click(event => this._onItemDelete(event, 'powers'))
    html.find('.group-item-delete').click(this._onGroupItemDelete.bind(this))
    html.find('.group-control').click(this._onGroupControl.bind(this))
    const dragDrop = new foundry.applications.ux.DragDrop.implementation({
      dropSelector: '.droppable',
      callbacks: { drop: this._onDrop.bind(this) }
    })
    dragDrop.bind(html[0])
  }

  //Allow for a skill being dragged and dropped on to the profession sheet either in the main skill list or an Optional Group
  async _onDrop(event, type = 'skill', collectionName = 'skills') {
    event.preventDefault()
    event.stopPropagation()

    const optionalSkill = event?.currentTarget?.classList?.contains('optional-skills')
    const mainPowers = event?.currentTarget?.classList?.contains('main-powers')
    if (mainPowers) {
      type = 'power';
      collectionName = 'powers';
    }
    const ol = event?.currentTarget?.closest('ol')
    const index = ol?.dataset?.group
    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []
    const groups = this.item.system.groups ? foundry.utils.duplicate(this.item.system.groups) : []

    for (const item of dataList) {
      if (!item || !item.system) continue
      if (![type].includes(item.type)) {
        continue
      }

      //If dropping in Optional Skill Group
      if (optionalSkill) {
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization can be included many times
          if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
            continue // If skill is already in main don't add it
          }
          if (groups[index].skills.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
            continue // If skill is already in this group don't add it (doesn't stop skill being added to different groups)
          }
        }

        groups[index].skills = groups[index].skills.concat({ uuid: item.uuid, brpid: item.flags.brp.brpidFlag.id })

      } else if (mainPowers) {
        //Dropping in Main Powers list
        if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
          ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
          continue
        }
        collection.push({ uuid: item.uuid, brpid: item.flags.brp.brpidFlag.id })
      } else {
        //Dropping in Main Skill list
        if ((item.system.specialism && item.system.chosen) || (!item.system.specialism && !item.system.group)) {
          // Generic specialization and groups can be included many times
          if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
            ui.notifications.warn(item.name + " : " + game.i18n.localize('BRP.dupItem'));
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
        collection.push({ uuid: item.uuid, brpid: item.flags.brp.brpidFlag.id })
      }
    }
    await this.item.update({ 'system.groups': groups })
    await this.item.update({ [`system.${collectionName}`]: collection })
  }

  //Controls to add/delete Optional Skill Groups
  async _onGroupControl(event) {
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
  async _onItemDelete(event, collectionName = 'items') {
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
  async _onGroupItemDelete(event) {
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

  _updateObject(event, formData) {
    const system = foundry.utils.expandObject(formData)?.system
    if (typeof system != 'undefined') {
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

  async _onItemView(event) {
    const item = $(event.currentTarget).closest('.item')
    const brpid = item.data('brpid')
    let tempItem = (await game.system.api.brpid.fromBRPIDBest({ brpid: brpid }))[0]
    if (tempItem) { tempItem.sheet.render(true) };
  }

}
