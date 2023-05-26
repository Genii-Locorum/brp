export class variableSettings {

  static async worldSet() { 
    //If game Power Level is Normal or Heroic xp gain = 1d6/3, for Epic it is 1d8/4 and for superhuman it is 1d10/5
    let powerLevel = game.settings.get('brp','powerLevel')
    let xpFormula = '1d6';
    let xpFixed = 3

    switch (powerLevel) {
        case "2":
          xpFormula = '1d8';
          xpFixed = 4;
          break;  
        case "3":
            xpFormula = '1d10';
            xpFixed = 5;
            break;  
    }

    await game.settings.set('brp','xpFormula', xpFormula);
    await game.settings.set('brp','xpFixed', xpFixed);

    }


}