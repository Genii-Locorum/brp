import { BRPChecks } from "../rolls/checks.mjs";
import { BRPUtilities } from '../apps/utilities.mjs'

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class BRPItem extends Item {


  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;
    const actor = this.actor;
    if (item.type === 'spell' || item.type === 'skill' || item.type === 'weapons') {
      BRPChecks._onRollMacro(item.id,actor.id, event.shiftKey)
    } else {
        item.sheet.render(true);
    }
  }

}  
