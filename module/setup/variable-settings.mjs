export class variableSettings {

  static async worldSet() { 
    //Change world settings based on Power Level
    let powerLevel = game.settings.get('brp','powerLevel')
    let xpFormula = '1d6';
    let xpFixed = 3;
    let PSPMulti = 10;
    let skillCap = 75;
    let profEDU=20;
    let profAge = 0;
    let profStandard=40;

    switch (powerLevel) {
      case "0":
        break; 

      case "1":
        skillCap = 90;
        profEDU = 25;
        profAge = 20;
        profStandard = 325;
        if (game.settings.get('brp',"enhancedPSP")) PSPMulti = 15;
        break; 
  
      case "2":
        xpFormula = '1d8';
        xpFixed = 4;
        skillCap = 101;
        profEDU = 30;
        profAge=30;
        profStandard = 400;
        if (game.settings.get('brp',"enhancedPSP")) PSPMulti = 20;
        break;  

      case "3":
        xpFormula = '1d10';
        xpFixed = 5;
        skillCap = 999;
        profEDU = 40;
        profAge = 40;
        profStandard = 500;
        if (game.settings.get('brp',"enhancedPSP")) PSPMulti = 25;
          break;  
    }

    await game.settings.set('brp','xpFormula', xpFormula);
    await game.settings.set('brp','xpFixed', xpFixed);
    await game.settings.set('brp','PSPMulti', PSPMulti);
    await game.settings.set('brp','skillCap', skillCap);
    await game.settings.set('brp','profEDU', profEDU);
    await game.settings.set('brp','profAge', profAge);
    await game.settings.set('brp','profStandard', profStandard);
    }


}