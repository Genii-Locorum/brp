import { BRPactorDetails } from "./actorDetails.mjs"
import { BRPSelectLists } from "./select-lists.mjs"
import { BRPCombat } from "./combat.mjs"
import { GRCard} from "../cards/combined-card.mjs"
import { OPCard} from "../cards/opposed-card.mjs"
import { COCard} from "../cards/cooperative-card.mjs"
import { CBCard} from "../cards/combat-card.mjs"

export class BRPCheck {

  //Roll Types
  //CH = Characteristic
  //SK = Skill
  //DM = Damage
  //CM = Combat
  //AR = Armour (Random)
  //AL = Allegiance Roll
  //PA - Passion Roll
  //PT - Personality Trait Roll
  //RP - Reputation Roll
  
  //Card Types
  //NO = Normnal Roll
  //RE = Resistance Roll (CH only)
  //PP = POW v POW (CH only)
  //GR = Combined (Group) Roll
  //CO = Cooperative Roll
  //OP = Opposed Roll
  //CB = Combat Roll


  //Start to prepare the config
  static async _trigger(options={}){
    let config = await BRPCheck.normaliseRequest(options)
   if (config === false) {return}  
   BRPCheck.startCheck(config)
   return
  }  


  //Check the request and build out the config 
  static async normaliseRequest (options){
    //Set Basic Config
    let partic =await BRPactorDetails._getParticipantId(options.token,options.actor)
    let particImg = await BRPactorDetails.getParticImg(partic.particId,partic.particType)
    let particActor = await BRPactorDetails._getParticipant(partic.particId,partic.particType)
    let weapon = ""
    let skill = ""
    let opp = 'false'
    let config = {
      rollType: options.rollType,
      cardType: options.cardType,
      dialogTemplate: 'systems/brp/templates/dialog/difficulty.html',
      chatTemplate: 'systems/brp/templates/chat/roll-result.html',
      state: options.state ?? "open",
      wait: options.wait ?? false,
      successLevel: -1,
      chatType: options.chatType,
      particName: partic.particName,
      particId: partic.particId,
      particType: partic.particType,
      particImg,
      characteristic: options.characteristic ?? false,
      skillId: options.skillId ?? false,
      itemId: options.itemId?? false,
      addStat: options.addStat ?? "none",
      targetScore: options.targetScore ?? 0,
      rawScore: options.rawScore ?? 0,
      resistance: options.resistance ?? 0,
      diff: options.diff ?? "average",
      diffVal: options.diffVal ?? 1,
      rollFormula: options.rollFormula ?? "1D100",
      flatMod: options.flatMod ?? 0,
      diceMod: options.diceMod ?? 0,
      resultLevel: options.resultLevel ?? 0,
      malfunction: options.malfunction ?? 0,
      shiftKey: options.shiftKey ?? false,
      needDiff: options.needDiff ?? true,
      label: options.label ?? "",
      specLabel: options.specLabel ?? "",
      opp: options.opp ?? "false"
    }

    //Adjust Config based on roll type
    switch(options.rollType){
      case 'CH':
          config.label = particActor.system.stats[config.characteristic].labelShort ?? ""
          config.rawScore = particActor.system.stats[config.characteristic].total
          config.targetScore = particActor.system.stats[config.characteristic].total*5 ?? 0
        break
      case 'SK':
        skill = particActor.items.get(config.skillId)
        config.label = skill.name ?? ""
        if (options.actor.type === 'npc') {
          config.rawScore = skill.system.total
          config.targetScore = skill.system.total
        } else {
          config.rawScore = skill.system.total + options.actor.system.skillcategory[skill.system.category] ?? 0
          config.targetScore = skill.system.total + options.actor.system.skillcategory[skill.system.category] ?? 0
        }
        break
      case 'AL':  
      case 'PA':
      case 'RP':
      skill = particActor.items.get(config.skillId)
        config.label = skill.name ?? ""
        config.rawScore = skill.system.total
        config.targetScore = skill.system.total
        break
      case 'PT':
        skill = particActor.items.get(config.skillId)
        config.label = skill.name ?? ""
        config.rawScore = skill.system.total
        config.targetScore = skill.system.total
        if (config.opp === 'true') {
          config.label = skill.system.oppName ?? ""
          config.rawScore = skill.system.opptotal
          config.targetScore = skill.system.opptotal
        }          
        break;
      case 'DM':  
        weapon = particActor.items.get(config.itemId)
        config.label = weapon.name ?? ""
        let damageData = await BRPCombat.damageFormula(weapon, particActor)
        config.specLabel = game.i18n.localize('BRP.'+weapon.system.special)
        config.rollFormula = damageData.damage
        config.resultLevel = damageData.success
        config.shiftKey = true
        config.chatTemplate =  'systems/brp/templates/chat/roll-damage.html'
        break
      case 'CM':  
        weapon = particActor.items.get(config.itemId)
        config.label = weapon.name ?? ""
        if (particActor.type === 'npc') {
          config.rawScore = weapon.system.npcVal
          config.targetScore = weapon.system.npcVal         
        } else {
          skill = particActor.items.get(config.skillId)
          config.label = skill.name ?? ""
          config.rawScore = skill.system.total + options.actor.system.skillcategory[skill.system.category]
          config.targetScore = skill.system.total + options.actor.system.skillcategory[skill.system.category] ?? 0     
        }
        config.malfunction = weapon.system.mal          
        break     
      case 'AR':
        config.label = options.label
        config.rollFormula = options.AVform  
        config.shiftKey = true
        config.chatTemplate =  'systems/brp/templates/chat/roll-armour.html'
        break
      default: 
        ui.notifications.error(options.rollType +": " + game.i18n.format('BRP.errorRollInvalid')) 
        return false
     }

    //Adjust Config based on card type
    switch(options.cardType){
      case 'NO':
        config.state = 'closed'
        break
      case 'RE':
      case 'PP':
        config.needDiff = false
        config.shiftKey = false
        config.state = 'closed'
        break
      case 'GR':
        config.wait = true  
        if (!foundry.utils.isNewerVersion(game.version,'11')) {
          config.chatType = CONST.CHAT_MESSAGE_STYLES.OTHER
        } else {
          config.chatType = CONST.CHAT_MESSAGE_OTHER
        }
        config.chatTemplate =  'systems/brp/templates/chat/roll-combined.html'
        break
      case 'OP':
        if (!foundry.utils.isNewerVersion(game.version,'11')) {
          config.chatType = CONST.CHAT_MESSAGE_STYLES.OTHER
        } else {
          config.chatType = CONST.CHAT_MESSAGE_OTHER
        }
        config.chatTemplate =  'systems/brp/templates/chat/roll-opposed.html'
        break
      case 'CO':
        if (!foundry.utils.isNewerVersion(game.version,'11')) {
          config.chatType = CONST.CHAT_MESSAGE_STYLES.OTHER
        } else {
          config.chatType = CONST.CHAT_MESSAGE_OTHER
        }
        config.chatTemplate =  'systems/brp/templates/chat/roll-cooperative.html'
        break
      case 'CB':
        if (!foundry.utils.isNewerVersion(game.version,'11')) {
          config.chatType = CONST.CHAT_MESSAGE_STYLES.OTHER
        } else {
          config.chatType = CONST.CHAT_MESSAGE_OTHER
        }
        config.chatTemplate =  'systems/brp/templates/chat/roll-combat.html'
        break
      default: 
        ui.notifications.error(options.cardType +": " + game.i18n.format('BRP.errorCardInvalid')) 
        return false
    }


    return config

  }


