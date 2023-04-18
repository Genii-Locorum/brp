import { BRPactorDetails } from "../apps/actorDetails.mjs";
export class BRPChecks {

  //
  // Characteristic & Derived Roll
  //
  static async _onStatRoll(event){
    let partic =await BRPactorDetails._getParticipantId(this.token,this.actor); 
    const dataset = event.currentTarget.dataset;
    BRPChecks.startCheck ({
      shiftKey: event.shiftKey,
      partic,
      type: dataset.type,
      name: dataset.label,
      targetScore: dataset.target
    })
    return
  }    

  //
  // Characteristic & Derived Context Menu
  //
  static async _onContextStatRoll(actor, token, name, targetScore, shiftKey,type){
    let partic =await BRPactorDetails._getParticipantId(token,actor); 
    BRPChecks.startCheck ({
      shiftKey,
      partic,
      type,
      name,
      targetScore,
    })
    return
  }  

  //
  // Start the Roll
  //
  static async startCheck (options = {}) {
    const config = await BRPChecks.initiateConfig(options)
    if (config === false) {return}
    let msgId = await BRPChecks.runCheck (config)
    return msgId
  } 

  //
  // Set Roll and Dialog options for the check
  //
  static async initiateConfig(options){
    let actor = await BRPactorDetails._getParticipant(options.partic.particId, options.partic.particType);
    let item = actor.items.get(options.itemId);
    const config = {
      origin: game.user.id,
      originGM: game.user.isGM,
      shiftKey: options.shiftKey,
      label: options.name,
      partic: options.partic,
      target: options.target,
      targetScore: options.targetScore ? options.targetScore : 0,
      type: options.type ? options.type : '',               
      rollFormula: options.formula ? options.formula : "1d100",
      diff: "1",
      flatMod: 0,
      resultLevel: 0,
      resolved: false,
      winTitle: options.winTitle,
      chatTemplate: 'systems/brp/rolls/roll-result.html',
      dialogTemplate: 'systems/brp/rolls/difficulty.html',
      winTitle: game.i18n.localize("BRP.diffWindow")
    }
    return config;
  }

  //
  // Run Check Routines - go here if you want to pass over a pre-defined Damage roll and not the rest of the Config
  //
  static async runCheck (config) {
    //TO DO - consider including an error message and abort if zero chance of success  
  
    //If Shift key has been held then accept the defaults above otherwise call a Dialog box for Difficulty, Modifier etc
    if (config.shiftKey){
    } else{
      let usage = await BRPChecks.RollDialog(config);
        if (usage) {
            config.diff = usage.get('difficulty');
            config.flatMod = Number(usage.get('flatMod'));
        }
      }

    //Change Target Score for Diff & FlatMod
    if (config.type === 'characteristic') {
      config.targetScore = config.targetScore *5;
    }  
    switch (config.diff) {
      case "0":
        config.targetScore = config.targetScore *2;
        break;
      case "2":
        config.targetScore = config.targetScore *0.5;
        break;
      case "3":
        config.targetScore = 1;
        break;  
    }
    config.targetScore = Number(config.targetScore) + Number(config.flatMod);



    let msgId = await BRPChecks.makeRoll(config) ;  
    return msgId
  }

  //  
  //Function to call the Difficulty & Modifier Dialog box 
  //
  static async RollDialog (options) {
    const data = {
      type : options.type,
      label: options.label,
      difficulty: "1",
      difficultyOptions: BRPChecks.getDifficultyOptions(),
    }
    const html = await renderTemplate(options.dialogTemplate,data);
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: options.winTitle,
        content: html,
        buttons: {
          roll: {
            label: game.i18n.localize("BRP.rollDice"),
            callback: html => {
            formData = new FormData(html[0].querySelector('#difficulty-roll-form'))
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

  //
  //Call Dice Roll, calculate Result and store original results in rollVal
  //
  static async makeRoll(config) {
    let roll = new Roll(config.rollFormula);
    await roll.roll({ async: true});
    config.roll = roll;
    config.rollResult = Number(config.roll.result);
    config.rollVal = Number(config.rollResult)


  //Get the level of Success
    config.resultLevel = await BRPChecks.successLevel(config)

  //Create the ChatMessage and Roll Dice
    const html = await BRPChecks.startChat(config);
    let msgId =  await BRPChecks.showChat(html,config);
    return msgId
  } 

  //
  // Calculate Success Level
  //
  static async successLevel (config){
    //Set the critical and fumble chances adjusted for impaired  
      let critChance = Math.ceil(0.05*config.targetScore);
      let fumbleChance = Math.min(95+critChance,100);
      let specialChance = Math.round(0.2*config.targetScore);
       
    //Get the level of success
    let resultLevel = 0;

    if (config.rollVal <= critChance) {
      resultLevel = 4;
    } else if (config.rollVal <=specialChance) {
      resultLevel = 3;
    } else if (config.rollVal <=config.targetScore) {
      resultLevel = 2;
    } else if (config.rollVal >= fumbleChance) {
      resultLevel = 0;
    } else {
      resultLevel = 1;
    }
    return resultLevel
  }

  //
  // Prep the chat card
  //
  static async startChat(config) {
    let actor = await BRPactorDetails._getParticipant(config.partic.particId,config.partic.particType)
    let messageData = {
      origin: config.origin,
      originGM: config.originGM,
      speaker: ChatMessage.getSpeaker({ actor: actor.name }),
      rollType: config.type,
      label: config.label,
      actorId: actor._id,
      diff: config.diff,
      diffLabel:game.i18n.localize('BRP.RollDiff.'+config.diff),
      flatMod: config.flatMod,
      partic: config.partic,
      resultLevel : config.resultLevel,
      resultLabel: game.i18n.localize('BRP.resultLevel.'+config.resultLevel),
      result: config.rollVal,
      targetScore: config.targetScore,
  }

  const messageTemplate = config.chatTemplate
  let html = await renderTemplate (messageTemplate, messageData);

  return html;
}  

//
// Display the chat card and roll the dice
//
static async showChat(html,config) {

  let actor = await BRPactorDetails._getParticipant(config.partic.particId,config.partic.particType)
  let chatData={};

    chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.ROLL,
      rolls: [config.roll],
      content: html,
      flags: {config: config},
      speaker: {
        actor: actor._id,
        alias: actor.name,
      },
    }
      
    let msg = await ChatMessage.create(chatData);
    return msg._id
  }
  


  //
  //Difficulty Options
  //
  static getDifficultyOptions() {
    return {
      0: game.i18n.localize("BRP.RollDiff.0"),
      1: game.i18n.localize("BRP.RollDiff.1"),
      2: game.i18n.localize("BRP.RollDiff.2"),
      3: game.i18n.localize("BRP.RollDiff.3"),
    }; 
  }

}