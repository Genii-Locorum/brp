import { BRPactorDetails } from "../apps/actorDetails.mjs";
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


};