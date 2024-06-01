import {BRPactorItemDrop} from './actor-itemDrop.mjs'

export class BRPActor extends Actor {

  prepareData() {
    super.prepareData();
  }

  prepareBaseData() {
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
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;
    const systemData = actorData.system;
    this._prepStats(actorData)
    this._prepDerivedStats(actorData)

    systemData.health.value = systemData.health.max;
 
    //Initialise Powers, Personality item IDs
    systemData.magic = "";
    systemData.mutation = "";
    systemData.psychic = "";
    systemData.sorcery = "";
    systemData.super = "";
    systemData.personality = "";


    // Calculate the Skill Category Bonuses */ 
    // 0 = No Bonus, 1 = Simple option, 2 = Advanced option
    for (let [key, category] of Object.entries(systemData.skillcategory)) {
      let categoryid=key;
      let modifiervalue=0;
      if (game.settings.get('brp','skillBonus') === "2"){    
        switch (categoryid) {
          case "zcmbtmod":
            modifiervalue=this._categoryprimary(systemData.stats.dex.total)+this._categorysecondary(systemData.stats.int.total)+this._categorysecondary(systemData.stats.str.total);
            break;
          case "cmmnmod":
            modifiervalue=this._categoryprimary(systemData.stats.int.total)+this._categorysecondary(systemData.stats.pow.total)+this._categorysecondary(systemData.stats.cha.total);
            break;
          case "mnplmod":
            modifiervalue=this._categoryprimary(systemData.stats.dex.total)+this._categorysecondary(systemData.stats.int.total)+this._categorysecondary(systemData.stats.str.total)
            break;
          case "mntlmod":
            modifiervalue=this._categoryprimary(systemData.stats.int.total)+this._categorysecondary(systemData.stats.pow.total);
            if (game.settings.get('brp','useEDU')) {
              modifiervalue = modifiervalue +this._categorysecondary(systemData.stats.edu.total);
            }
            break;
          case "percmod":
            modifiervalue=this._categoryprimary(systemData.stats.int.total)+this._categorysecondary(systemData.stats.pow.total)+this._categorysecondary(systemData.stats.con.total);
            break;
          case "physmod":
            modifiervalue=this._categoryprimary(systemData.stats.dex.total)+this._categorysecondary(systemData.stats.str.total)+this._categorysecondary(systemData.stats.con.total)+this._categorynegative(systemData.stats.siz.total);
            break;
        }
      } else if (game.settings.get('brp','skillBonus') === "1") {
        switch (categoryid) {
          case "zcmbtmod":
            modifiervalue=Math.ceil(systemData.stats.dex.total/2);
            break;
          case "cmmnmod":
            modifiervalue=Math.ceil(systemData.stats.cha.total/2);
            break;
          case "mnplmod":
            modifiervalue=Math.ceil(systemData.stats.dex.total/2);
            break;
          case "mntlmod":
            modifiervalue=Math.ceil(systemData.stats.int.total/2);
            break;
          case "percmod":
            modifiervalue=Math.ceil(systemData.stats.pow.total/2);
            break;
          case "physmod":
            modifiervalue=Math.ceil(systemData.stats.str.total/2);
            break;        
        } 
      }
      systemData.skillcategory[key].bonus=modifiervalue;
    }

    //Initialise health statuses
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

    //Set Hit Location AP to zero
    for (let itm of actorData.items) {
      if (itm.type === 'hit-location') {
        itm.system.av1 = 0
        itm.system.av2 = 0
        itm.system.avr1 = ""
        itm.system.avr2 = ""
      }
    }
    
    //Calcualte/adjust scores for items (itm)
    for (let itm of actorData.items) {
      //If skill, magic or psychic calculate the total score and record the category bonus
      if (itm.type === 'skill' || itm.type === 'magic' || itm.type === 'psychic') {
        itm.system.total = itm.system.base + itm.system.xp + itm.system.effects + itm.system.profession + itm.system.personality + itm.system.personal
        itm.system.catBonus = systemData.skillcategory[itm.system.category].bonus

      //If Allegiance the set total and potential Ally status
      } else if (itm.type === 'allegiance') {  
        itm.system.total = itm.system.allegPoints + itm.system.xp
        itm.system.potAlly = false

      //If Passion the set total 
      } else if (itm.type === 'passion') {  
        itm.system.total = itm.system.base + itm.system.xp
        
      //If gear/weapon, calculates the encumbrance
      } else if (['gear' , 'weapon'].includes (itm.type)) {
        if (itm.system.equipStatus === 'carried') {
          itm.system.actlEnc = itm.system.quantity * itm.system.enc
          systemData.enc = Number(systemData.enc + itm.system.actlEnc)
        } else {itm.system.actlEnc = 0}

      //If armour
      } else if (itm.type === 'armour') {
        //Calc encumbrance based on carry status and if using HPL
        if (itm.system.equipStatus === 'carried') {
          if (game.settings.get('brp','useHPL')) {
            itm.system.actlEnc = Math.round(itm.system.quantity * itm.system.enc / actorData.items.get(itm.system.hitlocID).system.fractionENC *10)/10
          } else {
            itm.system.actlEnc = Number(itm.system.quantity * itm.system.enc)
         }
        //If not carried then zero ENC
        } else {
          itm.system.actlEnc = 0
        } 
        systemData.enc = systemData.enc + itm.system.actlEnc
        
        //Add the Armour Point Score to the Hit Location if worn
        if (itm.system.equipStatus === 'worn'){
          if (game.settings.get('brp','useHPL')) {
            let hitLoc = actorData.items.get(itm.system.hitlocID) 
            hitLoc.system.av1+=itm.system.av1
            if (itm.system.av2 > 0) { 
              hitLoc.system.av2+=itm.system.av2
            } else {
              hitLoc.system.av2+=itm.system.av1
            }
            hitLoc.system.avr1+="+" + itm.system.avr1
            if (itm.system.avr2 != "") {
              hitLoc.system.avr2+="+" + itm.system.avr2
            } else {
              hitLoc.system.avr2+="+" + itm.system.avr1
            }
        } else {
          systemData.av1+=itm.system.av1
          systemData.av2+=itm.system.av2
          systemData.avr1+="+" + itm.system.avr1
          if (itm.system.avr2 != "") {
            systemData.avr2+="+" + itm.system.avr2
          } else {
            systemData.avr2+="+" + itm.system.avr1
          }
        }
        }
        //If power then record the ID against the category  
      } else if (itm.type === 'power') {
        systemData[itm.system.category] = itm._id;
      //If personality get the name and record the ID  
      } else if (itm.type === 'personality') {
        systemData.personality = itm.name
        systemData.personalityId = itm._id;
      //If profession then get the name and record the ID  
      } else if (itm.type === 'profession') {
        systemData.profession = itm.name
        systemData.professionId = itm._id;
      //If hit locations calculation HPL max and current and statuses  
      } else if (itm.type === 'hit-location' && game.settings.get('brp','useHPL')) {
        itm.system.injured = false;
        itm.system.maxHP = Math.max((Math.ceil(systemData.health.max / itm.system.fractionHP) + itm.system.adj),0);
        itm.system.currHP = itm.system.maxHP
        //Loop through items (wnd) to find wounds
        for (let wnd of actorData.items) {
          if (wnd.type === 'wound' && wnd.system.locId === itm._id) {
            itm.system.currHP= itm.system.currHP - wnd.system.value 
          }
        }
        if (itm.system.currHP<1 && itm.system.locType === 'limb') {
          itm.system.injured = true
        } else if (itm.system.currHP<1 && itm.system.locType === 'abdomen') {
          itm.system.injured = true
          systemData.injured = true
        } else if (itm.system.currHP<1 && itm.system.locType === 'abdomen') {
          itm.system.incapacitated = true
          systemData.incapacitated = true
        } else if (itm.system.currHP<1 && itm.system.locType === 'head') {
          itm.system.unconscious = true
          systemData.unconscious = true
        } 
        if (itm.system.bleeding) {systemData.bleeding = true}
        if (itm.system.unconscious) {systemData.unconscious = true}
        if (itm.system.incapacitated) {systemData.incapacitated = true}
        if (itm.system.severed) {systemData.severed = true}
        if (itm.system.dead) {systemData.dead = true}
      //If wound calculate total HPL  
      } else if (itm.type === 'wound') {
        systemData.health.value = systemData.health.value - itm.system.value
      }

      //Add the relevant actor skill to a weapon
      if (itm.type === 'weapon') {
        let skillId ="";
        let score = 0;
        let category = "";
        let skill1Name = ""
        let skill2Name = ""
        let skillSelect = "";
        if (itm.system.skill1 != "none") {
          skillSelect = game.items.get(itm.system.skill1)
          skill1Name = skillSelect ? skillSelect.name : "";
        }
        if (itm.system.skill2 != "none") {
          skillSelect = game.items.get(itm.system.skill2)
          skill2Name = skillSelect ? skillSelect.name : "";
        }  
        for (let actItm of actorData.items) {
          if (actItm.type === 'skill' && (actItm.name === skill1Name || actItm.name === skill2Name)) {
            if (actItm.system.total > score) {
              score = actItm.system.total
              skillId = actItm._id
              category = actItm.system.category
            }  
          }
        }
        itm.system.sourceID = skillId
      }

    } 
    

    //Calculate allegiance target
    let allegiances = actorData.items.filter(itm=>itm.type === 'allegiance')
      allegiances.sort(function(a, b){
        let x = a.system.total;
        let y = b.system.total;
        if (x < y) {return 1};
        if (x > y) {return -1};
        return 0;
      });
      //If there is one allegiance
      let ally=""
      if (allegiances.length === 1 && allegiances[0].system.total >=20) {
        actorData.items.get(allegiances[0]._id).system.potAlly = true
      } else if (allegiances.length > 1 && (allegiances[0].system.total - allegiances[1].system.total) >=20) {
        actorData.items.get(allegiances[0]._id).system.potAlly = true
      }


      
      systemData.fatigue.max = Math.ceil(systemData.stats.str.total + systemData.stats.con.total - systemData.enc);

    //Derive Health Statuses from total HP
    if (systemData.health.value <1) {
      systemData.dead = true;
    } else if (systemData.health.value <3) {
      systemData.unconscious = true;
    }
  }  

