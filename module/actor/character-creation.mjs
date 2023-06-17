import { BRPactorDetails } from "../apps/actorDetails.mjs";
import { BRPUtilities } from "../apps/utilities.mjs";
import { AgeSelectDialog} from "../apps/age-selection-dialog.mjs";

export class BRPCharGen {
 
  //
  //Initialise Characteristics - this is effectively rerolling the character
  //
  static async onCharInitial(actor) {
  
    //Determine age
    let roll = new Roll("1d6+17");
    await roll.roll({ async: true});
    let age = Number(roll.total)
    await actor.update({'system.age': age});
    
    //Roll all characteristics - they are updated in the routine
    await BRPCharGen.initializeAllCharacteristics(actor);
    
    //Allow age to be changed and update stats accordingly.
    let newAge = 0;
    let ageInc = 0;

    const dialogData = {}
    dialogData.age= actor.system.age
    dialogData.title = game.i18n.localize('BRP.AgeSelectionWindow')
    let usage = await AgeSelectDialog.create(dialogData)
    if (usage) {
      newAge = Number(usage.get('newAge'));
      if (newAge === 0) {newAge = actor.system.age}
      if (newAge > actor.system.age) {
        ageInc = Math.floor((newAge-actor.system.age)/10)
      } else {
        ageInc = newAge-actor.system.age
      }  
    await actor.update({'system.age': newAge, 'system.ageInc': ageInc});
    }  
    
    //Adjust Stats for new Age
    if (!game.settings.get('brp','ignoreAge') || ageInc === 0){
      if (game.settings.get('brp','useEDU') && ageInc > 0){
        await actor.update({'system.stats.edu.age': ageInc});
      } else if (ageInc < 0) {
        await BRPCharGen.getAging (actor,ageInc,'create')
      } 
      if (actor.system.age > 49) {
        let ageSlot = Math.floor((actor.system.age - 40)/10)
        ageSlot += Math.max(ageSlot-3,0)*2
        await BRPCharGen.getAging (actor,-ageSlot,'aging')        
      }

    }  

    //Set Starting Sanity
    await actor.update({
      'system.sanity.value': (actor.system.stats.pow.value + actor.system.stats.pow.redist + actor.system.stats.pow.adj) * 5, 
      'system.sanity.max': (actor.system.stats.pow.value + actor.system.stats.pow.redist + actor.system.stats.pow.adj) * 5
    });

    return;
 
  }

//  
//Roll all Characteristics & Update Age if appropriate
//
static async initializeAllCharacteristics(actor) {
    let updateData = {};
      if (!actor.isOwner) {
      return false;
    }
  
    //Confirm you want to do this
    let confirmation = await BRPUtilities.confirmation();
    if (!confirmation) {return}


    for (let [key, stat] of Object.entries(actor.system.stats)) {

      let update = {};
      update = await BRPCharGen.getCharacteristicUpdate(key, stat.formula);
      mergeObject(updateData, update);

    }
    await actor.update(updateData);

     // If using EDU then calculate age 
     let age= Math.max(actor.system.age, actor.system.stats.edu.value+5)
     if (game.settings.get('brp','useEDU')) { 
      if(game.settings.get('brp','pointsMethod')){
        await actor.update({'system.stats.edu.value': age-5})
      } else {
        await actor.update({'system.age': age});
      }  
      }
    return
  }

  //
  //Roll a specific characteristic
  //
  static async getCharacteristicUpdate(stat, formula) {
      let roll = new Roll(formula);
      await roll.roll({ async: true});
    return {
      system: { stats: { [stat]: { value: Number(roll.total), redist: 0, age: 0} } },
    };
  }