  //Start the check now that the config has been prepared
  static async startCheck(config) {  
    let actor = await BRPactorDetails._getParticipant(config.particId, config.particType)
    //If Shift key has been held then accept the defaults above otherwise call a Dialog box for Difficulty, Modifier etc
    if (config.shiftKey){
    } else {
      let usage = await BRPCheck.RollDialog(config)
      if (usage) {
          config.diff = usage.get('difficulty')
          config.addStat= usage.get('addStat')
          config.resistance = Number(usage.get('resistance'))
          config.flatMod = Number(usage.get('flatMod'))  
          config.diffVal = Number(usage.get('diffVal'))
      }
    } 
 
    //If this is a resistance roll and a second characteristic has been added updated chances and label
    if (config.addStat !='none' && config.cardType === 'RE') {
      config.label = config.label +' & ' + actor.system.stats[config.addStat].labelShort
      config.targetScore = config.targetScore + (actor.system.stats[config.addStat].total * 5)
    }

    //Adjust the targetScore for Difficulty
    if (game.settings.get('brp','diffValue')) {
      if (config.rollType === 'CH') {
        config.targetScore = Math.ceil(config.targetScore * config.diffVal/5)
      }  else {
        config.targetScore = Math.ceil(config.targetScore * config.diffVal)
      }
    } else {
      switch (config.diff) {
        case "easy":
          config.targetScore = config.targetScore *2
          break
        case "difficult":
          config.targetScore = Math.ceil(config.targetScore *0.5)
          break
        case "hard":
          config.targetScore = Math.ceil(config.targetScore *0.4)
          break
        case "extreme":
          config.targetScore = Math.ceil(config.targetScore *0.2)
          break  
        case "impossible":
          config.targetScore = 1
          break  
      }
      //If this is not an impossible roll then add the flatModifier.
      if (config.diff !='impossible') {
        config.targetScore = Number(config.targetScore) + Number(config.flatMod)
      }
    }

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

    if (!config.wait) {  
      await BRPCheck.makeRoll(config)
    }

    //Format the data so it's in the same format as will be held in the Chat Message when saved

    let chatMsgData = {
      rollType: config.rollType,
      cardType: config.cardType,
      chatType: config.chatType, 
      chatTemplate: config.chatTemplate,
      state: config.state,
      wait: config.wait,
      rolls: config.roll,
      successLevel: config.successLevel,
      rollResult: config.rollResult,
      chatCard: [{
        rollType: config.rollType,
        particName: config.particName,
        particId: config.particId,
        particType: config.particType,
        particImg: config.particImg,
        characteristic: config.characteristic ?? false,
        label: config.label,
        skillId: config.skillId,
        itemId: config.itemId,
        addStat: config.addStat,
        targetScore: config.targetScore,
        rawScore: config.rawScore,
        resistance: config.resistance,
        diff: config.diff,
        diffVal: config.diffVal,
        diffLabel: game.i18n.localize('BRP.'+config.diff),
        rollFormula: config.rollFormula,
        flatMod: config.flatMod,
        diceMod: config.diceMod,
        malfunction: config.malfunction,
        rollResult: config.rollResult,
        rollVal: config.rollVal,
        roll: config.roll,
        diceRolled: config.diceRolled,
        resultLevel: config.resultLevel,
        resultLabel: game.i18n.localize('BRP.resultLevel.'+config.resultLevel),
        specLabel: config.specLabel,
        opp: config.opp
      }]
    }


    //Create the ChatMessage and Roll Dice
    if (['GR', 'OP', 'CO', 'CB'].includes(config.cardType)) {
      let checkMsgId = await BRPCheck.checkNewMsg (chatMsgData)
      if (checkMsgId != false) {
        //Trigger adding check to the card.
          await GRCard.GRAdd(chatMsgData,checkMsgId)
        return
        }
      }


    const html = await BRPCheck.startChat(chatMsgData)
    let msgId =  await BRPCheck.showChat(html,chatMsgData)

    //Check for adding Improvement tick
    if (game.settings.get('brp','autoXP')) {
      await BRPCheck.tickXP (chatMsgData)
    }  

    return msgId
  }