  //Prepare NPC specific data.
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;
    const systemData = actorData.system;
    this._prepStats(actorData)
    this._prepDerivedStats(actorData)

    for (let [key, stat] of Object.entries(actorData.system.baseStats)) {
      stat.label = game.i18n.localize(CONFIG.BRP.stats[key]) ?? key;
      stat.labelShort = game.i18n.localize(CONFIG.BRP.statsAbbreviations[key]) ?? key;
      //Mark all stats as visible except for EDU where it's not being used
      stat.visible = true;
      if (key === 'edu' && !game.settings.get('brp','useEDU')) {stat.visible = false}
    }


    let damage = 0

    for (let itm of actorData.items) {
      if (['skill','psychic','magic'].includes(itm.type)) {
      itm.system.total = itm.system.base;
      } else if (itm.type === 'hit-location' && game.settings.get('brp','useHPL')) {
        itm.system.injured = false;
        itm.system.maxHP = Math.max((Math.ceil(systemData.health.max / itm.system.fractionHP) + itm.system.adj),0);
        damage = damage + Math.max(itm.system.maxHP - itm.system.currHP,0)
      } 
    }

    //If using HPL then set current health
    if (game.settings.get('brp','useHPL')) {
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
    for (let [key, stat] of Object.entries(actorData.system.stats)) {
      stat.label = game.i18n.localize(CONFIG.BRP.stats[key]) ?? key;
      stat.labelShort = game.i18n.localize(CONFIG.BRP.statsAbbreviations[key]) ?? key;
      stat.labelDeriv = game.i18n.localize(CONFIG.BRP.statsDerived[key]) ?? key;
      stat.total = Number(stat.base) + Number(stat.redist) + Number(stat.culture) + Number(stat.exp) + Number(stat.effects) + Number(stat.age);
      stat.deriv = stat.total * 5;
 
      //Mark all stats as visible except for EDU where it's not being used
      stat.visible = true;
      if (key === 'edu' && !game.settings.get('brp','useEDU')) {stat.visible = false}
    }
  }

