import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { BRPUtilities } from '../../apps/utilities.mjs'
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPSkillSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }

  //Add BRPID buttons to sheet
  _getHeaderButtons () {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }    

    static get defaultOptions () {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        template: 'systems/brp/templates/item/skill.html',
        width: 520,
        height: 620,
        scrollY: ['.tab.description'],
        tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'details'}]
      })
    }
  
    async getData () {
      const sheetData = super.getData()
      const itemData = sheetData.item
      sheetData.hasOwner = this.item.isEmbedded === true
      sheetData.pcOwner = false
      if (sheetData.hasOwner) {
        if (this.item.parent.type === 'character') {
          sheetData.pcOwner = true
        }
      }      
      sheetData.isGM = game.user.isGM
      //Get drop down options from select-lists.mjs
      sheetData.statOptions = await BRPSelectLists.getStatOptions();
      sheetData.catOptions = await BRPSelectLists.getCategoryOptions();
      sheetData.wpnOptions = await BRPSelectLists.getWpnCategoryOptions();
      sheetData.funcOptions = await BRPSelectLists.getFunctionalOptions();
      sheetData.stat1=game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.baseFormula[1].stat]);
      sheetData.stat2=game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.baseFormula[2].stat]);
      sheetData.catName = game.i18n.localize("BRP." + this.item.system.category.split('.')[2]);
      sheetData.wpnType = game.i18n.localize("BRP." + this.item.system.subType);
      sheetData.funcDisp= game.i18n.localize("BRP." + this.item.system.baseFormula.Func);
      itemData.system.total = itemData.system.base + itemData.system.xp + itemData.system.effects + itemData.system.personality + itemData.system.profession + itemData.system.personal + itemData.system.culture;
      
      //Ensure mainName is populated
      if( this.item.system.mainName ==="" ) {
        this.object.update({'system.mainName': this.item.name});
      }

      const grpSkill = [];
      for (let skill of itemData.system.groupSkills){
        let tempSkill = (await game.system.api.brpid.fromBRPIDBest({brpid:skill.brpid}))[0]
        if (tempSkill) {
          grpSkill.push({uuid: skill.uuid, brpid: skill.brpid, name: tempSkill.name, category: tempSkill.system.category, variable: tempSkill.system.variable, base: tempSkill.system.base, group: tempSkill.system.group})
        } else {
          grpSkill.push({uuid: skill.uuid, brpid: skill.brpid, name: game.i18n.localize("BRP.invalid"), category: "", variable: "", base: "", group: ""})
        }  
      }

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

      return sheetData;
    }
  
    activateListeners (html) {
      super.activateListeners(html)
      // Everything below here is only needed if the sheet is editable
      if (!this.options.editable) return
      html.find('.item-toggle').click(this.onItemToggle.bind(this));
      html.find('.item-view').click(this._onItemView.bind(this))
      html.find('.item-delete').click(event => this._onItemDelete(event, 'groupSkills'))

      const dragDrop = new DragDrop({
        dropSelector: '.droppable',
        callbacks: { drop: this._onDrop.bind(this) }
      })
      dragDrop.bind(html[0])
    }
  
  
  //Handle toggle states
  async onItemToggle(event){
    event.preventDefault();
    const prop=event.currentTarget.closest('.item-toggle').dataset.property;
    let checkProp={};
    if (['noXP', 'specialism', 'variable','group','chosen','basic','combat'].includes(prop)) {
      checkProp = {[`system.${prop}`] : !this.object.system[prop]}
    } else {return }      
    
    const item = await this.object.update(checkProp);
    return item;
  }
 
  //Update object - change skill name to be made up on Main and Specialization name
  async _updateObject (event, formData) {
    const skillName = formData['system.mainName'] || this.item.system.mainName
    if (this.item.system.specialism) {
      const specialization = formData['system.specName'] || this.item.system.specName
        formData.name = skillName + ' (' + specialization + ')'
    } else {
      formData.name = skillName
    }

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

  //Allow for a skill being dragged and dropped on to the skill sheet either in the group skill list
  async _onDrop (event, type = 'skill', collectionName = 'groupSkills') {
    event.preventDefault()
    event.stopPropagation()

    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? foundry.utils.duplicate(this.item.system[collectionName]) : []

    for (const item of dataList) {
      if (!item || !item.system) continue
      if (![type].includes(item.type)) {
        continue
      }

      //Dropping in Main Skill list
      if ((item.system.specialism && item.system.chosen) || (!item.system.specialism)) {
        if (item.system.group){ //if this is a Group Skill then don't add it to main skill list
          ui.notifications.warn(item.name + " : "  +   game.i18n.localize('BRP.stopGroupSkill'));
          continue
        } else if (collection.find(el => el.brpid === item.flags.brp.brpidFlag.id)) {
          ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
          continue
        } 
      }
      collection.push({uuid:item.uuid, brpid:item.flags.brp.brpidFlag.id})
    }

  await this.item.update({ [`system.${collectionName}`]: collection })
  }

  async _onItemView (event) {
    const item = $(event.currentTarget).closest('.item')
    const brpid = item.data('brpid')
    let tempItem = (await game.system.api.brpid.fromBRPIDBest({brpid:brpid}))[0]
    if (tempItem) {tempItem.sheet.render(true)};
  }

}