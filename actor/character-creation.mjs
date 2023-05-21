export class BRPCharGen {
 //Initialise Characteristics
 static async onCharInitial(event) {
  
    //Determine age
    let roll = new Roll("1d6+17");
    await roll.roll({ async: true});
    let age = Number(roll.total)
    await this.actor.update({'system.age': age});
    
    //Roll all characteristics - they are updated in the routine
    let check = await BRPCharGen.initializeAllCharacteristics(this.actor);
    
    if (check)
     // await this.actor.update({'system.initialise': true})    TURNED OFF TO ALLOW FOR BUILD/TESTING 
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
  
    for (let [key, stat] of Object.entries(actor.system.stats)) {

      let update = {};
      update = await BRPCharGen.getCharacteristicUpdate(key, stat.formula);
      mergeObject(updateData, update);

    }
    await actor.update(updateData);

     // If using EDU then calcualte age 
     let age= Math.max(actor.system.age, actor.system.edu.value+5)
     if (game.settings.get('brp','useEDU') && !game.settings.get('brp','pointsMethod')){
      await actor.update({'system.age': age});
     }  

    //Call Redistribution routine 
    await BRPCharGen.statsRedist (actor);
    return true;
  }

  //
  //Roll a specific characteristic
  //
  static async getCharacteristicUpdate(stat, formula) {
      let roll = new Roll(formula);
      await roll.roll({ async: true});
    return {
      system: { stats: { [stat]: { value: Number(roll.total), redist: 0} } },
    };
  }

  //
  //Call Points Redistribution Screen
  //
  static async statsRedist(actor) {
    let data={};
    if (game.settings.get('brp','pointsMethod')) {
    //TO DO
    /*  data = {
        stats: actor.system.stats,
        points: 40,
        type: "allocation",
        title: game.i18n.localize("BRP.allocation"),
      }  
    } else {
      data = {
        stats: actor.system.stats,
        points: 3,
        type: "reallocation",
        title: game.i18n.localize("BRP.reallocation"),
      }  */
    } 
    // let usage = await this.renderRedist(data) 
    return true;
  }

  //
  //Render Redistribution Form
  //
  static async renderRedist(data) {
    const html = await renderTemplate('systems/brp/actor/parts/actor-stats-redist.html',data);
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: data.title,
        content: html,
        buttons: {
          roll: {
            label: game.i18n.localize("BRP.accept"),
            callback: html => {
            formData = new FormData(html[0].querySelector('#points-allocation-form'))
            return resolve(formData)
            }
          }
        },
      default: 'roll',
      close: () => {}
      })
      dlg.render(true);
    })
  }

}