  // Calculate derived scores
  _prepDerivedStats(actorData) {
    let systemData = actorData.system
    let hpMod = 1
    if (actorData.type === 'character') {hpMod = game.settings.get('brp','hpMod')}
    systemData.health.max = Math.ceil((systemData.stats.con.total + systemData.stats.siz.total) * hpMod/2)+systemData.health.mod;
    systemData.health.mjrwnd = Math.ceil(systemData.health.max/2);
    systemData.power.max = systemData.stats.pow.total;
    systemData.xpBonus = Math.ceil(systemData.stats.int.total/2);
    systemData.dmgBonus = this._damageBonus (systemData.stats.str.total+systemData.stats.siz.total)
  }

  //Create a new actor - When creating an actor set basics including tokenlink, bars, displays sight
  static async create (data, options = {}) {
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
      },data.prototypeToken || {})
    } 
    let actor = await super.create(data, options)
    //Set up a general hit location for a new actor if using HPL
    if (actor.type ==='character' && game.settings.get('brp','useHPL')) {
      const itemData = [{
        name: game.i18n.localize('BRP.general'),
        type: 'hit-location',
        img: 'systems/brp/assets/Icons/arm-bandage.svg',
        system: {
          "fractionHP": 1,
          "fractionENC": 1,
          "lowRoll": 0,
          "highRoll":0,
          "locType": "general"

        }
      }];
      const newItem = await Item.createDocuments(itemData, {parent: actor});
    }

    //Add Starter Skills if toggled on
    if (actor.type === 'character' && game.settings.get('brp','starterSkills')) {
      let newSkills = []
      for (let itm of game.items) {
        if (itm.type ==='skill' && itm.system.basic) {
          itm.system.base = await BRPactorItemDrop._calcBase(itm,actor)
          newSkills.push(itm)
        }
      }
      await Item.createDocuments(newSkills, {parent: actor})
    }

    return 
  }

  // Primary Skills Bonus 
  _categoryprimary(statvalue){
    var bonus = statvalue-10;
    return bonus;
  }

  // Secondary Skills Bonus
  _categorysecondary(statvalue){
    var bonus = Math.floor((statvalue-10)/2);
    return bonus;
  }

  // Negative Skills Bonus
  _categorynegative(statvalue){
    var bonus = 10-statvalue;
    return bonus; 
  }

  //Damage Bonus
  _damageBonus (value) {
    let dmgBonus={}
    if (value <13) {
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
      dmgBonus.full = "+" + (Math.ceil((value-40)/16)+1) + "D6"
      dmgBonus.half = "+" + (Math.ceil((value-40)/16)+1) + "D3"
    }
    return dmgBonus
  }
}