  //Call Dice Roll, calculate Result and store original results in rollVal
  static async makeRoll(config) {
    let roll = new Roll(config.rollFormula)
    await roll.evaluate()
    config.roll = roll
    config.rollResult = Number(roll.total)
    config.rollVal = Number(config.rollResult)
    
    let diceRolled=""
    for (let diceRoll = 0; diceRoll<roll.dice.length; diceRoll++) {
      for (let thisDice = 0; thisDice<roll.dice[diceRoll].values.length; thisDice++){
        if (thisDice !=0 || diceRoll !=0) {
          diceRolled = diceRolled + ", "
        }
        diceRolled = diceRolled + roll.dice[diceRoll].values[thisDice]
      }
    }
    config.diceRolled = diceRolled

    //Don't need success levels in some cases
    if (['DM', 'AR'].includes(config.rollType)) {return}

    //Get the level of Success
    config.resultLevel = await BRPCheck.successLevel(config)

    //If a Combat Roll and with a malfunction chance > 0 then make the check
    if (config.rollType === 'CM' && config.malfunction > 0 && config.rollVal >= config.malfunction) {
      config.malfunction = -config.malfunction
    }

    //If Resistance roll and not using detailed results then change result to simple Success/Failure
    if ((config.cardType === 'RE' || config.cardType === 'PP') && !game.settings.get('brp','resistLevels')) {
      if (config.resultLevel > 2) {config.resultLevel = 2}
      if (config.resultLevel < 1) {config.resultLevel = 1}
    }
    return  
  }



