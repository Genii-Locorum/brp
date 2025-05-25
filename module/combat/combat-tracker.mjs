export class BRPCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "systems/brp/templates/combat/combat-tracker.html"
    });
  }
}
