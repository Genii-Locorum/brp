import { BRPactorDetails } from "../apps/actorDetails.mjs";
import { BRPActorSheet } from '../actor/actor-sheet.mjs';
export class BRPUtilities {

static async _restoreHP (token, actor) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor)
    partic.system.health.value = partic.system.health.max;
    actor.sheet.render(false)
}

static async _restoreFP (token, actor) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor)
    partic.system.fatigue.value = partic.system.fatigue.max;
    actor.sheet.render(false)
}

static async _restorePP (token, actor, resource) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor)
    partic.system.power.value = partic.system.power.max;
    actor.sheet.render(false)
}

static async getDataset(el, dataitem) {
    const elem = await el.target ? el.target : el[0];
    const element = await elem?.closest(".item");
    return element.dataset[dataitem];
  }  

static async triggerDelete(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    BRPActorSheet.confirmItemDelete(actor, itemId);
    return 
}

static async triggerEdit(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    const item = actor.items.get(itemId);
    item.sheet.render(true);
    return 
}

};