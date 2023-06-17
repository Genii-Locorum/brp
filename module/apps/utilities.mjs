import { BRPactorDetails } from "../apps/actorDetails.mjs";
import { BRPActorSheet } from '../actor/actor-sheet.mjs';
import { BRPChecks } from '../rolls/checks.mjs';

export class BRPUtilities {

static async _restoreHP (token, actor) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor);
    partic.system.health.value = partic.system.health.max;
    actor.sheet.render(false);
}

static async _restoreFP (token, actor) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor);
    partic.system.fatigue.value = partic.system.fatigue.max;
    actor.sheet.render(false);
}

static async _restorePP (token, actor) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor);
    partic.system.power.value = partic.system.power.max;
    actor.sheet.render(false);
}

static async getDataset(el, dataitem) {
    const elem = await el.target ? el.target : el[0];
    const element = await elem?.closest(".item");
    return element.dataset[dataitem];
}  

static async triggerDelete(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    if (!itemId) {return}
    let type = actor.items.get(itemId).type
    let confirmation = await this.confirmation();
    if (confirmation) {
      BRPActorSheet.confirmItemDelete(actor, itemId);
      //If Deleting culture from Actor then remove Hit Locations Items as well
      if (type === 'culture') {
        for (let i of actor.items) {
          if (i.type === 'hit-location') {
            BRPActorSheet.confirmItemDelete(actor, i._id);
          }  
        }  
      //If Deleting personality from Actor then remove personality scores  
      } else if (type === 'personality') {
        for (let i of actor.items) {
          if (i.type === 'skill' && i.system.personality > 0){
            i.update({'system.personality': 0})
          }  
        }  
      } else if (type === 'profession') {
        for (let i of actor.items) {
          if (i.type === 'skill'){
            i.update({'system.occupation': false,'system.profession': 0})
          }  
        }
      }  
    }    
    return 
}

static async triggerEdit(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    const item = actor.items.get(itemId);
    item.sheet.render(true);
    return 
}

static async toggleXP(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    const item = actor.items.get(itemId);
    await item.update({'system.improve': !item.system.improve});
    return 
}

static async confirmation() {
let confirmation = await Dialog.confirm({
    title: game.i18n.localize('BRP.confirm'),
    content: game.i18n.localize('BRP.proceed'),
  });
  return confirmation;
}

static async _onXPGainAll(actor,token,rollType) {
  let partic = await BRPactorDetails._getParticipantPriority(token, actor);
  for (let i of partic.items) { 
    if (i.system.improve) {
      await BRPChecks._onSkillXPRoll(actor,token,i._id, rollType);
    }
  }
  return;
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

static async onDeleteAllSkills (actor) {
  let confirmation = await this.confirmation();
  if (confirmation){
    for (let i of actor.items) {
      if (i.type === 'skill'){
        BRPActorSheet.confirmItemDelete(actor, i._id);
      }  
    }  
  }
}

static async changeWealth (token, actor, value) {
  let partic = await BRPactorDetails._getParticipantPriority(token, actor);
  let newWealth = Number(Math.min(Math.max(Number(partic.system.wealth + value),0),4))??0
  partic.update({'system.wealth' :newWealth})
  actor.sheet.render(false);
}

}