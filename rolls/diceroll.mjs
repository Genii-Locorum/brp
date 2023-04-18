export class BRPDiceRoll {

  //Make a Dice Roll - DO I STILL NEED THIS????? REMOVE AND REFACTOR IN CHECKS
  static async RollDice (rollFormula){
    let roll = new Roll(rollFormula);
    await roll.roll({ async: true});
    return roll;  
  }

  

 

}      