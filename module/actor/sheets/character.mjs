import { BRPContextMenu } from '../../setup/context-menu.mjs';
import * as contextMenu from "../actor-cm.mjs";
import { BRPactorItemDrop } from '../actor-itemDrop.mjs';
import { BRPDamage } from '../../combat/damage.mjs';
import { BRPUtilities } from '../../apps/utilities.mjs';
import { BRPRollType } from '../../apps/rollType.mjs';
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPSelectLists } from '../../apps/select-lists.mjs';
import { BRPActiveEffectSheet } from '../../sheets/brp-active-effect-sheet.mjs';

export class BRPCharacterSheet extends ActorSheet {

  //Add BRPID buttons to sheet
  _getHeaderButtons() {
    const headerButtons = super._getHeaderButtons()
    addBRPIDSheetHeaderButton(headerButtons, this)
    return headerButtons
  }

  /** @override */
  static get defaultOptions() {


    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["brp", "sheet", "actor", "character"],
      template: "systems/brp/templates/actor/character-sheet.html",
      width: 865,
      height: 850,
      scrollY: ['.bottom-panel'],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
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
    context.logo = game.settings.get('brp', 'charSheetLogo');
    context.useEDU = game.settings.get('brp', 'useEDU');
    context.useFP = game.settings.get('brp', 'useFP');
    context.useSAN = game.settings.get('brp', 'useSAN');
    context.useRES5 = game.settings.get('brp', 'useRes5');
    context.useHPL = game.settings.get('brp', 'useHPL');
    context.useAlleg = game.settings.get('brp', 'useAlleg');
    context.usePassion = game.settings.get('brp', 'usePassion');
    context.usePersTrait = game.settings.get('brp', 'usePersTrait');
    context.useReputation = game.settings.get('brp', 'useReputation');
    context.wealthName = actorData.system.wealth
    context.wealthOptions = await BRPSelectLists.getWealthOptions(0, 4)
    if (actorData.system.wealth >= 0 && actorData.system.wealth <= 4 && actorData.system.wealth != "") {
      context.wealthName = game.i18n.localize('BRP.wealthLevel.' + actorData.system.wealth)
    }
    context.magicLabel = game.settings.get('brp', 'magicLabel') ?? game.i18n.localize('BRP.magic')
    context.mutationLabel = game.settings.get('brp', 'mutationLabel') ?? game.i18n.localize('BRP.mutation')
    context.psychicLabel = game.settings.get('brp', 'psychicLabel') ?? game.i18n.localize('BRP.psychic')
    context.sorceryLabel = game.settings.get('brp', 'sorceryLabel') ?? game.i18n.localize('BRP.sorcery')
    context.superLabel = game.settings.get('brp', 'superLabel') ?? game.i18n.localize('BRP.super')
    context.isLocked = actorData.system.lock
    context.statLocked = true
    if (!actorData.system.lock && game.settings.get('brp', 'development')) { context.statLocked = false }
    context.useSocialTab = false;
    context.usePersTab = false;
    if (context.useAlleg || (context.useReputation > 0)) { context.useSocialTab = true }
    if (context.usePersTrait || context.usePassion) { context.usePersTab = true }
    context.useAVRand = game.settings.get('brp', 'useAVRand');
    context.background1 = game.settings.get('brp', 'background1');
    context.background2 = game.settings.get('brp', 'background2');
    context.background3 = game.settings.get('brp', 'background3');
    let resource = 2;
    if (game.settings.get('brp', 'useFP')) { resource++ };
    if (game.settings.get('brp', 'useSAN')) { resource++ };
    if (game.settings.get('brp', 'useRes5')) { resource++ };
    context.resource = resource;
    context.magicLabel = game.i18n.localize('BRP.magic')
    if (game.settings.get('brp', 'magicLabel') != "") { context.magicLabel = game.settings.get('brp', 'magicLabel') }
    context.superLabel = game.i18n.localize('BRP.superAbbr')
    if (game.settings.get('brp', 'superLabel') != "") { context.superLabel = game.settings.get('brp', 'superLabel') }
    context.psychicLabel = game.i18n.localize('BRP.psychic')
    if (game.settings.get('brp', 'psychicLabel') != "") { context.psychicLabel = game.settings.get('brp', 'psychicLabel') }
    context.mutationLabel = game.i18n.localize('BRP.mutation')
    if (game.settings.get('brp', 'mutationLabel') != "") { context.mutationLabel = game.settings.get('brp', 'mutationLabel') }
    context.sorceryLabel = game.i18n.localize('BRP.sorcery')
    if (game.settings.get('brp', 'sorceryLabel') != "") { context.sorceryLabel = game.settings.get('brp', 'sorceryLabel') }

    //Set Culture, Personality & Profession labels
    context.culture = "";
    let tempCult = (await context.items.filter(itm => itm.type === 'culture'))[0]
    if (tempCult) {
      context.culture = tempCult.name
      context.cultureId = tempCult._id
      context.cultureUsed = true
    } else {
      context.culture = actorData.system.culture
      context.cultureUsed = false
    }

    context.personality = "";
    let tempPers = (await context.items.filter(itm => itm.type === 'personality'))[0]
    if (tempPers) {
      context.personality = tempPers.name
      context.personalityId = tempPers._id
      context.personalityUsed = true
    } else {
      context.personality = actorData.system.personalityName
      context.personalityUsed = false
    }

    context.profession = "";
    let tempProf = (await context.items.filter(itm => itm.type === 'profession'))[0]
    if (tempProf) {
      context.profession = tempProf.name
      context.professionId = tempProf._id
      context.professionUsed = true
    } else {
      context.profession = actorData.system.professionName
      context.professionUsed = false
    }

    // Prepare character data and items.
    this._prepareItems(context);
    this._prepareCharacterData(context);


    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    context.enrichedBiographyValue = await TextEditor.enrichHTML(
      context.system.biography,
      {
        async: true,
        secrets: context.editable
      }
    )

    context.enrichedBackgroundValue = await TextEditor.enrichHTML(
      context.system.background,
      {
        async: true,
        context: context.editable
      }
    )

    context.enrichedBackstoryValue = await TextEditor.enrichHTML(
      context.system.backstory,
      {
        async: true,
        context: context.editable
      }
    )

    //Get a List of Active Effects for the Actor
    context.effects = await BRPActiveEffectSheet.getActorEffectsFromSheet(context)

    return context;
  }