  //Function to call the Difficulty & Modifier Dialog box 
  static async RollDialog (options) {
    let data =""
    switch (options.rollType) {
      case 'DM':
        data = {
          type : options.rollType,
          rangeOptions: options.rangeOptions,
          handOptions: options.handOptions,
          successOptions: options.successOptions,
          label: options.label,
          askHands: options.askHands,
          askRange: options.askRange,
          askSuccess: options.askSuccess       
        }
        break
      default:  
        const difficultyOptions = await BRPSelectLists.getDifficultyOptions()
        const addStatOptions = await BRPSelectLists.addStatOptions(options.characteristic)
        data = {
          type : options.rollType,
          addStat: options.addStat,
          diffVal: options.diffVal,
          cardType: options.cardType,
          needDiff: options.needDiff,
          useDiffValue: game.settings.get('brp','diffValue'),
          label: options.label,
          diff: options.diff,
          difficultyOptions,
          addStatOptions,
        }
      break  
    }
    const html = await renderTemplate(options.dialogTemplate,data)
    return new Promise(resolve => {
      let formData = null
      const dlg = new Dialog({
        title: "",
        content: html,
        buttons: {
          roll: {
            label: game.i18n.localize("BRP.proceed"),
            callback: html => {
            formData = new FormData(html[0].querySelector('#difficulty-roll-form'))
            return resolve(formData)
            }
          }
        },
      default: 'roll',
      close: () => {}
      })
      dlg.render(true)
    })
  }  

  // Calculate Success Level
  //
  static async successLevel (config){
    //Set the critical and fumble chances  
      let critChance = Math.ceil(0.05*config.targetScore)
      let fumbleChance = Math.min(95+critChance,100)
      let specialChance = Math.round(0.2*config.targetScore)
      let successChance = Math.min(config.targetScore,95)
      if(config.cardType === 'RE' || config.cardType === 'PP') {
        successChance = config.targetScore
      }     
    //Get the level of success
    let resultLevel = 0
  
      if (config.rollVal <= critChance) {
        resultLevel = 4  //4 = Critical
      } else if (config.rollVal <=specialChance) {
        resultLevel = 3  //3 = Special
      } else if (config.rollVal <=successChance) {
        resultLevel = 2  //2 = Success
      } else if (config.rollVal >= fumbleChance) {
        resultLevel = 0  //0 = Fumble
      } else {
        resultLevel = 1  //1 = Fail
      }
    return resultLevel
  }

  
  // Prep the chat card
  static async startChat(chatMsgData) {
    let html = await renderTemplate (chatMsgData.chatTemplate, chatMsgData)
    return html
  }  


  // Display the chat card and roll the dice
  static async showChat(html,chatMsgData) {
    let chatData={}
      chatData = {
        author: game.user.id,
        type: chatMsgData.chatType,
        content: html,
        flags: { 'brp': { 
          initiator: chatMsgData.chatCard[0].particId,
          initiatorType: chatMsgData.chatCard[0].particType,
          chatTemplate: chatMsgData.chatTemplate,
          state: chatMsgData.state,
          cardType: chatMsgData.cardType,
          rollType: chatMsgData.rollType,
          wait: chatMsgData.wait,
          successLevel: chatMsgData.successLevel,
          chatCard: chatMsgData.chatCard,
          opp: chatMsgData.opp,
        }},
        speaker: {
          actor: chatMsgData.chatCard[0].particId,
          alias: chatMsgData.chatCard[0].particName,
        },
      }

    if (['NO', 'RE','PP'].includes(chatMsgData.cardType)) {
      chatData.rolls = [chatMsgData.rolls]
    }  

    let msg = await ChatMessage.create(chatData)
    return msg._id
  }


