import { BRPactorItemDrop } from './actor-itemDrop.mjs'
import { BRPID } from '../brpid/brpid.mjs';

export class BRPActor extends Actor {

  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {
    this.system.brpidFlagItems = {}
    for (const i of this.items) {
      if (i.flags.brp?.brpidFlag?.id) {
        const parts = i.flags.brp?.brpidFlag?.id.match(/^([^\.]+)\.([^\.]+)\.([^\.]+)$/)
        if (parts) {
          if (typeof this.system.brpidFlagItems[parts[1]] === 'undefined') {
            this.system.brpidFlagItems[parts[1]] = {}
          }
          if (typeof this.system.brpidFlagItems[parts[1]][parts[2]] === 'undefined') {
            this.system.brpidFlagItems[parts[1]][parts[2]] = {}
          }
          this.system.brpidFlagItems[parts[1]][parts[2]][parts[3]] = i
        }
      }
    }
  }

  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.boilerplate || {};

    //Prepare data for different actor types
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  //Prepare Character specific data
  async _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;
    const systemData = actorData.system;
    this._prepStats(actorData)
    this._prepDerivedStats(actorData)

    systemData.health.value = systemData.health.max;

    //Initialise Powers IDs
    systemData.magic = "";
    systemData.mutation = "";
    systemData.psychic = "";
    systemData.sorcery = "";
    systemData.super = "";

    //Initialise health statuses and other values
    systemData.dead = false;
    systemData.severed = false;
    systemData.unconscious = false;
    systemData.injured = false;
    systemData.incapacitated = false;
    systemData.bleeding = false
    systemData.enc = 0;
    systemData.av1 = 0;
    systemData.av2 = 0;
    systemData.avr1 = "";
    systemData.avr2 = "";
    systemData.psCurr = 0;
    systemData.psMax = 0;

    //Set Hit Location AP to zero
    for (let itm of actorData.items) {

      if (itm.type === 'hit-location') {
        itm.system.av1 = 0
        itm.system.av2 = 0
        itm.system.avr1 = ""
        itm.system.avr2 = ""
        itm.system.enc = 0
        itm.system.ppCurr = 0
        itm.system.pSCurr = 0
        itm.system.mnplmod = 0
        itm.system.percmod = 0
        itm.system.physmod = 0
        itm.system.stealthmod = 0
      }
    }

    //Calculate Skill Category Bonuses
    for (let itm of actorData.items) {
      if (itm.type === 'skillcat') {
        let bonus = 0;
        if (game.settings.get('brp', 'skillBonus') === "1" && itm.system.stat != 'none') {
          bonus = Math.ceil(systemData.stats[itm.system.stat].total / 2);
        } else if (game.settings.get('brp', 'skillBonus') === "2") {
          for (let [key, value] of Object.entries(itm.system.attrib)) {
            if (key === 'edu' && !game.settings.get('brp', 'useEDU')) { continue }

            switch (value) {
              case "0":    //No adjustment
                break;
              case "1":    //Primary
                bonus += this._categoryprimary(systemData.stats[key].total)
                break;
              case "2":    //Secondary
                bonus += this._categorysecondary(systemData.stats[key].total)
                break;
              case "3":    //Negative
                bonus += this._categorynegative(systemData.stats[key].total)
                break;
              case "4":    //Negative Secondary
                bonus += this._categorynegsec(systemData.stats[key].total)
                break;
            }
          }
        }
        itm.system.bonus = bonus
        itm.system.total = itm.system.bonus + itm.system.mod
        let key = itm.flags.brp.brpidFlag.id
        systemData.skillcategory[key] = itm.system.total;
      }
    }

