import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPSkillCategory extends ItemSheet {
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
      template: 'systems/brp/templates/item/skillcat.html',
      width: 520,
      height: 550,
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
    sheetData.statOptions = await BRPSelectLists.addStatOptions();
    sheetData.statName=game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.stat]);

    sheetData.advStatOptionsStr = await BRPSelectLists.getAdvSkillCatOptions();
    sheetData.advStatOptionsCon = await BRPSelectLists.getAdvSkillCatOptions();
    sheetData.advStatOptionsInt = await BRPSelectLists.getAdvSkillCatOptions();
    sheetData.advStatOptionsSiz = await BRPSelectLists.getAdvSkillCatOptions();
    sheetData.advStatOptionsPow = await BRPSelectLists.getAdvSkillCatOptions();
    sheetData.advStatOptionsDex = await BRPSelectLists.getAdvSkillCatOptions();
    sheetData.advStatOptionsCha = await BRPSelectLists.getAdvSkillCatOptions();
    sheetData.advStatOptionsEdu = await BRPSelectLists.getAdvSkillCatOptions();
    sheetData.skillCatNameStr = game.i18n.localize('BRP.advSkillCat.'+this.item.system.attrib.str)
    sheetData.skillCatNameCon = game.i18n.localize('BRP.advSkillCat.'+this.item.system.attrib.con)
    sheetData.skillCatNameInt = game.i18n.localize('BRP.advSkillCat.'+this.item.system.attrib.int)
    sheetData.skillCatNameSiz = game.i18n.localize('BRP.advSkillCat.'+this.item.system.attrib.siz)
    sheetData.skillCatNamePow = game.i18n.localize('BRP.advSkillCat.'+this.item.system.attrib.pow)
    sheetData.skillCatNameDex = game.i18n.localize('BRP.advSkillCat.'+this.item.system.attrib.dex)
    sheetData.skillCatNameCha = game.i18n.localize('BRP.advSkillCat.'+this.item.system.attrib.cha)
    sheetData.skillCatNameEdu = game.i18n.localize('BRP.advSkillCat.'+this.item.system.attrib.edu)

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
  
  //Activate event listeners using the prepared sheet HTML
  activateListeners (html) {
    super.activateListeners(html)
    if (!this.options.editable) return  
  }



}