  //
  _prepareCharacterData(context) {
  }

  //
  _prepareItems(context) {
    // Initialize containers.
    const gears = [];
    const skills = [];
    const skillsDev = [];
    const skillsAlpha = [];
    const hitlocs = [];
    const magics = [];
    const mutations = [];
    const psychics = [];
    const sorceries = [];
    const superpowers = [];
    const failings = [];
    const armours = [];
    const weapons = [];
    const wounds = [];
    const allegiances = [];
    const passions = [];
    const persTraits = [];
    const reputations = [];

    // Iterate through items, allocating to containers
    this.actor.system.totalProf = 0
    this.actor.system.totalPers = 0
    this.actor.system.totalXP = 0

    // Sort items by type and then name - saves sorting all containers by name separately and makes sure skills are processed before weapons
    context.items.sort(function (a, b) {
      let x = a.name;
      let y = b.name;
      let r = a.type;
      let s = b.type;
      if (r < s) { return -1 };
      if (s < r) { return 1 };
      if (x < y) { return -1 };
      if (x > y) { return 1 };
      return 0;
    });

    // Add items to containers.
    for (let itm of context.items) {
      itm.img = itm.img || DEFAULT_TOKEN;

      if (itm.type === 'gear') {
        itm.system.equippedName = game.i18n.localize('BRP.' + itm.system.equipStatus)
        gears.push(itm);
      } else if (itm.type === 'skill') {
        skillsDev.push(itm)
        itm.system.grandTotal = itm.system.total + (this.actor.system.skillcategory[itm.system.category] ?? 0)
        let tempName = itm.name.toLowerCase()
        if (itm.system.specialism) {
          tempName = itm.system.specName.toLowerCase()
        }
        itm.system.orderName = tempName
        skillsAlpha.push(itm);
        skills.push(itm);
        this.actor.system.totalProf = this.actor.system.totalProf + itm.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + itm.system.personal
        this.actor.system.totalXP = this.actor.system.totalXP + itm.system.xp
      } else if (itm.type === 'hit-location') {
        hitlocs.push(itm);
        if (context.useHPL) {
          itm.system.list = 0
          itm.system.count = 0
          itm.system.hitlocID = itm._id
          armours.push(itm)
        }
      } else if (itm.type === 'wound') {
        wounds.push(itm);
      } else if (itm.type === 'magic') {
        itm.system.grandTotal = itm.system.total + (this.actor.system.skillcategory[itm.system.category] ?? 0)
        magics.push(itm);
        this.actor.system.totalProf = this.actor.system.totalProf + itm.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + itm.system.personal
        this.actor.system.totalXP = this.actor.system.totalXP + itm.system.xp
      } else if (itm.type === 'mutation') {
        mutations.push(itm);
      } else if (itm.type === 'psychic') {
        itm.system.grandTotal = itm.system.total + (this.actor.system.skillcategory[itm.system.category] ?? 0)
        psychics.push(itm);
        this.actor.system.totalProf = this.actor.system.totalProf + itm.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + itm.system.personal
        this.actor.system.totalXP = this.actor.system.totalXP + itm.system.xp
      } else if (itm.type === 'sorcery') {
        itm.system.ppCost = itm.system.currLvl * itm.system.pppl
        if (itm.system.mem) {
          itm.system.ppCost = itm.system.memLvl * itm.system.pppl
        }
        sorceries.push(itm);
      } else if (itm.type === 'super') {
        superpowers.push(itm);
      } else if (itm.type === 'failing') {
        failings.push(itm);
      } else if (itm.type === 'armour') {
        itm.system.hide = false
        if (itm.system.hitlocID) {
          let hitLocTemp = this.actor.items.get(itm.system.hitlocID)
          if (hitLocTemp) {
            itm.system.hitlocName = hitLocTemp.system.displayName
            itm.system.lowRoll = hitLocTemp.system.lowRoll
            if (context.useHPL) {
              itm.system.hide = hitLocTemp.system.hide
            }
          }
        }
        itm.system.equippedName = game.i18n.localize('BRP.' + itm.system.equipStatus)
        itm.system.list = 1
        armours.push(itm);
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

        let skill1Select = "";
        let skill2Select = "";
        skill1Select = skills.filter(nitm => nitm.flags.brp.brpidFlag.id === itm.system.skill1)[0]
        skill2Select = skills.filter(nitm => nitm.flags.brp.brpidFlag.id === itm.system.skill2)[0]
        if (skill1Select && skill2Select) {
          if (itm.system.skill2 === 'none') {
            if (skill1Select) {
              itm.system.sourceID = skill1Select._id
            }
          } else {
            if (skill2Select.system.total >= skill1Select.system.total) {
              itm.system.sourceID = skill2Select._id
            } else {
              itm.system.sourceID = skill1Select._id
            }
          }
        } else if (skill1Select) {
          itm.system.sourceID = skill1Select._id
        } else if (skill2Select) {
          itm.system.sourceID = skill2Select._id
        }


        if (itm.system.sourceID) {
          itm.system.skillScore = this.actor.items.get(itm.system.sourceID).system.total + this.actor.system.skillcategory[this.actor.items.get(itm.system.sourceID).system.category]
          itm.system.skillName = this.actor.items.get(itm.system.sourceID).name
        } else {
          itm.system.skillScore = 0
          itm.system.skillName = game.i18n.localize('BRP.noWpnSkill')
        }
        itm.system.equippedName = game.i18n.localize('BRP.' + itm.system.equipStatus)
        weapons.push(itm)
      } else if (itm.type === 'allegiance') {
        if (itm.system.allegApoth) {
          itm.system.rank = game.i18n.localize('BRP.allegApoth')
        } else if (itm.system.allegAllied) {
          itm.system.rank = game.i18n.localize('BRP.allegAllied')
        }
        allegiances.push(itm);
      } else if (itm.type === 'passion') {
        passions.push(itm);
      } else if (itm.type === 'persTrait') {
        persTraits.push(itm);
      } else if (itm.type === 'reputation') {
        reputations.push(itm);
      } else if (itm.type === 'skillcat') {
        skills.push({
          name: itm.name, isType: true, count: skills.filter(itm => itm.isType).length,
          flags: { brp: { brpidFlag: { id: itm.flags.brp.brpidFlag.id } } },
          system: { category: itm.flags.brp.brpidFlag.id, total: itm.system.total },
          _id: itm._id
        });
        skillsAlpha.push({
          name: itm.name, isType: true, count: skillsAlpha.filter(itm => itm.isType).length,
          flags: { brp: { brpidFlag: { id: itm.flags.brp.brpidFlag.id } } },
          system: { category: itm.flags.brp.brpidFlag.id, total: itm.system.total },
          _id: itm._id
        });
      }
    }

    //Sort Skills by Category then Skill Name
    skills.sort(function (a, b) {
      let x = a.name.toLowerCase();
      let y = b.name.toLowerCase();
      let r = a.isType ? a.isType : false;
      let s = b.isType ? b.isType : false;
      let p = a.system.category;
      let q = b.system.category;
      if (p < q) { return -1 };
      if (p > q) { return 1 };
      if (r < s) { return 1 };
      if (s < r) { return -1 };
      if (x < y) { return -1 };
      if (x > y) { return 1 };
      return 0;
    });


    let previousSpec = "";
    for (let skill of skills) {
      skill.isSpecialisation = false
      if (skill.system.specialism && (previousSpec != skill.system.mainName)) {
        previousSpec = skill.system.mainName;
        skill.isSpecialisation = true;
      }
    }

    skillsAlpha.sort(function (a, b) {
      let x = a.system.orderName;
      let y = b.system.orderName;
      let r = a.isType ? a.isType : false;
      let s = b.isType ? b.isType : false;
      let p = a.system.category;
      let q = b.system.category;
      if (p < q) { return -1 };
      if (p > q) { return 1 };
      if (r < s) { return 1 };
      if (s < r) { return -1 };
      if (x < y) { return -1 };
      if (x > y) { return 1 };
      return 0;
    });

    let alphaPreviousSpec = "";
    for (let alphaskill of skillsAlpha) {
      alphaskill.isAlphaSpecialisation = false
      if (!alphaskill.system.specialism) {
        alphaPreviousSpec = ""
      }
      if (alphaskill.system.specialism && (alphaPreviousSpec != alphaskill.system.mainName)) {
        alphaPreviousSpec = alphaskill.system.mainName;
        alphaskill.isAlphaSpecialisation = true;
      }
    }

    //Sort Armours by HitLocation and List score
    armours.sort(function (a, b) {
      let x = a.system.lowRoll;
      let y = b.system.lowRoll;
      let p = a.system.list;
      let q = b.system.list;
      if (x < y) { return 1 };
      if (x > y) { return -1 };
      if (p < q) { return -1 };
      if (p > q) { return 1 };
      return 0;
    });

    // Sort Hit Locations
    hitlocs.sort(function (a, b) {
      let x = a.system.lowRoll;
      let y = b.system.lowRoll;
      if (x < y) { return 1 };
      if (x > y) { return -1 };
      return 0;
    });

    //If using HPL add number of items of armour per Hit Loc
    if (context.useHPL) {
      let locID = ""
      let newArmours = []
      for (let itm of armours) {
        if (itm.system.list === 0) {
          let armList = armours.filter(arm => arm.system.list === 1 && arm.system.hitlocID === itm._id)
          itm.system.length = armList.length
        } else {
          if (itm.system.hitlocID != locID) {
            itm.system.show = true
            locID = itm.system.hitlocID
          } else {
            itm.system.show = false
          }
        }
        newArmours.push(itm)
      }
      context.armours = newArmours;
    } else {
      context.armours = armours;
    }

    // Assign and return
    context.persTraits = persTraits;
    context.gears = gears;
    context.skills = skills;
    context.skillsDev = skillsDev;
    context.skillsAlpha = skillsAlpha;
    context.hitlocs = hitlocs;
    context.magics = magics;
    context.mutations = mutations;
    context.psychics = psychics;
    context.sorceries = sorceries;
    context.superpowers = superpowers;
    context.failings = failings;
    context.weapons = weapons;
    context.wounds = wounds;
    context.allegiances = allegiances;
    context.passions = passions;
    context.reputations = reputations;

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

    html.find(".inline-edit").change(this._onSkillEdit.bind(this));                           //Inline Skill Edit
    html.find(".actor-toggle").click(this._onActorToggle.bind(this));                         // Actor Toggle
    html.find(".item-toggle").click(this._onItemToggle.bind(this));                           // Item Toggle
    html.find(".armour-toggle").click(this._onArmourToggle.bind(this));                       // Armour Toggle
    html.find('.item-create').click(this._onItemCreate.bind(this));                           // Add Inventory Item
    html.find('.rollable.charac-name').click(BRPRollType._onStatRoll.bind(this));             // Rollable Characteristic
    html.find('.rollable.skill-name').click(BRPRollType._onSkillRoll.bind(this));             // Rollable Skill
    html.find('.rollable.allegiance-name').click(BRPRollType._onAllegianceRoll.bind(this));   // Rollable Allegiance
    html.find('.rollable.passion-name').click(BRPRollType._onPassionRoll.bind(this));         // Rollable Passion
    html.find('.rollable.persTrait-name').click(BRPRollType._onPersTraitRoll.bind(this));     // Rollable Personality Trait
    html.find('.addDamage').click(this._addDamage.bind(this));                                // Add Damage
    html.find('.healWound').click(this._healWound.bind(this));                                // Heal Wound
    html.find('.rollable.damage-name').click(BRPRollType._onDamageRoll.bind(this));           // Damage Roll
    html.find('.rollable.weapon-name').click(BRPRollType._onWeaponRoll.bind(this));           // Weapon Skill Roll
    html.find('.rollable.attribute').click(this._onAttribute.bind(this));                     // Attribute modifier
    html.find('.rollable.ap-name').click(BRPRollType._onArmour.bind(this));                   // Armour roll
    html.find('.rollable.reputation-name').click(BRPRollType._onReputationRoll.bind(this));   // Rollable Reputation
    html.find('.rollStats').click(this._onRollStats.bind(this));                              // Roll Character Stats
    html.find('.stat-arrow').click(this._onRedisttibuteStats.bind(this));                     // Redistriibute Character Stats
    html.find('.rollable.impact').click(BRPRollType._onImpactRoll.bind(this));                // Magic Spell Impact Roll

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).closest(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Drag events.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    //Context Menus
    new BRPContextMenu(html, ".stat-name.contextmenu", contextMenu.characteristicMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".profession.contextmenu", contextMenu.professionMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".personality.contextmenu", contextMenu.personalityMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".culture.contextmenu", contextMenu.cultureMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".skills-tab.contextmenu", contextMenu.skillstabMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".combat-tab.contextmenu", contextMenu.combatMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".skill-name.contextmenu", contextMenu.skillMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".skill-cell-name.contextmenu", contextMenu.skillMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".category-name.contextmenu", contextMenu.skillCategoryMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".hitloc-name.contextmenu", contextMenu.hitLocMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".power-name.contextmenu", contextMenu.powerMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".magic-name.contextmenu", contextMenu.magicMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".mutation-name.contextmenu", contextMenu.mutationMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".psychic-name.contextmenu", contextMenu.psychicMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".super-name.contextmenu", contextMenu.superMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".failing-name.contextmenu", contextMenu.failingMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".armour-name.contextmenu", contextMenu.armourMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".gear-name.contextmenu", contextMenu.gearMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".weapon-name.contextmenu", contextMenu.weaponMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".wound-name.contextmenu", contextMenu.woundMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".power.contextmenu", contextMenu.powerAttMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".fatigue.contextmenu", contextMenu.fatigueAttMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".allegiance-name.contextmenu", contextMenu.allegianceMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".passion-name.contextmenu", contextMenu.passionMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".persTrait-name.contextmenu", contextMenu.persTraitMenuOptions(this.actor, this.token));
    new BRPContextMenu(html, ".reputation-name.contextmenu", contextMenu.reputationMenuOptions(this.actor, this.token));
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
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };

    if (type === 'wound') {
      let locId = header.dataset.itemId;
      itemData.name = game.i18n.localize('BRP.wound')
      itemData.system.locId = locId;
      itemData.system.value = 1
    }

    if (type === 'armour') {
      itemData.system.hitlocID = (await this.actor.items.filter(itm => itm.type === 'hit-location'))[0]._id
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
    if (['gear', 'armour', 'weapon'].includes(itemData.type)) {
      newItem.sheet.render(true);
    }

  }

  // Handle clickable rolls.
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  // Update skills etc without opening the item sheet
  async _onSkillEdit(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    const field = element.dataset.field;
    const target = 'system.' + field;
    let newScore = Number(element.value);
    await item.update({ [target]: newScore });
    this.actor.render(false);
    return;
  }

  //Toggle Actor
  async _onActorToggle(event) {
    const prop = event.currentTarget.dataset.property;
    let checkProp = {};

    if (prop === "lock") {
      checkProp = { [`system.${prop}`]: !this.actor.system[prop] }
    } else if (prop === 'improve') {
      checkProp = { 'system.stats.pow.improve': !this.actor.system.stats.pow.improve }
    } else if (prop === 'minorWnd') {
      checkProp = {
        'system.minorWnd': !this.actor.system.minorWnd,
        'system.health.daily': 0
      }
    } else if (prop === 'majorWnd') {
      checkProp = {
        'system.majorWnd': !this.actor.system.majorWnd,
        'system.health.daily': 0
      }
    } else { return }

    await this.actor.update(checkProp);
    return
  }

