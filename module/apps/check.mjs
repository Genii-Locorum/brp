import { BRPactorDetails } from "../apps/actorDetails.mjs";
import { BRPSelectLists } from "../apps/select-lists.mjs";

export class BRPCheck {


  //Check the request and build out the config 
  static async normaliseRequest (options){

    //Set Roll Type based on options handed in if not already defined
    if ( typeof options.event === 'undefined') {
      if (typeof options.characteristic !="undefined" && typeof options.actor.system.stats[options.characteristic] !== 'undefined') {
        options.rollType ="CH"
      } else {
        ui.notifications.error(game.i18n.localize('BRP.ErrorRollNotFound'))
        return false          
      }
      }
    
    //If hand in has an associated event set SHIFT key option 
    if (typeof options.event != 'undefined'){
      options. shiftKey = options.event.shiftKey ?? false;
    }
  
    //Set Basic Config
    let partic =await BRPactorDetails._getParticipantId(options.token,options.actor);
    let config = {
      partic,
      characteristic: options.characteristic ?? false,
      skillId: options.skillId ??  false,
      rollType: options.rollType,
      cardType: options.cardType,
      shiftKey: options.shiftKey ?? false,
      addStat: "none",
      label: "",
      targetScore: 999,
      resist: 0,
      origin: game.user.id,
      originGM: game.user.isGM,
      dialogTemplate: 'systems/brp/templates/dialog/difficulty.html',
      chatTemplate: 'systems/brp/templates/chat/roll-result.html',
      diff:"average",
      rollFormula: "1D100",
      flatMod: 0,
      resultLevel:0
    };

    //Adjust Config based on roll type
    switch(options.rollType){
      case 'CH':
        config.label = options.actor.system.stats[config.characteristic].labelShort ?? "";
        config.targetScore = options.actor.system.stats[config.characteristic].total*5 ?? 999;
        break;
     }

    //Adjust Config based on card type
    switch(options.cardType){
      case 'RE':
      case 'PP':
        config.shiftKey = false;
        break;
     }


    return config;

  }


  //Start to prepare the config
  static async _trigger(options={}){
    let config = await BRPCheck.normaliseRequest(options)

    if (config === false) {return}  
    BRPCheck.startCheck(config);
    return;
  }

  //Start the check now that the config has been prepared
  static async startCheck(config) {  
    let actor = await BRPactorDetails._getParticipant(config.partic.particId, config.partic.particType);

    //If Shift key has been held then accept the defaults above otherwise call a Dialog box for Difficulty, Modifier etc
    if (config.shiftKey){
    } else {
      let usage = await BRPCheck.RollDialog(config);
      if (usage) {
          config.diff = usage.get('difficulty');
          config.addStat= usage.get('addStat');
          config.resistance = Number(usage.get('resistance'));
          config.flatMod = Number(usage.get('flatMod'));
      }
    } 
 
    //If this is a resistance roll and a second characteristic has been added updated chances and label
    if (config.addStat !='none' && config.cardType === 'RE') {
      config.label = config.label +' & ' + actor.system.stats[config.addStat].labelShort;
      config.targetScore = config.targetScore + (actor.system.stats[config.addStat].total * 5)
    }

    //Adjust the targetScore for Difficulty
    switch (config.diff) {
      case "easy":
        config.targetScore = config.targetScore *2;
        break;
      case "difficult":
        config.targetScore = Math.ceil(config.targetScore *0.5);
        break;
      case "impossible":
        config.targetScore = 1;
        break;  
    }

    //If this is not an impossible roll then add the flatModifier.
    if (config.diff !='impossible') {
      config.targetScore = Number(config.targetScore) + Number(config.flatMod);
    }

    await BRPCheck.makeRoll(config) 
  }

  //Call Dice Roll, calculate Result and store original results in rollVal
  static async makeRoll(config) {
    let roll = new Roll(config.rollFormula);
    await roll.roll({ async: true});
    config.roll = roll;
    config.rollResult = Number(config.roll.result);
    config.rollVal = Number(config.rollResult)

    //For Resistance and PvP recalc the Targetscore  
    if (config.cardType === 'RE' || config.cardType === 'PP'){
      config.targetScore = (((config.targetScore/5) - config.resistance)*5)+50

      //Change target score bases on game setting options
      if (game.settings.get('brp','resistRoll')) {
        config.targetScore = Math.max(config.targetScore,1)
        config.targetScore = Math.min(config.targetScore,99)
      } else {
        config.targetScore = Math.max(config.targetScore,0)

        config.targetScore = Math.min(config.targetScore,100)
      }
    }

    //Get the level of Success
    config.resultLevel = await BRPCheck.successLevel(config)

    //If Resistance roll and not using detailed results then change result to simple Success/Failure
    if ((config.cardType === 'RE' || config.cardType === 'PP') && !game.settings.get('brp','resistLevels')) {
      if (config.resultLevel >2) {config.resultLevel = 2};
      if (config.resultLevel < 1) {config.resultLevel = 1};
    }
  
    //Create the ChatMessage and Roll Dice
    const html = await BRPCheck.startChat(config);
    let msgId =  await BRPCheck.showChat(html,config);

    return msgId
  } 



  //Function to call the Difficulty & Modifier Dialog box 
  static async RollDialog (options) {
    const difficultyOptions = await BRPSelectLists.getDifficultyOptions()
    const addStatOptions = await BRPSelectLists.addStatOptions(options.characteristic)
    const data = {
      type : options.rollType,
      cardType: options.cardType,
      label: options.label,
      difficulty: "average",
      difficultyOptions,
      addStatOptions,
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

  // Calculate Success Level
  //
  static async successLevel (config){
    //Set the critical and fumble chances  
      let critChance = Math.ceil(0.05*config.targetScore);
      let fumbleChance = Math.min(95+critChance,100);
      let specialChance = Math.round(0.2*config.targetScore);
      let successChance = Math.min(config.targetScore,95);
      if(config.cardType === 'RE' || config.cardType === 'PP') {
        successChance = config.targetScore;
      }
      
    //Get the level of success
    let resultLevel = 0;
    if (config.rollVal <= critChance) {
      resultLevel = 4;  //4 = Critical
    } else if (config.rollVal <=specialChance) {
      resultLevel = 3;  //3 = Special
    } else if (config.rollVal <=successChance) {
      resultLevel = 2;  //2 = Success
    } else if (config.rollVal >= fumbleChance) {
      resultLevel = 0;  //0 = Fumble
    } else {
      resultLevel = 1;  //1 = Fail
    }
    return resultLevel
  }

  // Prep the chat card
  static async startChat(config) {
    let actor = await BRPactorDetails._getParticipant(config.partic.particId,config.partic.particType)

    let messageData = {
      origin: config.origin,
      originGM: config.originGM,
      speaker: ChatMessage.getSpeaker({ actor: actor.name }),
      rollType: config.rollType,
      cardType: config.cardType,
      label: config.label,
      actorId: actor._id,
      diff: config.diff,
      resistance:config.resistance,
      diffLabel:game.i18n.localize('BRP.'+config.diff),
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

  // Display the chat card and roll the dice
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
} 