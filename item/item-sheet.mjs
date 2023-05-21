/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class BRPItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["brp", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/brp/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.isGM=game.user.isGM;
    context.system = itemData.system;
    context.flags = itemData.flags;

    if (itemData.type === 'species') {
      this._prepareItems(context)
    } else if (itemData.type === 'skill') {
      itemData.system.total = itemData.system.base + itemData.system.xp + itemData.system.effects
    };
    
    return context;
  }

_prepareItems(context) {
// Handle characteristics scores - add labels and make stat visisble is selected
for (let [k, v] of Object.entries(context.system.stats)) {
  v.label = game.i18n.localize(CONFIG.BRP.stats[k]) ?? k;
}
}



  
  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Toggle Item selectors.
    html.find('.item-toggle').click(this.onItemToggle.bind(this));

    // Roll handlers, click handlers, etc. would go here.
  }

  //Handle toggle states
async onItemToggle(event){

  event.preventDefault();
  const prop=event.currentTarget.closest('.item-toggle').dataset.property;
  let checkProp={};
  if (prop === 'cmmnmod') {
    checkProp = {'system.category': "cmmnmod", 'system.weapon': false};
  } else  if (prop === 'mnplmod') {
    checkProp = {'system.category': "mnplmod", 'system.weapon': false};
  } else  if (prop === 'mntlmod') {
    checkProp = {'system.category': "mntlmod", 'system.weapon': false};
  } else  if (prop === 'prcpmod') {
    checkProp = {'system.category': "prcpmod", 'system.weapon': false};
  } else  if (prop === 'physmod') {
    checkProp = {'system.category': "physmod", 'system.weapon': false};
  } else  if (prop === 'zcmbtmod') {
    checkProp = {'system.category': "zcmbtmod"};
  } else  if (prop === 'noXP') {
    checkProp = {'system.noXP': !this.object.system.noXP};
  } else if (prop === 'weapon') {
    checkProp= {'system.weapon': !this.object.system.weapon};
  }
  
  const item = await this.object.update(checkProp);
  return item;

}


}
