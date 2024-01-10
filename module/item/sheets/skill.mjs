import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { BRPUtilities } from '../../apps/utilities.mjs'

export class BRPSkillSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return mergeObject(super.defaultOptions, {
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
      sheetData.isGM = game.user.isGM
      //Get drop down options from select-lists.mjs
        sheetData.statOptions = await BRPSelectLists.getStatOptions();
        sheetData.catOptions = await BRPSelectLists.getCategoryOptions();
        sheetData.wpnOptions = await BRPSelectLists.getWpnCategoryOptions();
        sheetData.funcOptions = await BRPSelectLists.getFunctionalOptions();
      sheetData.stat1=game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.baseFormula[1].stat]);
      sheetData.stat2=game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.baseFormula[2].stat]);
      sheetData.catName = game.i18n.localize("BRP." + this.item.system.category);
      sheetData.wpnType = game.i18n.localize("BRP." + this.item.system.subType);
      sheetData.funcDisp= game.i18n.localize("BRP." + this.item.system.baseFormula.Func);
      itemData.system.total = itemData.system.base + itemData.system.xp + itemData.system.effects + itemData.system.personality + itemData.system.profession + itemData.system.personal;
      
      //Ensure mainName is populated
      if( this.item.system.mainName ==="" ) {
        this.object.update({'system.mainName': this.item.name});
      }

      const grpSkill = [];
      for (let i of itemData.system.groupSkills){
        const j = game.items.get(i)
        if(!j) {
          grpSkill.push({name : game.i18n.localize("BRP.invalid"), _id: i})
        } else {
        grpSkill.push(j);
        }
      }
      // Sort Skill Names
      grpSkill.sort(function(a, b){
        let x = a.name;
        let y = b.name;
        if (x < y) {return -1};
        if (x > y) {return 1};
        return 0;
      });
      sheetData.grpSkill = grpSkill;      
      return sheetData;
    }
  
    activateListeners (html) {
      super.activateListeners(html)
      // Everything below here is only needed if the sheet is editable
      if (!this.options.editable) return
      html.find('.item-toggle').click(this.onItemToggle.bind(this));
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
    if (['noXP', 'specialism', 'variable','group','chosen','basic'].includes(prop)) {
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
      if (this.item.system.chosen) {
        formData.name = specialization + ' (' + skillName + ')'  
      } else {
        formData.name = skillName + ' (' + specialization + ')'
      }
    } else {
      formData.name = skillName
    }

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

  //Allow for a skill being dragged and dropped on to the skill sheet either in the group skill list
  async _onDrop (event, type = 'skill', collectionName = 'groupSkills') {
    event.preventDefault()
    event.stopPropagation()

    const dataList = await BRPUtilities.getDataFromDropEvent(event, 'Item')
    const collection = this.item.system[collectionName] ? duplicate(this.item.system[collectionName]) : []

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
        } else if (collection.find(el => el === item._id)) {
          ui.notifications.warn(item.name + " : " +   game.i18n.localize('BRP.dupItem'));
          continue
        } 
      }
      collection.push(item._id)
    }

  await this.item.update({ [`system.${collectionName}`]: collection })
}




}