export class BRPDiceRoll {

  //Maeka a Dice Roll
  static async RollDice (rollFormula){
    let roll = new Roll(rollFormula);
    await roll.roll({ async: true});
    return roll;  
  }

  //Roll all Characteristics
  static async initializeAllCharacteristics(actor) {
    let updateData = {};
      if (!actor.isOwner) {
      return false;
    }
  
    for (let [key, stat] of Object.entries(actor.system.stats)) {

      let update = {};
      update = await this.getCharacteristicUpdate(key, stat.formula);
      mergeObject(updateData, update);

    }
    await actor.update(updateData);
    return true;
  }

  //Roll a specific characteristic
  static async getCharacteristicUpdate(stat, formula) {
      let roll = new Roll(formula);
      await roll.roll({ async: true});
    return {
      system: { stats: { [stat]: { value: Number(roll.total), redist: 0 } } },
    };
  }

  //Initialise Characteristics
  static async onCharInitial(event) {
    if (game.settings.get('brp','powerLevel') > 0 && this.actor.type === 'character') {
      let updateData = {};
      for (let [key, stat] of Object.entries(this.actor.system.stats)) {
        let update = {system: { stats: { [key]: { formula: '2d6+6' } } } };
        mergeObject(updateData, update);
      }
      await this.actor.update(updateData);
    }
    
    let check = await BRPDiceRoll.initializeAllCharacteristics(this.actor);
    if (check)
      await this.actor.update({'system.initialise': true}) 
    return;
  }

}      