  //Item Toggle
  async _onItemToggle(event) {
    const element = event.currentTarget;
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    const prop = element.dataset.property;
    let checkProp = {};
    if (['hide', 'improve', 'oppimprove', 'mem', 'injured', 'bleeding', 'incapacitated', 'severed', 'dead', 'unconscious'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !item.system[prop] }
    } else if (prop === 'equipStatus') {
      if (item.system.equipStatus === 'carried' && item.type === 'armour') {
        checkProp = { 'system.equipStatus': "worn" }
      } else if (item.system.equipStatus === 'carried' && item.type != 'armour') {
        checkProp = { 'system.equipStatus': "packed" }
      } else if (item.system.equipStatus === 'worn') {
        checkProp = { 'system.equipStatus': "packed" }
      } else if (item.system.equipStatus === 'packed') {
        checkProp = { 'system.equipStatus': "stored" }
      } else if (item.system.equipStatus === 'stored') {
        checkProp = { 'system.equipStatus': "carried" }
      }
    } else { return }

    await item.update(checkProp);
    this.actor.render(false);
    return;
  }

  //Dropping an actor on an actor
  async _onDropActor(event, data) {
    super._onDropActor(event, data)
  }

  // Change default on Drop Item Create routine for requirements (single items and folder drop)-----------------------------------------------------------------
  async _onDropItemCreate(itemData) {
    const newItemData = await BRPactorItemDrop._BRPonDropItemCreate(this.actor, itemData);
    return this.actor.createEmbeddedDocuments("Item", newItemData);
  }

