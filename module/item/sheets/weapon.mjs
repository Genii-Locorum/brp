import { BRPSelectLists } from "../../apps/select-lists.mjs";

export class BRPWeaponSheet extends ItemSheet {
    constructor (...args) {
      super(...args)
      this._sheetTab = 'items'
    }
  
    static get defaultOptions () {
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['brp', 'sheet', 'item'],
        template: 'systems/brp/templates/item/weapon.html',
        width: 600,
        height: 640,
        scrollY: ['.tab.description'],
        tabs: [{navSelector: '.sheet-tabs',contentSelector: '.sheet-body',initial: 'details'}]
      })
    }

    async getData () {
      const sheetData = super.getData();
      const itemData = sheetData.item;
      sheetData.hasOwner = this.item.isEmbedded === true;
      sheetData.useMP = game.settings.get('brp','useMP');
      sheetData.npcOwner = false
      if (sheetData.hasOwner) {
        if (this.item.parent.type === 'npc') {
          sheetData.npcOwner = true
        }
      }      
      //const actor = this.item.parent;
      let skillSelect = "";
      sheetData.isGM = game.user.isGM;
      //Get drop down options from select-lists.mjs
        sheetData.weaponOptions = await BRPSelectLists.getWpnCategoryOptions();
        sheetData.priceOptions = await BRPSelectLists.getPriceOptions();
        sheetData.damOptions = await BRPSelectLists.getDamBonusOptions();
        sheetData.specialOptions = await BRPSelectLists.getSpecialOptions();
        sheetData.handedOptions = await BRPSelectLists.getHandedOptions();
        sheetData.equippedOptions = await BRPSelectLists.getEquippedOptions(this.item.type);
        sheetData.wpnSkillOptions1 = await BRPSelectLists.getWeaponSkillOptions(this.item.system.weaponType,"1");
        sheetData.wpnSkillOptions2 = await BRPSelectLists.getWeaponSkillOptions(this.item.system.weaponType, this.item.system.skill1);
      sheetData.weaponCatName = game.i18n.localize("BRP." + this.item.system.weaponType);  
      sheetData.priceName = game.i18n.localize("BRP." + this.item.system.price); 
      sheetData.damName = game.i18n.localize("BRP." + this.item.system.db);  
      sheetData.handedName = game.i18n.localize("BRP." + this.item.system.hands);
      sheetData.specName = game.i18n.localize("BRP." + this.item.system.special);
      sheetData.equippedName = game.i18n.localize("BRP." + this.item.system.equipStatus);
      sheetData.isAmmo = false;
      if (this.item.system.weaponType === 'firearm' || this.item.system.weaponType === 'energy' ||this.item.system.weaponType === 'artillery' || this.item.system.weaponType === 'missile' || this.item.system.weaponType === 'heavy') {
        sheetData.isAmmo = true;
      }

      if (this.item.system.skill1 === 'none') {
        sheetData.skill1Name = game.i18n.localize("BRP.none")
      } else {
        skillSelect = game.items.get(this.item.system.skill1)
        sheetData.skill1Name = skillSelect ? skillSelect.name : "";
      }  

      if (this.item.system.skill2 === 'none') {
        sheetData.skill2Name = game.i18n.localize("BRP.none")
      } else {
        skillSelect = game.items.get(this.item.system.skill2)
        sheetData.skill2Name = skillSelect ? skillSelect.name : "";
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
      html.find('.item-toggle').click(this.onItemToggle.bind(this));
    }
    
    //Handle toggle states
    async onItemToggle(event){
      event.preventDefault();
      const prop=event.currentTarget.closest('.item-toggle').dataset.property;
      let checkProp={};
      if (prop === 'parry' || prop ==='burst' || prop ==='stun' || prop ==='choke' || prop ==='entangle' || prop ==='fire' || prop ==='pierce' || prop ==='sonic' || prop ==='poison' || prop ==='explosive' || prop ==='emp') {
        checkProp = {[`system.${prop}`] : !this.object.system[prop]}
      } else {return }      
    
      const item = await this.object.update(checkProp);
      return item;
  }

    _updateObject (event, formData) {
      super._updateObject(event, formData)
    }

  }