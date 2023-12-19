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
   
    // Loop through ability scores, calculating total and derived scores
    for (let [key, stat] of Object.entries(systemData.stats)) {
      stat.label = game.i18n.localize(CONFIG.BRP.stats[key]) ?? key;
      stat.labelShort = game.i18n.localize(CONFIG.BRP.statsAbbreviations[key]) ?? key;
      stat.labelDeriv = game.i18n.localize(CONFIG.BRP.statsDerived[key]) ?? key;
      stat.total = Number(stat.base) + Number(stat.redist) + Number(stat.culture) + Number(stat.exp) + Number(stat.effects) + Number(stat.age);
      stat.deriv = stat.total * 5;


      //Mark all stats as visible except for EDU where it's not being used
      stat.visible = true;
      if (key === 'edu' && !game.settings.get('brp','useEDU')) {stat.visible = false}
    }

    //Initialise Powers, Personality item IDs
    systemData.magic = "";
    systemData.mutation = "";
    systemData.psychic = "";
    systemData.sorcery = "";
    systemData.super = "";
    systemData.personality = "";


    // Calculate derived scores
    let hpMod = 1
    if (actorData.type === 'character') {hpMod = game.settings.get('brp','hpMod')}
    systemData.health.max = Math.ceil((systemData.stats.con.total + systemData.stats.siz.total) * hpMod/2)+systemData.health.mod;
    systemData.health.value = systemData.health.max;
    systemData.health.mjrwnd = Math.ceil(systemData.health.max/2);
    systemData.power.max = systemData.stats.pow.total;
    systemData.fatigue.max = systemData.stats.str.total + systemData.stats.con.total;
    systemData.xpBonus = Math.ceil(systemData.stats.int.total/2);



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

    //Calcualte/adjust scores for items
    for (let i of actorData.items) {
      if (i.type === 'skill' || i.type === 'magic' || i.type === 'psychic') {
        i.system.total = i.system.base + i.system.xp + i.system.effects + i.system.profession + i.system.personality + i.system.personal
        i.system.catBonus = systemData.skillcategory[i.system.category].bonus
      } else if (i.type === 'power') {
        systemData[i.system.category] = i._id;
      } else if (i.type === 'personality') {
        systemData.personality = i.name
        systemData.personalityId = i._id;
      } else if (i.type === 'profession') {
        systemData.profession = i.name
        systemData.professionId = i._id;
      } else if (i.type === 'hit-location' && game.settings.get('brp','useHPL')) {
        i.system.maxHP = Math.max((Math.ceil(systemData.health.max / i.system.fractionHP) + i.system.adj),0);
        i.system.currHP = i.system.maxHP
        for (let j of actorData.items) {
          if (j.type === 'wound' && j.system.locId === i._id) {
            i.system.currHP= i.system.currHP - j.system.value 
          }
        }
      } else if (i.type === 'wound') {
        systemData.health.value = systemData.health.value - i.system.value
      }
    }  
    systemData.dmgBonus = this._damageBonus (systemData.stats.str.total+systemData.stats.siz.total)
  }  

  //Prepare NPC specific data.
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;
    const systemData = actorData.system;
    systemData.xp = (systemData.cr * systemData.cr) * 100;
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
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }
  }

  // Prepare NPC roll data
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;
  }

  //Create a new actor - When creating an actor set basics including tokenlink, bars, displays sight
  static async create (data, options = {}) {
    if (data.type === 'character') {
      data.prototypeToken = mergeObject({
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
      dmgBonus.full = ''
      dmgBonus.half = ''
    } else if (value < 33) {
      dmgBonus.full = '1D4'
      dmgBonus.half = '1D2'
    } else if (value < 41) {
      dmgBonus.full = '1D6'
      dmgBonus.half = '1D3'
    } else {
      dmgBonus.full = (Math.ceil((value-40)/16)+1) + "D6"
      dmgBonus.half = (Math.ceil((value-40)/16)+1) + "D3"
    }
    return dmgBonus
  }
}