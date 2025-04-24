export class BRPCombatTracker extends CombatTracker {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/brp/templates/combat/combat-tracker.html"
    });
  }
}
