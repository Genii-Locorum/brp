import { BRPActorSheetV2 } from "./base-actor-sheet.mjs";
import { BRPSelectLists } from "../../apps/select-lists.mjs";
import BRPDialog from '../../setup/brp-dialog.mjs';

export class BRPNPCSheetV2 extends BRPActorSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['npcv2'],
    position: {
      width: 610,
      height: 770
    },
    window: {
      resizable: true,
    },
  }

  static PARTS = {
    header: {
      template: 'systems/brp/templates/actor/npcV2.header.hbs',
      scrollable: ['']
    },
    main: {
      template: 'systems/brp/templates/actor/npcV2.main.hbs',
      scrollable: ['']
    },
    notes: {
      template: 'systems/brp/templates/actor/npcV2.notes.hbs',
      scrollable: [''],
    },
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    //Common parts to the character - this is the order they are show on the sheet
    options.parts = ['header', 'main', 'notes'];
  }

  _getTabs(parts) {
  }

  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    //context.tabs = this._getTabs(options.parts);
    const actorData = this.actor.toObject(false);
    context.showArmour = false
    if (!context.useHPL || context.useBeastiary) { context.showArmour = true }


    context.extDescValue = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
      this.actor.system.extDesc,
      {
        async: true,
        secrets: this.document.isOwner,
        rollData: this.actor.getRollData(),
        relativeTo: this.actor,
      }
    );

    await this._prepareItems(context);
    return context
  }

  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
    }
    return context;
  }

  //Handle Actor's Items
  async _prepareItems(context) {
    const skills = [];
    const weapons = [];
    const hitlocs = [];
    const gears = [];
    const powers = [];
    const passions = [];
    const allegiances = [];
    const persTraits = [];
    const reputations = [];

    for (let itm of this.document.items) {
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

        if (itm.system.dmg3 != "") {
          itm.system.dmgName = itm.system.dmg1 + "/" + itm.system.dmg2 + "/" + itm.system.dmg3
        } else if (itm.system.dmg2 != "") {
          itm.system.dmgName = itm.system.dmg1 + "/" + itm.system.dmg2
        } else {
          itm.system.dmgName = itm.system.dmg1
        }

        itm.system.damageHint = game.i18n.localize("BRP." + itm.system.special)
        itm.system.dbName = "-"
        itm.system.dbNameHint=game.i18n.localize("BRP.none")
        if (itm.system.db === "half") {
          itm.system.dbName = "½"
          itm.system.dbNameHint=game.i18n.localize("BRP.half")
        } else if (itm.system.db === "full") {
          itm.system.dbName = game.i18n.localize('BRP.dmgBonusInitials')
          itm.system.dbNameHint=game.i18n.localize("BRP.full")
        } else if (itm.system.db === "oneH") {
          itm.system.dbName = "1H"
          itm.system.dbNameHint=game.i18n.localize("BRP.oneH")
        } else if (itm.system.db === "str") {
          itm.system.dbName = "2S"
          itm.system.dbNameHint=game.i18n.localize("BRP.strDBName")
        } else if (itm.system.db === "dbl") {
          itm.system.dbName = "*2"
          itm.system.dbNameHint=game.i18n.localize("BRP.double")
        }

        itm.system.specialDam = false;
        itm.system.specialLabel = "";
        if (itm.system.burst) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.burst') + " ";
        }
        if (itm.system.stun) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.stun') + " ";
        }
        if (itm.system.entangle) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.entangle') + " ";
        }
        if (itm.system.explosive) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.explosive') + " ";
        }
        if (itm.system.fire) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.fire') + " ";
        }
        if (itm.system.pierce) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.pierce') + " ";
        }
        if (itm.system.sonic) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.sonic') + " ";
        }
        if (itm.system.choke) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.choke') + " ";
        }
        if (itm.system.emp) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.emp') + " ";
        }
        if (itm.system.poison) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.poison') + " ";
        }
        if (itm.system.disease) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.disease') + " ";
        }
        if (itm.system.spclDmg) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.special') + " ";
        }
        if (itm.system.cold) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.cold') + " ";
        }
        if (itm.system.acid) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.acid') + " ";
        }
        if (itm.system.constrict) {
          itm.system.specialDam = true;
          itm.system.specialLabel = itm.system.specialLabel + game.i18n.localize('BRP.constrict') + " ";
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

    context.skills = skills.sort(function (a, b) { return a.name.localeCompare(b.name) });
    context.weapons = weapons.sort(function (a, b) { return a.name.localeCompare(b.name) });
    context.hitlocs = hitlocs
    context.gears = gears.sort(function (a, b) { return a.name.localeCompare(b.name) });
    context.powers = powers.sort(function (a, b) { return a.name.localeCompare(b.name) });
    context.passions = passions.sort(function (a, b) { return a.name.localeCompare(b.name) });
    context.allegiances = allegiances.sort(function (a, b) { return a.name.localeCompare(b.name) });
    context.persTraits = persTraits.sort(function (a, b) { return a.name.localeCompare(b.name) });
    context.reputations = reputations.sort(function (a, b) { return a.name.localeCompare(b.name) });

    context.usePowers = !this.actor.system.lock
    context.useAllegiances = !this.actor.system.lock
    context.usePassions = !this.actor.system.lock
    context.usePerTraits = !this.actor.system.lock
    context.useReputations = !this.actor.system.lock
    context.useGear = !this.actor.system.lock

    if (context.passions.length > 0) { context.usePassions = true }
    if (context.allegiances.length > 0) { context.useAllegiances = true }
    if (context.powers.length > 0) { context.usePowers = true }
    if (context.persTraits.length > 0) { context.usePerTraits = true }
    if (context.reputations.length > 0) { context.useReputations = true }
    if (context.gears.length > 0) { context.useGear = true }
    return context
  }



  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
    this._dragDrop.forEach((d) => d.bind(this.element));
    this.element.querySelectorAll('.inline-edit').forEach(n => n.addEventListener("change", BRPActorSheetV2.skillInline.bind(this)))
    this.element.querySelectorAll('.addPower').forEach(n => n.addEventListener("click", this.#onPowerCreate.bind(this)))
  }



  //--------------ACTIONS-------------------



  //--------------LISTENERS------------------


    //Add a power to NPC
    async #onPowerCreate(event) {
      let usage = await this._selectPower()
      let powerType = ""
      if (usage) {
        powerType = usage.selectPower
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
      const html = await foundry.applications.handlebars.renderTemplate('systems/brp/templates/dialog/selectPower.hbs', data)
      const dlg = await BRPDialog.input({
        window: {title: game.i18n.localize('TYPES.Item.power')},
        content: html,
        ok: {
          label: game.i18n.localize("BRP.proceed"),
          }
       })
      return dlg;
    }

}
