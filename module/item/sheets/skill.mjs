import { BRPCharGen } from "../../actor/character-creation.mjs";

export class BRPSkillSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        width: 520,
        height: 620,
        scrollY: ['.tab.description'],
        tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'description'}]
      })
    }
  
    /** @override */
    get template () {
      return `systems/brp/templates/item/${this.item.type}.html`
    }
  
    getData () {
      const sheetData = super.getData()
      const itemData = sheetData.item
      sheetData.hasOwner = this.item.isEmbedded === true
      sheetData.isSpecialized = this.item.system.specialism
      sheetData.isGM = game.user.isGM
      sheetData.statOptions = BRPCharGen.getStatOptions()
      sheetData.keyOptions = BRPSkillSheet.getKeywordOptions()
      sheetData.stat1=game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.baseFormula[1].stat])
      sheetData.stat2=game.i18n.localize(CONFIG.BRP.statsAbbreviations[this.item.system.baseFormula[2].stat])
      sheetData.funcDisp= game.i18n.localize("BRP." + this.item.system.baseFormula.Func)
      sheetData.funcOptions = {
        "and": game.i18n.localize("BRP.and"),
        "or": game.i18n.localize("BRP.or"),}
      itemData.system.total = itemData.system.base + itemData.system.xp + itemData.system.effects + itemData.system.personality + itemData.system.profession + itemData.system.personal
      
      //Ensure mainName is populated
      if( this.item.system.mainName ==="" ) {
        this.object.update({'system.mainName': this.item.name});
      }

      
      return sheetData
    }
  
    /* -------------------------------------------- */
  
    /**
     * Activate event listeners using the prepared sheet HTML
     * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
     */
    activateListeners (html) {
      super.activateListeners(html)
      // Everything below here is only needed if the sheet is editable
      if (!this.options.editable) return
  
      html.find('.item-toggle').click(this.onItemToggle.bind(this));
    }
  
    /* -------------------------------------------- */
  
  //Handle toggle states
  async onItemToggle(event){
    event.preventDefault();
    const prop=event.currentTarget.closest('.item-toggle').dataset.property;
    let checkProp={};
    if (prop === 'cmmnmod') {
      checkProp = {'system.category': "cmmnmod", 'system.weapon': false, 'system.subType': ""};
    } else  if (prop === 'mnplmod') {
      checkProp = {'system.category': "mnplmod", 'system.weapon': false, 'system.subType': ""};
    } else  if (prop === 'mntlmod') {
      checkProp = {'system.category': "mntlmod", 'system.weapon': false, 'system.subType': ""};
    } else  if (prop === 'prcpmod') {
      checkProp = {'system.category': "prcpmod", 'system.weapon': false, 'system.subType': ""};
    } else  if (prop === 'physmod') {
      checkProp = {'system.category': "physmod", 'system.weapon': false, 'system.subType': ""};
    } else  if (prop === 'zcmbtmod') {
      checkProp = {'system.category': "zcmbtmod", 'system.specialism' : false};
    } else  if (prop === 'noXP') {
      checkProp = {'system.noXP': !this.object.system.noXP};
    } else  if (prop === 'noSpec') {
      checkProp = {'system.subType': ""};
    } else  if (prop === 'specialism') {
      checkProp = {'system.specialism': !this.object.system.specialism};
    } else  if (prop === 'variable') {
        checkProp = {'system.variable': !this.object.system.variable};
    } else  if (prop === 'specGroup') {
      checkProp = {'system.specGroup': !this.object.system.specGroup, 'system.weapon': false, 'system.subType': "",'system.noXP':true };
    } else if (prop === 'weapon') {
      checkProp= {'system.weapon': !this.object.system.weapon};
    } else if (prop === 'artillery' ||prop === 'energy' ||prop === 'firearm' ||prop === 'heavy'||prop === 'melee' ||prop === 'missile') {
      checkProp= {'system.subType': prop};
    } else if (prop === 'chosen') {
      checkProp= {'system.chosen': !this.object.system.chosen};
    }  
  
    const item = await this.object.update(checkProp);
    return item;
  
  }
 
    async _updateObject (event, formData) {
      const skillName = formData['system.mainName'] || this.item.system.mainName
      if (this.item.system.specialism) {
        const specialization = formData['system.specName'] || this.item.system.specName
        formData.name = skillName + ' (' + specialization + ')'
      } else {
        formData.name = skillName
      }
      return super._updateObject(event, formData)
    }

  //
  //Keyword Options 
  //
  static getKeywordOptions () {
    let options = {
      "": game.i18n.localize("BRP.keyword.none"),
      "dodge": game.i18n.localize("BRP.keyword.dodge"),
      "firstAid": game.i18n.localize("BRP.keyword.firstAid"),
      "medicine": game.i18n.localize("BRP.keyword.medicine"),
    };
    return options;
  } 

  }