  //Handle XP tickbox
  static async tickXP (msg) {
    let item=""
    let actor=""
    //Don't do XP check until card is closed
    if(msg.state != 'closed') {return}
    switch (msg.cardType) {
      case "RE":
        //No checks for a resist card
        return
      case "PP":  
        //If a POW v POW check target POW greater than current POW
        actor = await BRPactorDetails._getParticipant(msg.chatCard[0].particId,msg.chatCard[0].particType)
        if (msg.chatCard[0].resistance <= actor.system.stats.pow.total || msg.chatCard[0].resultLevel <2) {return}
        await actor.update({'system.stats.pow.improve': true})
        break
      case "NO":
      case "GR":
      case "OP":
      case "CB":
      case "CO":  
        //Allow checks for Normal,Combined and Oppossed cards, unless it's a Characteristic or Allegiance Check or a Damage Roll
        if (['CH', 'AL', 'DM'].includes(msg.rollType)) {return}  
        for (let i of msg.chatCard) {
          if(i.diff != 'easy' && i.diffVal <= 1 && i.resultLevel>1) {
            
            actor = await BRPactorDetails._getParticipant(i.particId,i.particType)
            item = await actor.items.get(i.skillId)
            if (item.type !='reputation') {
              if (item.type === 'persTrait' && i.opp === 'true') {
                await item.update({'system.oppimprove': true})
              } else {
                await item.update({'system.improve': true})
              }
            }   
          }
        }
        break  
      } 
    return  
  }


  //Function when Chat Message buttons activated to call socket
  static async triggerChatButton(event){
    const targetElement = event.currentTarget
    const presetType = targetElement.dataset?.preset
    const dataset = targetElement.dataset
    const targetChat = $(targetElement).closest('.message')
    let targetChatId = targetChat[0].dataset.messageId
    let origin = game.user.id
    let originGM = game.user.isGM

    if (game.user.isGM){
      BRPCheck.handleChatButton ({presetType, targetChatId, origin, originGM,event,dataset})
    } else {
      const availableGM = game.users.find(d => d.active && d.isGM)?.id
      if (availableGM) {
        game.socket.emit('system.brp', {
          type: 'chatUpdate',
          to: availableGM,
          value: {presetType, targetChatId, origin, originGM,event}
        })
      } else {
        ui.notifications.warn(game.i18n.localize('BRP.noAvailableGM'))     
      }
    }
  }


  //Handle changes to Cards based on the presetType value - will be carried out by a GM
  static async handleChatButton(data) {
    const presetType = data.presetType
    let targetMsg = await game.messages.get(data.targetChatId)

    switch(presetType) {
      case "close-card":
        await GRCard.GRClose(data)
        break
      case "remove-gr-roll":
        await GRCard.GRRemove(data)
        break
      case "resolve-gr-card":
        await GRCard.GRResolve(data)        
        break
      case "resolve-op-card":
        await OPCard.OPResolve(data)        
        break  
      case "resolve-cb-card":
        await CBCard.CBResolve(data)        
        break          
      case "resolve-co-card":
        await COCard.COResolve(data)        
        break          
      default:
        return
      }
    const pushhtml = await BRPCheck.startChat(targetMsg.flags.brp)
    await targetMsg.update({content: pushhtml})

    return
  }  


  //Check to see if there is an open card that matches the cardTyoe that's not more than a day old
  static async checkNewMsg (config) {  
      let messages = ui.chat.collection.filter(message => {
        if (
          config.cardType === message.getFlag('brp', 'cardType') &&
          message.getFlag('brp', 'state') !== 'closed'
        ) {
          if (['GR'].includes(config.cardType)) {
            return message.getFlag('brp', 'initiator') === config.chatCard[0].particId
          }   
          return true
        }
        return false
      })

      if (messages.length) {
        // Old messages can't be used if message is more than a day old mark it as resolved
        const timestamp = new Date(messages[0].timestamp)
        const now = new Date()
        const timeDiffSec = (now - timestamp) / 1000
        if (60 * 60 *24 < timeDiffSec) {
          await messages[0].setFlag('brp', 'state', 'closed')
          messages = []
        }
      }

      if (!messages.length) {return false}
      else {return messages[0].id}
  }

} 