  //
  //Points Allocation
  //
  static async pointsAllocation (event) {
    const stat = event.currentTarget.dataset.stat;
    const type = event.currentTarget.dataset.type;
    const target = 'system.stats.' + stat + '.redist'
    let newDist = this.actor.system.stats[stat].redist
    let redistNeg = 0
    let redistPos = 0
    let redist = 0
    let errMsg = ""

    if (game.settings.get('brp', 'pointsMethod')) {
      for (let [key, i] of Object.entries(this.actor.system.stats)) {
        if (key != 'edu' || game.settings.get('brp', 'useEDU')) {
          redist = i.redist
          if (key === stat && type === 'decrease') {
            redist -= 1
            newDist -=1
          } else if (key === stat && type === 'increase') {
            redist +=1
            newDist +=1
          }

          redistPos += (redist * i.cost)
        }
      }  
      if (redistPos > this.actor.system.statPoints) {
        ui.notifications.warn(game.i18n.localize('BRP.usedStatPoints'))
        return        
      }

    } else {
      //Points Redistribution - max of 3
      for (let [key, i] of Object.entries(this.actor.system.stats)) {
        redist = i.redist
        if (key === stat && type === 'decrease') {
          redist -= 1
          newDist -=1
        } else if (key === stat && type === 'increase') {
          redist +=1
          newDist +=1
        }
        if (redist < 0) {
          redistNeg += redist
        } else {
          redistPos += redist
        }
      }
      // Check to ensure no more than 3 points added/removed
      if ((redistNeg < -3 || redistPos > 3)) {
        if (redistNeg < -3) {
          errMsg = game.i18n.localize('BRP.redistDec')
        } else {
          errMsg = game.i18n.localize('BRP.redistInc')
        }
        ui.notifications.warn(errMsg)
        return
      }
    }

    //Check the cultural min/max is not exceeded
    let newStat = this.actor.system.stats[stat].value + this.actor.system.stats[stat].adj + newDist 
    let max = this.actor.system.stats[stat].max
    let min = this.actor.system.stats[stat].min
    if (game.settings.get('brp', 'pointsMethod') && game.settings.get('brp', 'powerLevel') > 1) {
      max = 999
    }

    if (newStat > max || newStat < min) {
      ui.notifications.warn(game.i18n.localize('BRP.statCap'))
      return
    }  



    await this.actor.update({[target]: newDist})
    return

  }



  //
  //Select Starting Wealth
  //
  static async startingWealth(min,max) {
    const data = {
      wealthOptions: BRPCharGen.getWealthOptions(min,max),
    }
    const html = await renderTemplate('systems/brp/templates/dialog/selectWealth.html',data);
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: "Wealth Selection",
        content: html,
        buttons: {
          confirm: {
            label: game.i18n.localize("BRP.confirm"),
            callback: html => {
            formData = new FormData(html[0].querySelector('#wealth-select-form'))
            return resolve(formData)
            }
          }
        },
      default: 'confirm',
      close: () => {}
      })
      dlg.render(true);
    })
  }

  //
  //Wealth Options
  //
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

  static async skillDevelop(actor,token) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor);
    partic.update({'system.development' : !partic.system.development});
  }

  //
  //Stat Options 
  //
  static getStatOptions () {
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
  
  //
  //Toggle Initialisation
  //
  static async toggleInitial (actor){
    await actor.update({'system.initialise': !actor.system.initialise})
    return
  }  

  //
  //Aging
  //
  static async getAging (actor,points,list) {
  //Prep List of Stats that can be reduced
  if (points === 0) {return}
  
  let options = {
    "str": game.i18n.localize("BRP.StatsStrAbbr"),
    "con": game.i18n.localize("BRP.StatsConAbbr"),
  }  
  if (list === 'create') {
    options= Object.assign(options,{"siz": game.i18n.localize("BRP.StatsSizAbbr")})
    options= Object.assign(options,{"int": game.i18n.localize("BRP.StatsIntAbbr")})
    options= Object.assign(options,{"pow": game.i18n.localize("BRP.StatsPowAbbr")})
  } 
    options= Object.assign(options,{"dex": game.i18n.localize("BRP.StatsDexAbbr")})
    options= Object.assign(options,{"cha": game.i18n.localize("BRP.StatsChaAbbr")})


    const dialogData = {}
    dialogData.list= options
    dialogData.points = points * -1
    dialogData.title = game.i18n.localize('BRP.AgingSelectionWindow')
    let usage = await AgeSelectDialog.agingCreate(dialogData)
    if (usage) {
      await actor.update({
        'system.stats.str.age': actor.system.stats.str.age - Number(usage.get('str')),
        'system.stats.con.age': actor.system.stats.con.age - Number(usage.get('con')),
        'system.stats.siz.age': actor.system.stats.siz.age - Number(usage.get('siz')),
        'system.stats.int.age': actor.system.stats.int.age - Number(usage.get('int')),
        'system.stats.pow.age': actor.system.stats.pow.age - Number(usage.get('pow')),
        'system.stats.dex.age': actor.system.stats.dex.age - Number(usage.get('dex')),
        'system.stats.cha.age': actor.system.stats.cha.age - Number(usage.get('cha')),
      })
    } else {
      let counter = 1
      for (let i=1; i<=dialogData.points; i++) {
        switch (counter) {
          case 1: 
          await actor.update({'system.stats.str.age': actor.system.stats.str.age - 1})
            break;
          case 2: 
          await actor.update({'system.stats.con.age': actor.system.stats.con.age - 1})
            break;
          case 3: 
          await actor.update({'system.stats.dex.age': actor.system.stats.dex.age - 1})
                  break;
          case 4: 
          await actor.update({'system.stats.cha.age': actor.system.stats.cha.age - 1})
            break;
         }  
         counter ++
         if (counter ===5) {counter = 1}
      }   
      ui.notifications.warn(game.i18n.localize('BRP.notAged'));
    }


    return

  }


}