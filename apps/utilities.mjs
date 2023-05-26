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
    let confirmation = await this.confirmation();
    if (confirmation) {
      BRPActorSheet.confirmItemDelete(actor, itemId);
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


}