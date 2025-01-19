export class BRPSelectLists {

 //Attribute List
 static async getStatOptions () {    
    let options = {
      "fixed": game.i18n.localize("BRP.fixed"),
      "str": game.i18n.localize("BRP.StatsStrAbbr"),
      "con": game.i18n.localize("BRP.StatsConAbbr"),
      "siz": game.i18n.localize("BRP.StatsSizAbbr"),
      "int": game.i18n.localize("BRP.StatsIntAbbr"),
      "pow": game.i18n.localize("BRP.StatsPowAbbr"),
      "dex": game.i18n.localize("BRP.StatsDexAbbr"),
      "cha": game.i18n.localize("BRP.StatsChaAbbr"),
      "edu": game.i18n.localize("BRP.StatsEduAbbr"),
    };   
    return options;
  } 
  
  //Additional Attribute List
  static async addStatOptions (characteristic) {    
    let options = {
      "none": game.i18n.localize("BRP.none"),
      "str": game.i18n.localize("BRP.StatsStrAbbr"),
      "con": game.i18n.localize("BRP.StatsConAbbr"),
      "siz": game.i18n.localize("BRP.StatsSizAbbr"),
      "int": game.i18n.localize("BRP.StatsIntAbbr"),
      "pow": game.i18n.localize("BRP.StatsPowAbbr"),
      "dex": game.i18n.localize("BRP.StatsDexAbbr"),
      "cha": game.i18n.localize("BRP.StatsChaAbbr"),
    }  
    if (game.settings.get('brp','useEDU')) {
      options= Object.assign(options,{'edu': game.i18n.localize("BRP.StatsEduAbbr")})
    }  
    return options;
  } 

  //Skill Category List
  static async getCategoryOptions () {    
    let skillCatList = await game.system.api.brpid.fromBRPIDRegexBest({ brpidRegExp:new RegExp('^i.skillcat'), type: 'i' })
    skillCatList.sort(function(a, b){
      let x = a.name;
      let y = b.name;
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });
    let options={}
    for (let itm of skillCatList) {
      if (itm.flags.brp.brpidFlag.id) {
        options= Object.assign(options,{[itm.flags.brp.brpidFlag.id]: itm.name})
      }
    }




    return options;
  } 

  //Weapon Category List
  static async getWpnCategoryOptions () {    
    let options = {
      "artillery": game.i18n.localize("BRP.artillery"),
      "energy": game.i18n.localize("BRP.energy"),
      "explosive": game.i18n.localize("BRP.explosive"),
      "firearm": game.i18n.localize("BRP.firearm"),
      "heavy": game.i18n.localize("BRP.heavy"),
      "melee": game.i18n.localize("BRP.melee"),
      "missile": game.i18n.localize("BRP.missile"),
      "shield": game.i18n.localize("BRP.shield"),
    };   
    return options;
  } 

  //Dam Bonus Category List
  static async getDamBonusOptions () {    
    let options = {
      "none": game.i18n.localize("BRP.none"),
      "half": game.i18n.localize("BRP.half"),
      "full": game.i18n.localize("BRP.full"),
      "oneH": game.i18n.localize("BRP.oneH"),
    };   
    return options;
  } 

  //Special Success  Category List
  static async getSpecialOptions () {    
    let options = {
      "none": game.i18n.localize("BRP.none"),
      "bleed": game.i18n.localize("BRP.bleed"),
      "crush": game.i18n.localize("BRP.crush"),
      "entangle": game.i18n.localize("BRP.entangle"),
      "fire": game.i18n.localize("BRP.fire"),
      "impale": game.i18n.localize("BRP.impale"),
      "knockback": game.i18n.localize("BRP.knockback"),
      "impknock": game.i18n.localize("BRP.impknock"),
      "crushknock": game.i18n.localize("BRP.crushknock"),
      "stun": game.i18n.localize("BRP.stun"),
    };   
    return options;
  } 

  //Funcational Options List
  static async getFunctionalOptions () {    
    let options = {
      "and": game.i18n.localize("BRP.and"),
      "or": game.i18n.localize("BRP.or"),
    };   
    return options;
  } 

  //Advanced Skill Category Options List
  static async getAdvSkillCatOptions (){
    let options = {
      "0": game.i18n.localize("BRP.advSkillCat.0"),
      "1": game.i18n.localize("BRP.advSkillCat.1"),
      "2": game.i18n.localize("BRP.advSkillCat.2"),
      "3": game.i18n.localize("BRP.advSkillCat.3"),      
      "4": game.i18n.localize("BRP.advSkillCat.4"),
    };   
    return options;
  }

  //Wealth Options
  static getWealthOptions(min,max) {
    let options={}
    let newOption ={}
    for (let i=0; i<=max; i++) {
      if (i >= min) {
        newOption ={[i]: game.i18n.localize("BRP.wealthLevel."+i),};
        options= Object.assign(options,newOption)
      }  
    }
    return options
  }

  //Powers Category List
  static async getPowerCatOptions () {    
    let options = {
      "magic": game.i18n.localize("BRP.magic"),
      "mutation": game.i18n.localize("BRP.mutation"),
      "psychic": game.i18n.localize("BRP.psychic"),
      "sorcery": game.i18n.localize("BRP.sorcery"),
      "super": game.i18n.localize("BRP.super")
    };   
    return options;
  } 

  //Power Level List
  static async getPowerLvlOptions () {    
    let options = {
      "normal": game.i18n.localize("BRP.normal"),
      "epic": game.i18n.localize("BRP.epic"),
      "heroic": game.i18n.localize("BRP.heroic"),
      "superhuman": game.i18n.localize("BRP.superhuman"),
    };   
    return options;
  } 

  //Spell Category List
  static async getSpellCatOptions () {    
    let options = {
      "damage": game.i18n.localize("BRP.damage"),
      "healing": game.i18n.localize("BRP.healing"),
      "other": game.i18n.localize("BRP.other"),
    };   
    return options;
  } 

  //Mutation Category List
  static async getMutationCatOptions () {    
    let options = {
      "adv": game.i18n.localize("BRP.adv"),
      "dis": game.i18n.localize("BRP.dis"),
    };   
    return options;
  } 

  //Armour Burden List
  static async getArmourBurdenOptions () {    
    let options = {
      "none": game.i18n.localize("BRP.none"),
      "light": game.i18n.localize("BRP.light"),
      "moderate": game.i18n.localize("BRP.moderate"),
      "cumbersome": game.i18n.localize("BRP.cumbersome"),
    };   
    return options;
  } 

  //Price Categories List
  static async getPriceOptions () {    
    let options = {
      "none": game.i18n.localize("BRP.none"),
      "cheap": game.i18n.localize("BRP.cheap"),
      "inexpensive": game.i18n.localize("BRP.inexpensive"),
      "average": game.i18n.localize("BRP.average"),
      "expensive": game.i18n.localize("BRP.expensive"),
      "priceless": game.i18n.localize("BRP.priceless"),
      "restricted": game.i18n.localize("BRP.restricted"),
    };   
    return options;
  } 

  //Hit Loc Options
  static getHitLocOptions(actor) {
    let options={}
    let newOption ={}
    for (let i of actor.items) {
      if (i.type === 'hit-location') {
        if (game.settings.get('brp','useHPL') && i.system.locType != 'general') {
          newOption ={[i.id]: i.system.displayName,}; 
          options= Object.assign(options,newOption)
        } else if (!game.settings.get('brp','useHPL') && i.system.locType === 'general') {
          newOption ={[i.id]: i.name,}; 
          options= Object.assign(options,newOption)
        }  
      }  
    }
    return options
  }

  //Equipped List
  static async getEquippedOptions (type) {    
    let options = {};
    if (type==='armour') {
      options = {
        "carried": game.i18n.localize("BRP.carried"),
        "worn": game.i18n.localize("BRP.worn"),
        "packed": game.i18n.localize("BRP.packed"),
        "stored": game.i18n.localize("BRP.stored"),
      }
    } else {
      options = {  
        "carried": game.i18n.localize("BRP.carried"),
        "packed": game.i18n.localize("BRP.packed"),
        "stored": game.i18n.localize("BRP.stored"),
      }
    };   
    return options;
  }

  //Weapon Skill Options
  static async getWeaponSkillOptions(skillId) {
    let skillList = await game.system.api.brpid.fromBRPIDRegexBest({ brpidRegExp:new RegExp('^i.skill'), type: 'i' })
    let newList = skillList.filter(itm => (itm.system.combat || itm.system.category === 'i.skillcat.combat')).map(itm => {return { brpid: itm.flags.brp.brpidFlag.id, name: itm.name}})
    newList.sort(function(a, b){
      let x = a.name;
      let y = b.name;
      if (x < y) {return -1};
      if (x > y) {return 1};
      return 0;
    });

    let options={}
    let newOption ={}
    if (skillId !="1") {
      newOption = {"none": game.i18n.localize("BRP.none")};
      options= Object.assign(options,{"none": game.i18n.localize("BRP.none")})      
    }

    for (let itm of newList) {
      if (itm.brpid) {
        options= Object.assign(options,{[itm.brpid]: itm.name})
      }
    }
    return options
  }

  //Handed List
  static async getHandedOptions () {    
    let options = {
      "none": game.i18n.localize("BRP.none"),
      "1H": game.i18n.localize("BRP.1H"),
      "2H": game.i18n.localize("BRP.2H"),
      "1-2H": game.i18n.localize("BRP.1-2H"),
    };   
    return options;
  }

  //Difficulty List
  static async getDifficultyOptions () {    
    let options = {
      "easy": game.i18n.localize("BRP.easy") + " (*2)",
      "average": game.i18n.localize("BRP.average") + " (*1)",
      "difficult": game.i18n.localize("BRP.difficult") + " (*.5)",
      "hard": game.i18n.localize("BRP.hard") + " (*.4)",
      "extreme": game.i18n.localize("BRP.extreme") + " (*.2)",
    };   

    if (game.settings.get('brp','allowImp')) {
      options= Object.assign(options,{"impossible": game.i18n.localize("BRP.impossible") + " (=1%)"})
    }
    return options;
  }

  //Difficulty List
  static async getCHDifficultyOptions () {    
    let options = {
      "easy": game.i18n.localize("BRP.easy") + " (*10)",
      "average": game.i18n.localize("BRP.average") + " (*5)",
      "tricky": game.i18n.localize("BRP.tricky") + " (*4)",
      "awkward": game.i18n.localize("BRP.awkward") + " (*3)",
      "difficult": game.i18n.localize("BRP.difficult") + " (*2.5)",
      "hard": game.i18n.localize("BRP.hard") + " (*2)",
      "extreme": game.i18n.localize("BRP.extreme") + " (*1)",
    };   

    if (game.settings.get('brp','allowImp')) {
      options= Object.assign(options,{"impossible": game.i18n.localize("BRP.impossible") + " (=1%)"})
    }
    return options;
  }

  //Hit Location List
  static async getHitLocType () {    
    let options = {
      "limb": game.i18n.localize("BRP.limb"),
      "abdomen": game.i18n.localize("BRP.abdomen"),
      "chest": game.i18n.localize("BRP.chest"),
      "head": game.i18n.localize("BRP.head"),
      "general": game.i18n.localize("BRP.general"),
    };   
    return options;
  }  

  //Success Level List
  static async getSuccessOptions (){
    let options = {
      "4": game.i18n.localize("BRP.resultLevel.4"),
      "3": game.i18n.localize("BRP.resultLevel.3"),
      "2": game.i18n.localize("BRP.resultLevel.2"),
    };   
    return options;
  }

  //Auto XP Options List
  static async getXPOptions (){
    let options = {
      "0": game.i18n.localize("BRP.none"),
      "1": game.i18n.localize("BRP.onSuccess"),
      "2": game.i18n.localize("BRP.onFailure"),
    };   
    return options;
  }
}