  //Add Damage
  async _addDamage(event) {
    await BRPDamage.addDamage(event, this.actor, this.token, 0)
  }

  //Heal a Wound
  async _healWound(event) {
    await BRPDamage.treatWound(event, this.actor)
  }

  //Start Attribute modify
  async _onAttribute(event) {
    let att = event.currentTarget.closest('.attribute').dataset.att
    let adj = event.currentTarget.closest('.attribute').dataset.adj
    let checkprop = ""
    let newVal = this.actor.system[att].value
    let newMax = this.actor.system[att].max
    if (adj === 'spend') {
      checkprop = { [`system.${att}.value`]: newVal - 1 }
    } else if (adj === 'recover' && newVal < newMax) {
      checkprop = { [`system.${att}.value`]: newVal + 1 }
    } else { return }

    this.actor.update(checkprop)
  }

  //Static Collapse/Expand Armour on all Hit Locs
  async _onArmourToggle(event) {

    if (!game.settings.get('brp', 'useHPL')) { return }
    let expand = event.shiftKey
    let changes = []

    let hitLocs = this.actor.items.filter(itm => itm.type === "hit-location").map(itm => {
      return { id: itm.id }
    })

    for (let hitLoc of hitLocs) {
      changes.push({
        _id: hitLoc.id,
        'system.hide': expand
      })
    }

    await Item.updateDocuments(changes, { parent: this.actor })

    return
  }


