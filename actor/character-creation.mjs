export class BRPCharGen {
 //Initialise Characteristics
 static async onCharInitial(event) {
  
    //Determine age
    let roll = new Roll("1d6+17");
    await roll.roll({ async: true});
    let age = Number(roll.total)
    await this.actor.update({'system.age': age});


    //Change characteristic formula for high powered games
    if (game.settings.get('brp','powerLevel') > 0 && this.actor.type === 'character') {
      let updateData = {};
      for (let [key, stat] of Object.entries(this.actor.system.stats)) {
        let update = {system: { stats: { [key]: { formula: '2d6+6' } } } };
        mergeObject(updateData, update);
      }
      await this.actor.update(updateData);
    }
    
    //Roll all characteristics - they are updated in the routine
    let check = await BRPCharGen.initializeAllCharacteristics(this.actor);
    
    // If using EDU 
    if (game.settings.get('brp','useEDU')){
        if (!game.settings.get('brp','pointsMethod')){
          age = Math.max(age,this.actor.system.edu.value+5)
        }  
        await this.actor.update({'system.age': age});
    }


    if (check)
     // await this.actor.update({'system.initialise': true})    TURNED OFF TO ALLOW FOR BUILD/TESTING 
    return;
  }

//  
//Roll all Characteristics
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
    return true;
  }

  //
  //Roll a specific characteristic
  //
  static async getCharacteristicUpdate(stat, formula) {
      let roll = new Roll(formula);
      await roll.roll({ async: true});
    return {
      system: { stats: { [stat]: { value: Number(roll.total), redist: 0 } } },
    };
  }




}