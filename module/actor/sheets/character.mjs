import { BRPContextMenu } from '../../setup/context-menu.mjs';
import { BRPactorItemDrop } from '../actor-itemDrop.mjs';
import { BRPDamage } from '../../combat/damage.mjs';
import { BRPUtilities } from '../../apps/utilities.mjs';
import { BRPRollType } from '../../apps/rollType.mjs';
import { addBRPIDSheetHeaderButton } from '../../brpid/brpid-button.mjs'
import { BRPSelectLists } from '../../apps/select-lists.mjs';
import { BRPActiveEffectSheet } from '../../sheets/brp-active-effect-sheet.mjs';
import { BRPActorSheetV2 } from "./base-actor-sheet.mjs";
import { BRPActor } from '../actor.mjs';

export class BRPCharacterSheet extends BRPActorSheetV2 {
  constructor(options = {}) {
    super(options)
  }

  static DEFAULT_OPTIONS = {
    classes: ['character'],
    position: {
      width: 865,
      height: 850
    },
    window: {
      resizable: true,
    },
  }

  static PARTS = {
    header: {template: 'systems/brp/templates/actor/character.header.hbs'},
    tabs: { template: 'systems/brp/templates/global/parts/actor-tab-navigation.hbs'},
    background: {
      template: 'systems/brp/templates/actor/character.background.hbs',
      scrollable: ['']
    },
    combat: {
      template: 'systems/brp/templates/actor/character.combat.hbs',
      scrollable: [''],
    },
    effects: {
      template: 'systems/brp/templates/actor/character.effects.hbs',
      scrollable: [''],
    },
    items: {
      template: 'systems/brp/templates/actor/character.items.hbs',
      scrollable: [''],
    },
    magic: {
      template: 'systems/brp/templates/actor/character.magic.hbs',
      scrollable: [''],
    },
    mutations: {
      template: 'systems/brp/templates/actor/character.mutations.hbs',
      scrollable: [''],
    },
    pers: {
      template: 'systems/brp/templates/actor/character.pers.hbs',
      scrollable: [''],
    },
    psychics: {
      template: 'systems/brp/templates/actor/character.psychics.hbs',
      scrollable: [''],
    },
    skills: {
      template: 'systems/brp/templates/actor/character.skills.hbs',
      scrollable: [''],
    },
    social: {
      template: 'systems/brp/templates/actor/character.social.hbs',
      scrollable: [''],
    },
    sorcery: {
      template: 'systems/brp/templates/actor/character.sorcery.hbs',
      scrollable: [''],
    },
    statistics: {
      template: 'systems/brp/templates/actor/character.statistics.hbs',
      scrollable: [''],
    },
    super: {
      template: 'systems/brp/templates/actor/character.super.hbs',
      scrollable: [''],
    },
    dev: {
      template: 'systems/brp/templates/actor/character.dev.hbs',
      scrollable: [''],
    },
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    //Common parts to the character - this is the order they are show on the sheet
    options.parts = ['header','tabs','skills','combat','items'];

    if (this.actor.system.magic != "") {
      options.parts.push('magic')
    }
    if (this.actor.system.mutation != "") {
      options.parts.push('mutations')
    }
    if (this.actor.system.psychic != "") {
      options.parts.push('psychics')
    }
    if (this.actor.system.sorcery != "") {
      options.parts.push('sorcery')
    }
    if (this.actor.system.super != "") {
      options.parts.push('super')
    }
    if (game.settings.get('brp', 'useAlleg') || (game.settings.get('brp', 'useReputation') > 0)) {
      options.parts.push('social')
    }
    if (game.settings.get('brp', 'usePersTrait') || (game.settings.get('brp', 'usePassion') > 0)) {
      options.parts.push('pers')
    }
    options.parts.push('statistics','background','effects')
    if (game.settings.get('brp', 'development')) {
      options.parts.push('dev')
    }
  }