  //Roll Character Stats
  async _onRollStats(event) {
    let confirmation = await BRPUtilities.confirmation('rollStats', 'chatMsg');
    if (!confirmation) { return }
    let results = []
    for (let [key, stat] of Object.entries(this.actor.system.stats)) {
      let checkProp = ""
      if (stat.formula === "") { continue }
      if (key === 'edu' && !game.settings.get('brp', 'useEDU')) { continue }
      let roll = new Roll(stat.formula)
      await roll.evaluate()
      let newVal = Math.round(Number(roll.total))
      checkProp = { [`system.stats.${key}.base`]: newVal }
      let diceRolled = ""
      for (let diceRoll of roll.dice) {
        for (let diceResult of diceRoll.results) {
          if (diceRolled === "") {
            diceRolled = diceResult.result
          } else {
            diceRolled = diceRolled + "," + diceResult.result
          }
        }
      }
      results.push({ label: stat.labelShort, result: newVal, formula: roll.formula, diceRolled: diceRolled })
      await this.actor.update(checkProp)
      if (game.modules.get('dice-so-nice')?.active) {
        game.dice3d.showForRoll(roll, game.user, true, null, false)  //Roll,user,sync,whispher,blind
      }
    }
    let messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor.name }),
      actrImage: this.actor.img,
      results: results
    }
    const messageTemplate = 'systems/brp/templates/chat/rollStats.html'
    let html = await renderTemplate(messageTemplate, messageData);

    let chatData = {};
    let chatType = ""
    if (!foundry.utils.isNewerVersion(game.version, '11')) {
      chatType = CONST.CHAT_MESSAGE_STYLES.OTHER
    } else {
      chatType = CONST.CHAT_MESSAGE_OTHER
    }
    chatData = {
      user: game.user.id,
      type: chatType,
      content: html,
      speaker: {
        actor: this.actor._id,
        alias: this.actor.name,
      },
    }
    let msg = await ChatMessage.create(chatData);
    return
  }

  //Toggle Skill Order
  static async skillOrder(tempActor) {
    await tempActor.update({ 'system.skillOrder': !tempActor.system.skillOrder })
  }

  //Redistribute Characteristics
  async _onRedisttibuteStats(event) {
    let key = event.currentTarget.dataset.stat
    let change = event.currentTarget.dataset.type
    let checkProp = ""
    if (change === 'decrease') {
      //If at maximum redistribute points
      if (this.actor.system.redistDec <= -3 && this.actor.system.stats[key].redist <= 0) { return }
      //Don't go below min stat values
      if ((this.actor.system.stats[key].base + this.actor.system.stats[key].redist) === 3) { return }
      if (['int', 'siz'].includes(key) && ((this.actor.system.stats[key].base + this.actor.system.stats[key].redist) === 8)) { return }
      checkProp = { [`system.stats.${key}.redist`]: this.actor.system.stats[key].redist - 1 }
    }

    if (change === 'increase') {
      //If at maximum redistribute points
      if (this.actor.system.redistInc >= 3 && this.actor.system.stats[key].redist >= 0) { return }
      //Don't exceed 21 stat value
      if ((this.actor.system.stats[key].base + this.actor.system.stats[key].redist) === 21) { return }
      checkProp = { [`system.stats.${key}.redist`]: this.actor.system.stats[key].redist + 1 }
    }
    await this.actor.update(checkProp)
  }

  //Implement Game Settings for Colours
  static renderSheet(sheet, html) {
    if (game.settings.get('brp', 'actorFontColour')) {
      sheet.element.css(
        '--actor-font-colour',
        game.settings.get('brp', 'actorFontColour')
      )
    }
    if (game.settings.get('brp', 'actorTitleColour')) {
      sheet.element.css(
        '--actor-title-colour',
        game.settings.get('brp', 'actorTitleColour')
      )
    }
    if (game.settings.get('brp', 'secBackColour')) {
      sheet.element.css(
        '--labelback',
        game.settings.get('brp', 'secBackColour')
      )
    }
    if (game.settings.get('brp', 'actorBackColour')) {
      sheet.element.css(
        '--actor-sheet-back',
        game.settings.get('brp', 'actorBackColour')
      )
    }
    if (game.settings.get('brp', 'actorTabNameColour')) {
      sheet.element.css(
        '--actor-tab-name-colour',
        game.settings.get('brp', 'actorTabNameColour')
      )
    }
    if (game.settings.get('brp', 'actorTabNameActiveColour')) {
      sheet.element.css(
        '--actor-tab-active-colour',
        game.settings.get('brp', 'actorTabNameActiveColour')
      )
    }
    if (game.settings.get('brp', 'actorTabNameHoverColour')) {
      sheet.element.css(
        '--actor-tab-name-hover-colour',
        game.settings.get('brp', 'actorTabNameHoverColour')
      )
    }
    if (game.settings.get('brp', 'actorTabNameShadowColour')) {
      sheet.element.css(
        '--actor-tab-name-hover-shadow',
        game.settings.get('brp', 'actorTabNameShadowColour')
      )
    }
    if (game.settings.get('brp', 'actorTabActiveShadowColour')) {
      sheet.element.css(
        '--actor-tab-name-active-shadow',
        game.settings.get('brp', 'actorTabActiveShadowColour')
      )
    }
    if (game.settings.get('brp', 'actorRollableColour')) {
      sheet.element.css(
        '--actor-rollable-colour',
        game.settings.get('brp', 'actorRollableColour')
      )
    }
    if (game.settings.get('brp', 'actorRollableShadowColour')) {
      sheet.element.css(
        '--actor-rollable-shadow',
        game.settings.get('brp', 'actorRollableShadowColour')
      )
    }
    if (game.settings.get('brp', 'actorSheetBackground')) {
      let imagePath = "url(/" + game.settings.get('brp', 'actorSheetBackground') + ")"
      sheet.element.css(
        '--actor-back-img',
        imagePath
      )
    }
    if (game.settings.get('brp', 'charSheetMainFont')) {
      let fontSource = "url(/" + game.settings.get('brp', 'charSheetMainFont') + ")"
      const customSheetFont = new FontFace(
        'customSheetFont',
        fontSource
      )
      customSheetFont
        .load()
        .then(function (loadedFace) {
          document.fonts.add(loadedFace)
        })
        .catch(function (error) {
          ui.notifications.error(error)
        })
      sheet.element.css(
        '--actor-main-font',
        'customSheetFont'
      )
    }
    if (game.settings.get('brp', 'charSheetTitleFont')) {
      let fontSource = "url(/" + game.settings.get('brp', 'charSheetTitleFont') + ")"
      const customSheetSecondaryFont = new FontFace(
        'customSheetSecondaryFont',
        fontSource
      )
      customSheetSecondaryFont
        .load()
        .then(function (loadedFace) {
          document.fonts.add(loadedFace)
        })
        .catch(function (error) {
          ui.notifications.error(error)
        })
      sheet.element.css(
        '--actor-title-font',
        'customSheetSecondaryFont'
      )
    }
    if (game.settings.get('brp', 'charSheetMainFontSize')) {
      let fontSize = game.settings.get('brp', 'charSheetMainFontSize') + "px"
      sheet.element.css(
        '--actor-main-font-size',
        fontSize
      )
    }
    if (game.settings.get('brp', 'charSheetTitleFontSize')) {
      let fontSize = game.settings.get('brp', 'charSheetTitleFontSize') + "px"
      sheet.element.css(
        '--actor-title-font-size',
        fontSize
      )
    }








  }

}