    //Calcualte/adjust scores for items (itm)
    for (let itm of actorData.items) {

      //Does the item have transferrable effects
      if (['gear', 'armour', 'weapon'].includes(itm.type)) {
        if (itm.transferredEffects.length > 0) {
          itm.system.hasEffects = true;
        } else {
          itm.system.hasEffects = false;
        }
      }

      //If skill, magic or psychic calculate the total score and record the category bonus
      if (itm.type === 'skill' || itm.type === 'magic' || itm.type === 'psychic') {
        itm.system.total = itm.system.base + itm.system.xp + itm.system.effects + itm.system.profession + itm.system.personality + itm.system.personal + itm.system.culture
        itm.system.catBonus = systemData.skillcategory[itm.system.category]

        //If Allegiance the set total and potential Ally status
      } else if (itm.type === 'allegiance') {
        itm.system.total = itm.system.allegPoints + itm.system.xp
        itm.system.potAlly = false

        //If Passion the set total
      } else if (itm.type === 'passion') {
        itm.system.total = itm.system.base + itm.system.xp

        //If Personality Trait the set total
      } else if (itm.type === 'persTrait') {
        itm.system.total = Math.max(0, Math.min(100, itm.system.base + itm.system.xp))
        itm.system.opptotal = 100 - itm.system.total

        //If Reputation set total
      } else if (itm.type === 'reputation') {
        itm.system.total = itm.system.base

        //If gear/weapon, calculates the encumbrance
      } else if (['gear', 'weapon'].includes(itm.type)) {
        if (itm.system.equipStatus === 'carried') {
          itm.system.actlEnc = itm.system.quantity * itm.system.enc
          systemData.enc = Number(systemData.enc + itm.system.actlEnc)
        } else { itm.system.actlEnc = 0 }

        if (itm.system.equipStatus != 'stored') {
          if (itm.system.pSCurr > 0) { systemData.psCurr = systemData.psCurr + itm.system.pSCurr }
          if (itm.system.pSMax > 0) { systemData.psMax = systemData.psMax + itm.system.pSMax }
        }

        //Does the item have transferrable effects
        if (itm.transferredEffects.length > 0) {
          itm.system.hasEffects = true;
        } else {
          itm.system.hasEffects = false;
        }

        //If armour
      } else if (itm.type === 'armour') {
        //Calc encumbrance based on carry status and if using HPL
        if (itm.system.equipStatus === 'carried') {
          if (game.settings.get('brp', 'useHPL')) {
            itm.system.actlEnc = Math.round(itm.system.quantity * itm.system.enc / actorData.items.get(itm.system.hitlocID).system.fractionENC * 10) / 10
          } else {
            itm.system.actlEnc = Number(itm.system.quantity * itm.system.enc)
          }
          //If not carried then zero ENC
        } else {
          itm.system.actlEnc = 0
        }
        systemData.enc = systemData.enc + itm.system.actlEnc
        if (itm.system.equipStatus != 'stored') {
          if (itm.system.pSCurr > 0) { systemData.psCurr = systemData.psCurr + itm.system.pSCurr }
          if (itm.system.pSMax > 0) { systemData.psMax = systemData.psMax + itm.system.pSMax }
          if (game.settings.get('brp', 'useHPL')) {
            let hitLoc = actorData.items.get(itm.system.hitlocID)
            hitLoc.system.ppCurr += itm.system.ppCurr
            hitLoc.system.pSCurr += Number(itm.system.pSCurr)
          }
        }


        //Add the Armour Point Score to the Hit Location if worn
        if (itm.system.equipStatus === 'worn') {
          if (game.settings.get('brp', 'useHPL')) {
            let hitLoc = actorData.items.get(itm.system.hitlocID)
            hitLoc.system.av1 += itm.system.av1
            hitLoc.system.mnplmod += itm.system.mnplmod
            hitLoc.system.percmod += itm.system.percmod
            hitLoc.system.physmod += itm.system.physmod
            hitLoc.system.stealthmod += itm.system.stealthmod
            if (itm.system.av2 > 0) {
              hitLoc.system.av2 += itm.system.av2
            }
            if (itm.system.avr1 != "") {
              hitLoc.system.avr1 += "+" + itm.system.avr1
            }
            if (itm.system.avr2 != "") {
              hitLoc.system.avr2 += "+" + itm.system.avr2
            }
          } else {
            systemData.av1 += itm.system.av1
            systemData.av2 += itm.system.av2
            if (itm.system.avr1 != "") {
              systemData.avr1 += "+" + itm.system.avr1
            }
            if (itm.system.avr2 != "") {
              systemData.avr2 += "+" + itm.system.avr2
            }
          }
        }
        if (game.settings.get('brp', 'useHPL')) {
          let hitLoc = actorData.items.get(itm.system.hitlocID)
          hitLoc.system.enc += itm.system.actlEnc
        }
        //If power then record the ID against the category
      } else if (itm.type === 'power') {
        systemData[itm.system.category] = itm._id;
      } else if (itm.type === 'profession') {
        systemData.profession = itm.name
        systemData.professionId = itm._id;
        //If hit locations calculation HPL max and current and statuses
      } else if (itm.type === 'hit-location' && game.settings.get('brp', 'useHPL')) {
        itm.system.injured = false;
        itm.system.maxHP = Math.max((Math.ceil(systemData.health.max / itm.system.fractionHP) + itm.system.adj), 0);
        itm.system.currHP = itm.system.maxHP
        //Loop through items (wnd) to find wounds
        for (let wnd of actorData.items) {
          if (wnd.type === 'wound' && wnd.system.locId === itm._id) {
            itm.system.currHP = itm.system.currHP - wnd.system.value
          }
        }
        if (itm.system.currHP < 1 && itm.system.locType === 'limb') {
          itm.system.injured = true
        } else if (itm.system.currHP < 1 && itm.system.locType === 'abdomen') {
          itm.system.injured = true
          systemData.injured = true
        } else if (itm.system.currHP < 1 && itm.system.locType === 'chest') {
          itm.system.incapacitated = true
          systemData.incapacitated = true
        } else if (itm.system.currHP < 1 && itm.system.locType === 'head') {
          itm.system.unconscious = true
          systemData.unconscious = true
        }
        if (itm.system.bleeding) { systemData.bleeding = true }
        if (itm.system.unconscious) { systemData.unconscious = true }
        if (itm.system.incapacitated) { systemData.incapacitated = true }
        if (itm.system.severed) { systemData.severed = true }
        if (itm.system.dead) { systemData.dead = true }
        //If wound calculate total HPL
      } else if (itm.type === 'wound') {
        systemData.health.value = systemData.health.value - itm.system.value
      }

    }

