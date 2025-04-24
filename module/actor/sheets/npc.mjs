import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { BRPRollType } from '../../apps/rollType.mjs';
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'

export class BRPNpcSheet extends ActorSheet {

  //Add BRPID buttons to sheet
  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  /** @override */
  static get defaultOptions() {

    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["brp", "sheet", "actor"],
      template: "systems/brp/templates/actor/npc-sheet.html",
      width: 595,
      height: 770,
    });
  }

  static confirmItemDelete(actor, itemId) {
    let item = actor.items.get(itemId);
    item.delete();
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    context.useEDU = game.settings.get('brp', 'useEDU');
    context.useFP = game.settings.get('brp', 'useFP');
    context.useSAN = game.settings.get('brp', 'useSAN');
    context.useRes5 = game.settings.get('brp', 'useRes5');
    context.useHPL = game.settings.get('brp', 'useHPL');
    context.useAlleg = game.settings.get('brp', 'useAlleg');
    context.usePassion = game.settings.get('brp', 'usePassion');
    context.useAVRand = game.settings.get('brp', 'useAVRand');
    context.useReputation = game.settings.get('brp', 'useReputation');
    context.useBeastiary = game.settings.get('brp', 'beastiary')
    context.statOptions = await BRPSelectLists.addStatOptions("");
    context.showArmour = false

    context.resource = 2
    if (game.settings.get('brp', 'useFP')) { context.resource++ }
    if (game.settings.get('brp', 'useSAN')) { context.resource++ }
    if (game.settings.get('brp', 'useRes5')) { context.resource++ }

    if (game.settings.get('brp', 'beastiary')) { context.resource = 5 }

    if (!context.useHPL || context.useBeastiary) { context.showArmour = true }

    context.extDescValue = await TextEditor.enrichHTML(
      context.system.extDesc,
      {
        async: true,
        secrets: context.editable
      }
    )


    // Prepare character data and items.
    this._prepareItems(context);
    this._prepareNpcData(context);
    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  //
  _prepareNpcData(context) {
  }

  //
  _prepareItems(context) {
    const skills = [];
    const weapons = [];
    const hitlocs = [];
    const gears = [];
    const powers = [];
    const passions = [];
    const allegiances = [];
    const persTraits = [];
    const reputations = [];


    // Sort items by name - saves sorting all containers by name separately
    context.items.sort(function (a, b) {
      let x = a.name;
      let y = b.name;
      if (x < y) { return -1 };
      if (x > y) { return 1 };
      return 0;
    });

    for (let itm of context.items) {
      itm.img = itm.img || DEFAULT_TOKEN;
      if (itm.type === 'skill') {
        skills.push(itm);
      } else if (itm.type === 'passion') {
        passions.push(itm);
      } else if (itm.type === 'allegiance') {
        allegiances.push(itm);
      } else if (itm.type === 'reputation') {
        reputations.push(itm);
      } else if (itm.type === 'persTrait') {
        persTraits.push(itm);
      } else if (itm.type === 'weapon') {
        if (itm.system.range3 != "") {
          itm.system.rangeName = itm.system.range1 + "/" + itm.system.range2 + "/" + itm.system.range3
        } else if (itm.system.range2 != "") {
          itm.system.rangeName = itm.system.range1 + "/" + itm.system.range2
        } else {
          itm.system.rangeName = itm.system.range1
        }

        if (itm.system.specialDmg) {
          itm.system.dmgName = game.i18n.localize('BRP.special')
        } else if (itm.system.dmg3 != "") {
          itm.system.dmgName = itm.system.dmg1 + "/" + itm.system.dmg2 + "/" + itm.system.dmg3
        } else if (itm.system.dmg2 != "") {
          itm.system.dmgName = itm.system.dmg1 + "/" + itm.system.dmg2
        } else {
          itm.system.dmgName = itm.system.dmg1
        }
        weapons.push(itm);
      } else if (itm.type === 'hit-location') {
        hitlocs.push(itm);
      } else if (itm.type === 'gear') {
        gears.push(itm);
      } else if (["power", "magic", "mutation", "psychic", "sorcery", "super"].includes(itm.type)) {
        if (itm.type === 'super') {
          itm.system.impactHint = game.i18n.localize('BRP.level')
          itm.system.impactName = itm.system.level
          itm.system.impactDice = false
        } else if (itm.type === 'sorcery') {
          itm.system.impactHint = game.i18n.localize('BRP.level')
          itm.system.impactName = itm.system.currLvl
          itm.system.impactDice = false
        } if (itm.type === 'mutation') {
          itm.system.impactHint = game.i18n.localize('BRP.' + itm.system.impact)
          itm.system.impactDice = false
          if (itm.system.minor) {
            itm.system.impactName = game.i18n.localize('BRP.' + itm.system.impact + 'Abbr') + "(" + game.i18n.localize('BRP.minor') + ")"
          } else {
            itm.system.impactName = game.i18n.localize('BRP.' + itm.system.impact + 'Abbr') + "(" + game.i18n.localize('BRP.major') + ")"

          }
        } else if (['psychic', 'magic'].includes(itm.type)) {
          if (itm.system.impact === 'damage') {
            itm.system.impactName = game.i18n.localize('BRP.damageAbbr') + ":" + itm.system.damage
            itm.system.impactHint = game.i18n.localize('BRP.damage')
            itm.system.impactDice = true
          } else if (itm.system.impact === 'healing') {
            itm.system.impactName = game.i18n.localize('BRP.healingAbbr') + ":" + itm.system.damage
            itm.system.impactHint = game.i18n.localize('BRP.healing')
            itm.system.impactDice = true
          } else if (itm.system.impact === 'other') {
            itm.system.impactName = game.i18n.localize('BRP.other')
            itm.system.impactHint = ""
            itm.system.impactDice = false
          }
        }
        powers.push(itm)
      }
    }

    //Sort hitlocs by dice range
    hitlocs.sort(function (a, b) {
      let x = a.system.lowRoll;
      let y = b.system.highRoll;
      if (x < y) { return 1 };
      if (x > y) { return -1 };
      return 0;
    });

    context.skills = skills
    context.weapons = weapons
    context.hitlocs = hitlocs
    context.gears = gears
    context.powers = powers
    context.passions = passions;
    context.allegiances = allegiances;
    context.persTraits = persTraits;
    context.reputations = reputations

    context.usePowers = !this.actor.system.lock
    context.useAllegiances = !this.actor.system.lock
    context.usePassions = !this.actor.system.lock
    context.usePerTraits = !this.actor.system.lock
    context.useReputations = !this.actor.system.lock

    if (context.passions.length > 0) { context.usePassions = true }
    if (context.allegiances.length > 0) { context.useAllegiances = true }
    if (context.powers.length > 0) { context.usePowers = true }
    if (context.persTraits.length > 0) { context.usePerTraits = true }
    if (context.reputations.length > 0) { context.useReputations = true }
    return context
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).closest(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    if (!this.isEditable) return;
    html.find(".actor-toggle").click(this._onActorToggle.bind(this));                       // Actor Toggle
    html.find(".inline-edit").change(this._onSkillEdit.bind(this));                         //Inline Skill Edit
    html.find('.item-create').click(this._onItemCreate.bind(this));                         // Add Inventory Item
    html.find('.addPower').click(this._onPowerCreate.bind(this));                           // Add Power
    html.find('.rollStats').click(this._onRollStats.bind(this));                            // Roll Stats
    html.find('.rollable.charac-name').click(BRPRollType._onStatRoll.bind(this));           // Rollable Characteristic
    html.find('.rollable.skill-name').click(BRPRollType._onSkillRoll.bind(this));           // Rollable Skill
    html.find('.rollable.allegiance-name').click(BRPRollType._onAllegianceRoll.bind(this)); // Rollable Allegiance
    html.find('.rollable.passion-name').click(BRPRollType._onPassionRoll.bind(this));       // Rollable Passion
    html.find('.rollable.persTrait-name').click(BRPRollType._onPersTraitRoll.bind(this));   // Rollable Personal Trait
    html.find('.rollable.reputation-name').click(BRPRollType._onReputationRoll.bind(this)); // Rollable Personal Trait
    html.find('.rollable.weapon-name').click(BRPRollType._onWeaponRoll.bind(this));         // Weapon Skill Roll
    html.find('.rollable.damage-name').click(BRPRollType._onDamageRoll.bind(this));         // Damage Roll
    html.find('.rollable.ap-name').click(BRPRollType._onArmour.bind(this));                 // Armour roll
    html.find('.hplHeal').click(this._resetHPL.bind(this));                                 // Reset Hit Loc HP to max.
    html.find('.rollable.impact').click(BRPRollType._onImpactRoll.bind(this));              // Magic Spell Impact Roll

    // Drag events
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).closest(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });
  }

  //Toggle Actor
  async _onActorToggle(event) {
    const prop = event.currentTarget.dataset.property;
    let checkProp = {};
    let checkVal = ""

    if (['lock'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !this.actor.system[prop] }
    } else if (['viewTab'].includes(prop)) {
      checkVal = event.currentTarget.dataset.tabval;
      checkProp = { [`system.${prop}`]: checkVal }
    } else {
      return
    }
    await this.actor.update(checkProp);
    return
  }

  // Update skills etc without opening the item sheet
  async _onSkillEdit(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    let field = element.dataset.field;
    let newScore = element.value;
    if (['base', 'currHP', 'quantity', 'npcVal', 'allegPoints', 'hpCurr', 'ammoCurr'].includes(field)) {
      newScore = Number(newScore)
      field = 'system.' + field;
    } else if (['displayName', 'ap', 'bap', 'apRnd', 'bapRnd', 'att'].includes(field)) {
      field = 'system.' + field;
    } else if (field === 'name') {
    } else { return }
    await item.update({ [field]: newScore });
    this.actor.render(false);
    return;
  }

  // Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);
    // Initialize a default name.
    const name = `zz-${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };

    if (type === 'hit-location') {
      itemData.system.displayName = name
    }

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Create the item!
    const newItem = await Item.create(itemData, { parent: this.actor });
    let key = await game.system.api.brpid.guessId(newItem)
    await newItem.update({
      'flags.brp.brpidFlag.id': key,
      'flags.brp.brpidFlag.lang': game.i18n.lang,
      'flags.brp.brpidFlag.priority': 0
    })

    //And in certain circumstances render the new item sheet
    if (itemData.type === 'hit-location') {
      newItem.sheet.render(true);
    }
  }

  //Add a power to NPC
  async _onPowerCreate(event) {
    let usage = await this._selectPower()
    let powerType = ""
    if (usage) {
      powerType = usage.get('selectPower')
    } else { return }
    const name = `zz-${powerType.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: powerType,
    };
    // Create the item!
    const newItem = await Item.create(itemData, { parent: this.actor });
    newItem.sheet.render(true);
  }

  //Get Power Type
  async _selectPower() {
    let data = ""
    let catOptions = await BRPSelectLists.getPowerCatOptions();
    data = {
      catOptions,
    }

    const html = await renderTemplate('systems/brp/templates/dialog/selectPower.html', data)
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: "",
        content: html,
        buttons: {
          roll: {
            label: game.i18n.localize("BRP.proceed"),
            callback: html => {
              formData = new FormData(html[0].querySelector('#select-power-form'))
              return resolve(formData)
            }
          }
        },
        default: 'roll',
        close: () => { }
      })
      dlg.render(true)
    })
  }

  //Roll Stats for NPC
  async _onRollStats(event) {
    //Roll Stats
    const element = event.currentTarget;
    let type = element.dataset.property;
    for (let [key, stat] of Object.entries(this.actor.system.baseStats)) {
      let rollForm = stat.average
      if (type === 'random') {
        rollForm = stat.random
      }
      let checkProp = ""
      if (rollForm === "") {
        checkProp = { [`system.stats.${key}.base`]: 0 }
      } else {
        let roll = new Roll(rollForm)
        await roll.evaluate()
        let newVal = Math.round(Number(roll.total))
        checkProp = { [`system.stats.${key}.base`]: newVal }
      }
      await this.actor.update(checkProp)
      //Update Current HP etc to max
      checkProp = {
        'system.health.value': this.actor.system.health.max,
        'system.power.value': this.actor.system.power.max,
        'system.fatigue.value': this.actor.system.fatigue.max,
        'system.sanity.value': this.actor.system.sanity.max
      }
      await this.actor.update(checkProp)
    }

    //If using HPL set location Current HP to Max HP
    await this._resetHPL(event)
  }

  async _resetHPL(event) {
    if (game.settings.get('brp', 'useHPL')) {
      let hitLocs = this.actor.items.filter(itm => itm.type === 'hit-location').map(itm => {
        return { _id: itm.id, 'system.currHP': itm.system.maxHP }
      })
      await Item.updateDocuments(hitLocs, { parent: this.actor })
    }
  }

}
