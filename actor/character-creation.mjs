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
     await this.actor.update({'system.initialise': true})  
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
     let age= Math.max(actor.system.age, actor.system.stats.edu.value+5)
     if (game.settings.get('brp','useEDU') && !game.settings.get('brp','pointsMethod')){
      await actor.update({'system.age': age});
     }  

    return false;  //TO DO: change to true when testing finished
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

}