  /** @override */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case 'skills':
      case 'combat':
      case 'items':
      case 'social':
      case 'pers':
      case 'statistics':
      case 'effects':
      case 'magic':
      case 'mutations':
      case 'psychics':
      case 'sorcery':
      case 'super':
      case 'background':
      case 'dev':
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }


  _getTabs(parts, context) {
    // If you have sub-tabs this is necessary to change
    const tabGroup = 'primary';
    // Default tab for first time it's rendered this session
    if (!this.tabGroups[tabGroup]) {
      this.tabGroups[tabGroup] = 'combat';
    }

    return parts.reduce((tabs, partId) => {
      const tab = {
        cssClass: '',
        group: tabGroup,
        id: '',
        icon: '',
        label: 'BRP.TABS.',
      };
      switch (partId) {
        case 'header':
        case 'tabs':
          return tabs;
        case 'skills':
        case 'combat':
        case 'items':
        case 'social':
        case 'pers':
        case 'statistics':
        case 'background':
        case 'effects':
        case 'dev':
          tab.id = partId;
          tab.label += partId;
          tab.tooltip = game.i18n.localize("BRP."+partId);
          break;
        case 'magic':
          tab.id = partId;
          tab.label = context.magicLabel.slice(0, 5);
          tab.tooltip = context.magicLabel;
          break;
        case 'mutations':
          tab.id = partId;
          tab.label = context.mutationLabel.slice(0, 5);
          tab.tooltip = context.mutationLabel;
          break;
        case 'psychics':
          tab.id = partId;
          tab.label = context.psychicLabel.slice(0, 5);
          tab.tooltip = context.psychicLabel;
          break;
        case 'sorcery':
          tab.id = partId;
          tab.label = context.sorceryLabel.slice(0, 5);
          tab.tooltip = context.sorceryLabel;
          break;
        case 'super':
          tab.id = partId;
          tab.label = context.superLabel.slice(0,5);
          tab.tooltip = context.superLabel;
          break;
        }
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      tabs[partId] = tab;
      return tabs;
    }, {});
  }



  async _prepareContext(options) {
    let context = await super._prepareContext(options)
    const actorData = this.actor.toObject(false);
    context.logo = game.settings.get('brp', 'charSheetLogo');
    context.useWealth = game.settings.get('brp', 'useWealth');
    context.wealthLabel = game.settings.get('brp', 'wealthLabel');
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
    context.superLabel = game.i18n.localize('BRP.super')
    if (game.settings.get('brp', 'superLabel') != "") { context.superLabel = game.settings.get('brp', 'superLabel') }
    context.psychicLabel = game.i18n.localize('BRP.psychic')
    if (game.settings.get('brp', 'psychicLabel') != "") { context.psychicLabel = game.settings.get('brp', 'psychicLabel') }
    context.mutationLabel = game.i18n.localize('BRP.mutation')
    if (game.settings.get('brp', 'mutationLabel') != "") { context.mutationLabel = game.settings.get('brp', 'mutationLabel') }
    context.sorceryLabel = game.i18n.localize('BRP.sorcery')
    if (game.settings.get('brp', 'sorceryLabel') != "") { context.sorceryLabel = game.settings.get('brp', 'sorceryLabel') }
    //Set Culture, Personality & Profession labels
    context.culture = "";
    let tempCult = (await this.actor.items.filter(itm => itm.type === 'culture'))[0]
    if (tempCult) {
      context.culture = tempCult.name
      context.cultureId = tempCult._id
      context.cultureUsed = true
    } else {
      context.culture = actorData.system.culture
      context.cultureUsed = false
    }

    context.personality = "";
    let tempPers = (await this.document.items.filter(itm => itm.type === 'personality'))[0]
    if (tempPers) {
      context.personality = tempPers.name
      context.personalityId = tempPers._id
      context.personalityUsed = true
    } else {
      context.personality = actorData.system.personalityName
      context.personalityUsed = false
    }

    context.profession = "";
    let tempProf = (await this.document.items.filter(itm => itm.type === 'profession'))[0]
    if (tempProf) {
      context.profession = tempProf.name
      context.professionId = tempProf._id
      context.professionUsed = true
    } else {
      context.profession = actorData.system.professionName
      context.professionUsed = false
    }
    context.xpFixed = "+" + game.settings.get('brp','xpFixed') +"%";
    context.xpFormula = "+" + game.settings.get('brp','xpFormula') + "%";

    //Story Section
    context.storySections = []
    if (context.system.stories instanceof Array && context.system.stories.length) {
      for (const story of context.system.stories) {
        context.storySections.push({
          title: story.title,
          value: story.value,
          enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
            story.value,
            {
              async: true,
              secrets: context.editable
            }
          )
        })
      }
      context.storySections[0].isFirst = true
      context.storySections[context.storySections.length - 1].isLast = true
    }


    await this._prepareItems(context);
    context.rollData = context.actor.getRollData();
    //Get a List of Active Effects for the Actor
    context.effects = await BRPActiveEffectSheet.getActorEffectsFromSheet(this.document)
    context.tabs = this._getTabs(options.parts, context);
    return context
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
    const improve = [];

    // Iterate through items, allocating to containers
    this.actor.system.totalProf = 0
    this.actor.system.totalPers = 0
    this.actor.system.totalXP = 0

    // Add items to containers.
    for (let itm of this.document.items) {
      itm.img = itm.img || DEFAULT_TOKEN;

      if (itm.type === 'gear') {
        itm.system.equippedName = game.i18n.localize('BRP.' + itm.system.equipStatus)
        gears.push(itm);
      } else if (itm.type === 'skill') {
        skillsDev.push(itm)
        if (itm.system.improve) {
          improve.push ({_id: itm._id, name: itm.name, typeLabel: game.i18n.localize('TYPES.Item.'+itm.type), score: itm.system.total - itm.system.effects, opp:false })
        }
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
        if (itm.system.improve) {
          improve.push ({_id: itm._id, name: itm.name, typeLabel: context.magicLabel, score: itm.system.total - itm.system.effects, opp:false })
        }
      } else if (itm.type === 'mutation') {
        mutations.push(itm);
      } else if (itm.type === 'psychic') {
        itm.system.grandTotal = itm.system.total + (this.actor.system.skillcategory[itm.system.category] ?? 0)
        psychics.push(itm);
        this.actor.system.totalProf = this.actor.system.totalProf + itm.system.profession
        this.actor.system.totalPers = this.actor.system.totalPers + itm.system.personal
        this.actor.system.totalXP = this.actor.system.totalXP + itm.system.xp
        if (itm.system.improve) {
          improve.push ({_id: itm._id, name: itm.name, typeLabel: context.psychicLabel, score: itm.system.total - itm.system.effects, opp:false })
        }
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
        if (itm.system.improve) {
          improve.push ({_id: itm._id, name: itm.name, typeLabel: game.i18n.localize('TYPES.Item.'+itm.type), score: itm.system.total, opp:false })
        }
      } else if (itm.type === 'passion') {
        passions.push(itm);
        if (itm.system.improve) {
          improve.push ({_id: itm._id, name: itm.name, typeLabel: game.i18n.localize('TYPES.Item.'+itm.type), score: itm.system.total, opp:false })
        }
      } else if (itm.type === 'persTrait') {
        persTraits.push(itm);
        if (itm.system.improve) {
          improve.push ({_id: itm._id, name: itm.name, typeLabel: game.i18n.localize('TYPES.Item.'+itm.type), score: itm.system.total, opp:false })
        }
        if (itm.system.oppimprove) {
          improve.push ({_id: itm._id, name: itm.system.oppName, typeLabel: game.i18n.localize('TYPES.Item.'+itm.type), score: itm.system.total, opp:true })
        }
      } else if (itm.type === 'reputation') {
        reputations.push(itm);
        if (itm.system.improve) {
          improve.push ({_id: itm._id, name: itm.name, typeLabel: game.i18n.localize('TYPES.Item.'+itm.type), score: itm.system.total, opp:false })
        }
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

    //Sort Improve by Type and Name score
    improve.sort(function (a, b) {
      let x = a.typeLabel;
      let y = b.typeLabel;
      let p = a.name;
      let q = b.name;
      if (x < y) { return -1 };
      if (x > y) { return 1 };
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
    context.persTraits = persTraits.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.gears = gears.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.skills = skills;
    context.skillsDev = skillsDev;
    context.skillsAlpha = skillsAlpha;
    context.hitlocs = hitlocs;
    context.magics = magics.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.mutations = mutations.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.psychics = psychics.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.sorceries = sorceries.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.superpowers = superpowers.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.failings = failings.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.weapons = weapons.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.wounds = wounds;
    context.allegiances = allegiances.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.passions = passions.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.reputations = reputations.sort(function (a, b) {return a.name.localeCompare(b.name)});
    context.improve = improve;
    return context
  }

  //Activate event listeners using the prepared sheet HTML
  _onRender(context, _options) {
    this._dragDrop.forEach((d) => d.bind(this.element));
    this.element.querySelectorAll('.inline-edit').forEach(n => n.addEventListener("change", BRPActorSheetV2.skillInline.bind(this)))
    this.element.querySelectorAll('.addNewSection').forEach(n => n.addEventListener("click", BRPActorSheetV2.createBioSection.bind(this)))
    this.element.querySelectorAll('.move-section-up').forEach(n => n.addEventListener("click", BRPActorSheetV2.moveBioSectionUp.bind(this)))
    this.element.querySelectorAll('.move-section-down').forEach(n => n.addEventListener("click", BRPActorSheetV2.moveBioSectionDown.bind(this)))
    this.element.querySelectorAll('.delete-section').forEach(n => n.addEventListener("dblclick", BRPActorSheetV2.deleteBioSection.bind(this)))


  //Change Font Colours etc if the game settings are populated
    //Colours
    if (game.settings.get('brp', 'actorFontColour')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--brp-colour-primary',game.settings.get('brp', 'actorFontColour')))
    }
    if (game.settings.get('brp', 'actorTitleColour')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--brp-colour-secondary',game.settings.get('brp', 'actorTitleColour')))
    }
    if (game.settings.get('brp', 'actorTertiaryColour')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--brp-colour-tertiary',game.settings.get('brp', 'actorTertiaryColour')))
    }
    if (game.settings.get('brp', 'brpIconPrimary')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--brp-icon-primary',game.settings.get('brp', 'brpIconPrimary')))
    }
    if (game.settings.get('brp', 'secBackColour')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--brp-labelback',game.settings.get('brp', 'secBackColour')))
    }
    if (game.settings.get('brp', 'actorRollableColour')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-rollable-colour',game.settings.get('brp', 'actorRollableColour')))
    }
    if (game.settings.get('brp', 'actorRollableShadowColour')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-rollable-shadow',game.settings.get('brp', 'actorRollableShadowColour')))
    }
    if (game.settings.get('brp', 'actorBackColour')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-sheet-back',game.settings.get('brp', 'actorBackColour')))
    }
    if (game.settings.get('brp', 'actorTabNameColour')) {
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-tab-name-colour',game.settings.get('brp', 'actorTabNameColour')))
    }

    //Font Size - TODO need to review character sheet to see it impacts everywhere
    if (game.settings.get('brp', 'charSheetMainFontSize')) {
      let fontSize = game.settings.get('brp', 'charSheetMainFontSize')+'px'
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-main-font-size',fontSize))
    }
    if (game.settings.get('brp', 'charSheetTitleFontSize')) {
      let fontSize = game.settings.get('brp', 'charSheetTitleFontSize')+'px'
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-title-font-size',fontSize))
    }


    //Sheet Background
    if (game.settings.get('brp', 'actorSheetBackground')) {
      let imagePath = "url(/" + game.settings.get('brp', 'actorSheetBackground') + ")"
      document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-back-img',imagePath))
    }


    //Fonts
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
        document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-main-font','customSheetFont'))
    }

    if (game.settings.get('brp', 'charSheetTitleFont')) {
      let fontSource = "url(/" + game.settings.get('brp', 'charSheetTitleFont') + ")"
      const customTitleFont = new FontFace(
        'customTitleFont',
        fontSource
      )
      customTitleFont
        .load()
        .then(function (loadedFace) {
          document.fonts.add(loadedFace)
        })
        .catch(function (error) {
          ui.notifications.error(error)
        })
        document.querySelectorAll('.brp.actor').forEach(el=>el.style.setProperty('--actor-title-font','customTitleFont'))
    }

  }
}