    //Calculate allegiance target
    let allegiances = actorData.items.filter(itm => itm.type === 'allegiance')
    allegiances.sort(function (a, b) {
      let x = a.system.total;
      let y = b.system.total;
      if (x < y) { return 1 };
      if (x > y) { return -1 };
      return 0;
    });
    //If there is one allegiance
    let ally = ""
    if (allegiances.length === 1 && allegiances[0].system.total >= 20) {
      actorData.items.get(allegiances[0]._id).system.potAlly = true
    } else if (allegiances.length > 1 && (allegiances[0].system.total - allegiances[1].system.total) >= 20) {
      actorData.items.get(allegiances[0]._id).system.potAlly = true
    }


    //Round ENC to 2 decimals and then adjust fatigue
    systemData.enc = (systemData.enc).toFixed(2)
    systemData.fatigue.max = Math.ceil(systemData.stats.str.total + systemData.stats.con.total - systemData.enc + systemData.fatigue.mod + (systemData.fatigue.effects ?? 0));

    //Derive Health Statuses from total HP
    if (systemData.health.value < 1) {
      systemData.dead = true;
    } else if (systemData.health.value < 3) {
      systemData.unconscious = true;
    }
  }

  //Prepare NPC specific data.
  async _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;
    const systemData = actorData.system;
    this._prepStats(actorData)
    this._prepDerivedStats(actorData)

    for (let [key, stat] of Object.entries(actorData.system.baseStats)) {
      stat.label = game.i18n.localize(CONFIG.BRP.stats[key]) ?? key;
      stat.labelShort = game.i18n.localize(CONFIG.BRP.statsAbbreviations[key]) ?? key;
      //Mark all stats as visible except for EDU where it's not being used
      stat.visible = true;
      if (key === 'edu' && !game.settings.get('brp', 'useEDU')) { stat.visible = false }
    }


    let damage = 0
    systemData.fatigue.max = Math.ceil(systemData.stats.str.total + systemData.stats.con.total + systemData.fatigue.mod + (systemData.fatigue.effects ?? 0));

    for (let itm of actorData.items) {
      if (['skill', 'psychic', 'magic', 'passion', 'reputation'].includes(itm.type)) {
        itm.system.total = itm.system.base;
      } else if (['allegiance'].includes(itm.type)) {
        itm.system.total = itm.system.allegPoints;
      } else if (['persTrait'].includes(itm.type)) {
        itm.system.total = itm.system.base;
        itm.system.opptotal = 100 - itm.system.base;
      }
      else if (itm.type === 'hit-location' && game.settings.get('brp', 'useHPL')) {
        itm.system.injured = false;
        itm.system.maxHP = Math.max((Math.ceil(systemData.health.max / itm.system.fractionHP) + itm.system.adj), 0);
        damage = damage + Math.max(itm.system.maxHP - itm.system.currHP, 0)
      }
    }

    //If using HPL then set current health
    if (game.settings.get('brp', 'useHPL')) {
      systemData.health.value = systemData.health.max - damage
    }
  }


  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  // Prepare character roll data.
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

    // Copy the ability scores to the top level
    if (data.stats) {
      for (let [k, v] of Object.entries(data.stats)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
  }

  // Prepare NPC roll data
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;
  }


  //Prepare Stats
  _prepStats(actorData) {
    // Loop through ability scores, calculating total and derived scores
    actorData.system.redistInc = 0
    actorData.system.redistDec = 0
    for (let [key, stat] of Object.entries(actorData.system.stats)) {
      stat.label = game.i18n.localize(CONFIG.BRP.stats[key]) ?? key;
      stat.labelShort = game.i18n.localize(CONFIG.BRP.statsAbbreviations[key]) ?? key;
      stat.labelDeriv = game.i18n.localize(CONFIG.BRP.statsDerived[key]) ?? key;
      stat.total = Number(stat.base) + Number(stat.redist) + Number(stat.culture) + Number(stat.exp) + Number(stat.effects) + Number(stat.age);
      stat.deriv = stat.total * 5;
      if (stat.redist < 0) { actorData.system.redistDec = actorData.system.redistDec + stat.redist }
      if (stat.redist > 0) { actorData.system.redistInc = actorData.system.redistInc + stat.redist }

      //Mark all stats as visible except for EDU where it's not being used
      stat.visible = true;
      if (key === 'edu' && !game.settings.get('brp', 'useEDU')) { stat.visible = false }
    }
    if (actorData.type === 'npc')
      for (let [key, stat] of Object.entries(actorData.system.baseStats)) {
        stat.labelShort = game.i18n.localize(CONFIG.BRP.statsAbbreviations[key]) ?? key;
        //Mark all stats as visible except for EDU where it's not being used
        stat.visible = true;
        if (key === 'edu' && !game.settings.get('brp', 'useEDU')) { stat.visible = false }
      }
    actorData.system.redistTotal = actorData.system.redistInc + actorData.system.redistDec
  }

  // Calculate derived scores
  _prepDerivedStats(actorData) {
    let systemData = actorData.system
    if (actorData.type === 'character') {
      systemData.health.max = Math.ceil((systemData.stats.con.total + systemData.stats.siz.total) * game.settings.get('brp', 'hpMod') / 2) + systemData.health.mod + (systemData.health.effects ?? 0);
    } else {
      let health = 0
      let formula = ""
      let statCount = 0
      if (systemData.hp.stat1 != 'none') {
        health += systemData.stats[systemData.hp.stat1].total
        statCount++
        formula = game.i18n.localize(CONFIG.BRP.statsAbbreviations[systemData.hp.stat1])
      }
      if (systemData.hp.stat2 != 'none') {
        health += systemData.stats[systemData.hp.stat2].total
        statCount++
        if (statCount === 2) { formula = formula + " + " }
        formula = formula + game.i18n.localize(CONFIG.BRP.statsAbbreviations[systemData.hp.stat2])
      }
      health = Math.ceil(health * systemData.hp.multi)
      if (statCount === 1) {
        formula = "(" + formula + " * " + systemData.hp.multi + ")"
      } else if (statCount === 2) {
        formula = "((" + formula + ") * " + systemData.hp.multi + ")"
      }
      if (systemData.health.mod < 0) {
        formula = formula + " " + systemData.health.mod
      } else if (systemData.health.mod > 0) {
        formula = formula + " + " + systemData.health.mod
      }
      systemData.hp.formula = formula
      systemData.health.max = health + (systemData.health.mod ?? 0) + (systemData.health.effects ?? 0);
    }
    systemData.health.mjrwnd = Math.ceil(systemData.health.max / 2);
    systemData.power.max = systemData.stats.pow.total + systemData.power.mod + (systemData.power.effects ?? 0);
    systemData.xpBonus = Math.ceil(systemData.stats.int.total / 2);
    systemData.dmgBonus = this._damageBonus(systemData.stats.str.total + systemData.stats.siz.total)

    //Set Resource Labels
    if (game.settings.get('brp', 'ppLabelLong')) {
      systemData.power.label = game.settings.get('brp', 'ppLabelLong')
    } else {
      systemData.power.label = game.i18n.localize('BRP.pp')
    }
    if (game.settings.get('brp', 'ppLabelShort')) {
      systemData.power.labelAbbr = game.settings.get('brp', 'ppLabelShort')
    } else {
      systemData.power.labelAbbr = game.i18n.localize('BRP.ppShort')
    }
    if (game.settings.get('brp', 'hpLabelLong')) {
      systemData.health.label = game.settings.get('brp', 'hpLabelLong')
    } else {
      systemData.health.label = game.i18n.localize('BRP.health')
    }
    if (game.settings.get('brp', 'hpLabelShort')) {
      systemData.health.labelAbbr = game.settings.get('brp', 'hpLabelShort')
    } else {
      systemData.health.labelAbbr = game.i18n.localize('BRP.hp')
    }
    if (game.settings.get('brp', 'fpLabelLong')) {
      systemData.fatigue.label = game.settings.get('brp', 'fpLabelLong')
    } else {
      systemData.fatigue.label = game.i18n.localize('BRP.fatigue')
    }
    if (game.settings.get('brp', 'fpLabelShort')) {
      systemData.fatigue.labelAbbr = game.settings.get('brp', 'fpLabelShort')
    } else {
      systemData.fatigue.labelAbbr = game.i18n.localize('BRP.fp')
    }
    if (game.settings.get('brp', 'res5LabelLong')) {
      systemData.res5.label = game.settings.get('brp', 'res5LabelLong')
    } else {
      systemData.res5.label = game.i18n.localize('BRP.res5')
    }
    if (game.settings.get('brp', 'res5LabelShort')) {
      systemData.res5.labelAbbr = game.settings.get('brp', 'res5LabelShort')
    } else {
      systemData.res5.labelAbbr = game.i18n.localize('BRP.res5Abbr')
    }
  }

  //Used for Rolling NPCs when token dropped
  get hasRollableCharacteristics() {
    for (const [, value] of Object.entries(this.system.baseStats)) {
      if (isNaN(Number(value.random))) return true
      if (isNaN(Number(value.average))) return true
    }
    return false
  }

  //Roll Random Stats
  async rollCharacteristicsValue() {
    const stats = {}
    for (const [key, value] of Object.entries(this.system.baseStats)) {
      if (value.random && !value.random.startsWith('@')) {
        const r = new Roll(value.random)
        await r.evaluate()
        if (r.total) {
          stats[`system.stats.${key}.base`] = Math.floor(
            r.total
          )
        }
      }
    }
    await this.update(stats)
    await this.updateVitals()
  }

  //Roll Average Stats
  async averageCharacteristicsValue() {
    const stats = {}
    for (const [key, value] of Object.entries(this.system.baseStats)) {
      if (value.average && !value.average.startsWith('@')) {
        const r = new Roll(value.average)
        await r.evaluate()
        if (r.total) {
          stats[`system.stats.${key}.base`] = Math.floor(
            r.total
          )
        }
      }
    }
    await this.update(stats)
    await this.updateVitals()
  }

  //Update Current HP, FP etc and HPL when Rolled or Average Roll
  async updateVitals() {
    let checkProp = {
      'system.health.value': this.system.health.max,
      'system.power.value': this.system.power.max,
      'system.fatigue.value': this.system.fatigue.max,
      'system.sanity.value': this.system.sanity.max
    }
    await this.update(checkProp)
    if (game.settings.get('brp', 'useHPL')) {
      let hitLocs = this.items.filter(itm => itm.type === 'hit-location').map(itm => {
        return { _id: itm.id, 'system.currHP': itm.system.maxHP }
      })
      await Item.updateDocuments(hitLocs, { parent: this })
    }
  }

  //Create a new actor - When creating an actor set basics including tokenlink, bars, displays sight
  static async create(data, options = {}) {
    //If dropping from compendium check to see if the actor already exists in game.actors and if it does then get the game.actors details rather than create a copy
    if (options.fromCompendium) {
      let tempActor = await (game.actors.filter(actr => actr.flags.brp.brpidFlag.id === data.flags.brp.brpidFlag.id && actr.flags.brp.brpidFlag.priority === data.flags.brp.brpidFlag.priority))[0]
      if (tempActor) { return tempActor }
    }


    if (data.type === 'character') {
      data.prototypeToken = foundry.utils.mergeObject({
        actorLink: true,
        disposition: 1,
        displayName: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        displayBars: CONST.TOKEN_DISPLAY_MODES.ALWAYS,
        sight: {
          enabled: true
        },
        detectionModes: [{
          id: 'basicSight',
          range: 30,
          enabled: true
        }]
      }, data.prototypeToken || {})
    }

    let actor = await super.create(data, options)

    //Add BRPID based on actor name if the game setting is flagged.
    if (game.settings.get('brp', "actorBRPID")) {
      let tempID = await BRPID.guessId(actor)
      if (tempID) {
        await actor.update({ 'flags.brp.brpidFlag.id': tempID })
        const html = $(actor.sheet.element).find('header.window-header a.header-button.edit-brpid-warning,header.window-header a.header-button.edit-brpid-exisiting')
        if (html.length) {
          html.css({
            color: (tempID ? 'orange' : 'red')
          })
        }
        actor.render()
      }
    }


    //Set up a general hit location for a new actor if using HPL
    if (actor.type === 'character' && game.settings.get('brp', 'useHPL')) {
      let brpid = "i.hit-location.general"

      const itemData = [{
        name: game.i18n.localize('BRP.general'),
        type: 'hit-location',
        img: 'systems/brp/assets/Icons/arm-bandage.svg',
        flags: { brp: { brpidFlag: { id: "i.hit-location.general" } } },
        system: {
          "fractionHP": 1,
          "fractionENC": 1,
          "lowRoll": 0,
          "highRoll": 0,
          "locType": "general"
        }
      }];
      const newItem = await Item.createDocuments(itemData, { parent: actor });
    }

    //Add Starter Skills if toggled on
    if (actor.type === 'character' && game.settings.get('brp', 'starterSkills')) {
      let newSkills = []
      let skillList = (await game.system.api.brpid.fromBRPIDRegexBest({ brpidRegExp: new RegExp('^i.skill'), type: 'i' })).filter(itm => itm.system.basic)
      for (let itm of skillList) {
        if (actor.items.filter(nitm => nitm.flags.brp.brpidFlag.id === itm.flags.brp.brpidFlag.id).length < 1) {
          itm.system.base = await BRPactorItemDrop._calcBase(itm, actor);
          newSkills.push(itm);
        }
      }
      await Item.createDocuments(newSkills, { parent: actor });
      await BRPActor.charBaseSkillScores(actor);
    }

    //Add Starter Traits if toggled on
    if (actor.type === 'character' && game.settings.get('brp', 'starterTraits') && game.settings.get('brp', 'usePersTrait')) {
      let newTraits = []
      let traitList = (await game.system.api.brpid.fromBRPIDRegexBest({ brpidRegExp: new RegExp('^i.persTrait'), type: 'i' })).filter(itm => itm.system.basic)
      for (let itm of traitList) {
        if (actor.items.filter(nitm => nitm.flags.brp.brpidFlag.id === itm.flags.brp.brpidFlag.id).length < 1) {
          newTraits.push(itm);
        }
      }
      await Item.createDocuments(newTraits, { parent: actor });
    }



    //Add Skill Categories
    if (actor.type === 'character') {
      let newSkillCats = []
      let skillCatList = (await game.system.api.brpid.fromBRPIDRegexBest({ brpidRegExp: new RegExp('^i.skillcat'), type: 'i' }))
      for (let itm of skillCatList) {
        if (actor.items.filter(nitm => nitm.flags.brp.brpidFlag.id === itm.flags.brp.brpidFlag.id).length < 1) {
          newSkillCats.push(itm)
        }
      }
      await Item.createDocuments(newSkillCats, { parent: actor })
    }
    return actor
  }

  //Recalculate all skill base scores
  static async charBaseSkillScores(actor) {
    let change = []
    for (let itm of actor.items) {
      if (itm.type != 'skill') { continue }
      let baseScore = await BRPactorItemDrop._calcBase(itm, actor)
      change.push({ _id: itm._id, "system.base": baseScore })
    }
    await Item.updateDocuments(change, { parent: actor })
  }

  // Primary Skills Bonus
  _categoryprimary(statvalue) {
    var bonus = statvalue - 10;
    return bonus;
  }

  // Secondary Skills Bonus
  _categorysecondary(statvalue) {
    var bonus = (statvalue - 10) / 2
    if (bonus < 0) {
      bonus = Math.ceil(bonus);
    } else {
      bonus = Math.floor(bonus);
    }
    return bonus;
  }

  // Negative Skills Bonus
  _categorynegative(statvalue) {
    var bonus = 10 - statvalue;
    return bonus;
  }

  // Negative Secondary Skills Bonus
  _categorynegsec(statvalue) {
    var bonus = (10 - statvalue) / 2
    if (bonus < 0) {
      bonus = Math.ceil(bonus);
    } else {
      bonus = Math.floor(bonus);
    }
    return bonus;
  }

  //Damage Bonus
  _damageBonus(value) {
    let dmgBonus = {}
    if (value < 13) {
      dmgBonus.full = '-1D6'
      dmgBonus.half = '-1D3'
    } else if (value < 17) {
      dmgBonus.full = '-1D4'
      dmgBonus.half = '-1D2'
    } else if (value < 25) {
      dmgBonus.full = '+0'
      dmgBonus.half = '+0'
    } else if (value < 33) {
      dmgBonus.full = '+1D4'
      dmgBonus.half = '+1D2'
    } else if (value < 41) {
      dmgBonus.full = '+1D6'
      dmgBonus.half = '+1D3'
    } else {
      dmgBonus.full = "+" + (Math.ceil((value - 40) / 16) + 1) + "D6"
      dmgBonus.half = "+" + (Math.ceil((value - 40) / 16) + 1) + "D3"
    }
    return dmgBonus
  }
}
