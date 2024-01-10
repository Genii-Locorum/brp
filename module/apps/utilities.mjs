import { BRPCharacterSheet } from '../actor/sheets/character.mjs';
import { BRPactorDetails } from './actorDetails.mjs';

export class BRPUtilities {

  static async getDataset(el, dataitem) {
    const elem = await el.target ? el.target : el[0];
    const element = await elem?.closest(".item");
    return element.dataset[dataitem];
  }      

  static async triggerEdit(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    if (!itemId) {return}
    const item = actor.items.get(itemId);
    item.sheet.render(true);
    return 
  }  

  static async triggerDelete(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    if (!itemId) {return}
    let name = actor.items.get(itemId).name
    let type = actor.items.get(itemId).type
    let confirmation = await this.confirmation(name, type);
    if (confirmation) {
      await BRPCharacterSheet.confirmItemDelete(actor, itemId);
    }    
    return confirmation
  }

  static async confirmation(name, type) {
    let title = ""
      if (type === 'chatMsg') {
        title = game.i18n.localize('BRP.'+name)
      } else {
        title = game.i18n.localize('BRP.delete') + ":" + game.i18n.localize('BRP.'+type) + "(" + name +")";
      }  
    let confirmation = await Dialog.confirm({
      title: title,
      content: game.i18n.localize('BRP.proceed'),
    });
    return confirmation;
  }

  static async getDataFromDropEvent (event, entityType = 'Item') {
    if (event.originalEvent) return []
    try {
      const dataList = JSON.parse(event.dataTransfer.getData('text/plain'))
      if (dataList.type === 'Folder' && dataList.documentName === entityType) {
        const folder = await fromUuid(dataList.uuid)
        if (!folder) return []
        return folder.contents
      } else if (dataList.type === entityType) {
        const item = await fromUuid(dataList.uuid)
        if (!item) return []
        return [item]
      } else {
        return []
      }
    } catch (err) {
      return []
    }
  }

  static async professionDelete(event, actor) {
    const confirmation = await this.triggerDelete(event,actor, "itemId")
    if (!confirmation) {return}
    
  }

  static async personalityDelete(event, actor) {
    const confirmation = await this.triggerDelete(event,actor, "itemId")
    if (!confirmation) {return}

  }


  //Update attributes
  static async updateAttribute(actor,token,att,adj) {
    let partic = await BRPactorDetails._getParticipantPriority(token,actor)
    let checkprop = ""
    let newVal = partic.system[att].value
    let newMax = partic.system[att].max
    if (adj === 'spend'){
      checkprop = {[`system.${att}.value`] : newVal-1}
    } else if (adj === 'recover' && newVal < newMax){
      checkprop = {[`system.${att}.value`] : newVal+1}      
    } else if (adj === 'restore'){
      checkprop = {[`system.${att}.value`] : newMax}      
    } else {return}
    partic.update(checkprop)    
  }



}    