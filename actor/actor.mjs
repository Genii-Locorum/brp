/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class BRPActor extends Actor {

  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
 }
  
  /**
   * @override
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.brp || {};

    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  //
  // Prepare Character type specific data
  // 
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    //Add stats formula, min/max/fixed and move based on species item
    for (let i of actorData.items) {
      if (i.type === "species") {
        systemData.species = i.name;
        for (let [key, stat] of Object.entries(systemData.stats)) {
          if (game.settings.get('brp','pointsMethod')) {
            systemData.stats[key].formula = i.system.stats[key].fixed;
          } else if (game.settings.get('brp','powerLevel') > 0) {
            systemData.stats[key].formula = i.system.stats[key].advanced;
          } else {   
            systemData.stats[key].formula = i.system.stats[key].base;
          }  
          systemData.stats[key].min = i.system.stats[key].minStat;
          systemData.stats[key].max = i.system.stats[key].maxStat;
        }
        systemData.moveTotal  = Number(i.system.move) + Number(systemData.move)
      }
    }  

    // Loop through ability scores, calculating total and derived scores
    for (let [key, stat] of Object.entries(systemData.stats)) {
      stat.label = game.i18n.localize(CONFIG.BRP.stats[key]) ?? key;
      stat.labelShort = game.i18n.localize(CONFIG.BRP.statsAbbreviations[key]) ?? key;
      stat.total = Math.min(stat.value + stat.redist + stat.cultural + stat.exp + stat.effects, stat.max);
      stat.deriv = stat.total * 5;
    }

    // Calculate Derived Characteristics (Hit Points, Power etc)
    systemData.health.max = Math.ceil((systemData.stats.con.total + systemData.stats.siz.total)/2 * game.settings.get('brp','hpMod'));
    systemData.health.mjrwnd = Math.ceil(systemData.health.max/2);
    systemData.power.max = systemData.stats.pow.total;
    systemData.fatigue.max = systemData.stats.str.total + systemData.stats.con.total;
    systemData.dmgBonus = this._calcDamageBonus (systemData.stats.str.total + systemData.stats.siz.total); 
    systemData.xpBonus = Math.ceil(systemData.stats.int.total/2)

    // Calculate the Skill Category Bonuses */ 
    // 0 = No Bonus, 1 = Simple option, 2 = Advanced option
    if (game.settings.get('brp','skillBonus') >0 ){
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
            case "prcpmod":
              modifiervalue=this._categoryprimary(systemData.stats.int.total)+this._categorysecondary(systemData.stats.pow.total)+this._categorysecondary(systemData.stats.con.total);
              break;
            case "physmod":
              modifiervalue=this._categoryprimary(systemData.stats.dex.total)+this._categorysecondary(systemData.stats.str.total)+this._categorysecondary(systemData.stats.con.total)+this._categorynegative(systemData.stats.siz.total);
              break;
          }
        } else {
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
            case "prcpmod":
              modifiervalue=Math.ceil(systemData.stats.pow.total/2);
              break;
            case "physmod":
              modifiervalue=Math.ceil(systemData.stats.str.total/2);
              break;        
          }
        }
        systemData.skillcategory[key].bonus=modifiervalue;
      }
    }

   

  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();
    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  
  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;

  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

  //
  // Calculate Damage Bonus
  //
  _calcDamageBonus (score) {
    if(score < 13) {
      return "-1D6";
    }
    else if(score < 17) {
      return "-1D4";
    }
    else if(score < 25) {
      return "0";
    }
    else if(score < 33) {
      return "1D4";
    }
    else if(score < 41) {
      return "1D6";
    }
    else {
      let damagebonusdice = 1+Math.ceil((score-40)/16);
      return damagebonusdice+"D6";
    }
  }

  //
  // Primary Skills Bonus */
  //
  _categoryprimary(statvalue){
    var bonus = statvalue-10;
    return bonus;
  }

  //
  // Secondary Skills Bonus */
  //
  _categorysecondary(statvalue){
    var bonus = Math.floor((statvalue-10)/2);
    return bonus;
  }

  //  
  // Negative Skills Bonus */
  //
  _categorynegative(statvalue){
    var bonus = 10-statvalue;
    return bonus; 
  }

}