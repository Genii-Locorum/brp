import { BRPactorDetails} from './actorDetails.mjs'

export class BRPCharDev {

  //Toggle GM Devevlopment Phase off and on
  static async developmentPhase(toggle) {
    await game.settings.set('brp', 'development', toggle)
    ui.notifications.warn(
      toggle
        ? game.i18n.localize('BRP.devPhaseOn')
        : game.i18n.localize('BRP.devPhaseOff')
    )

  }

  //Do XP improve for all items in actor
  static async onXPGainAll(actor,token,rollType) {
    let success = []
    let results ={}
    let partic = await BRPactorDetails._getParticipantPriority(token, actor);
    for (let i of partic.items) { 
      if (i.system.improve) {
        results = await BRPCharDev.xpCheck(actor,token,i._id, rollType);
        success.push(results)
      }
    }
      await BRPCharDev.xpOutput(success, partic)
    return;
  }

  //Prep a single XP check
  static async onXPGainSingle(itemId,actor,token,rollType) {
    let success = []
    let results ={}
    let partic = await BRPactorDetails._getParticipantPriority(token, actor);
    let item = partic.items.get(itemId)
    if (!item.system.improve) {return}
    results = await BRPCharDev.xpCheck(actor,token,itemId, rollType);
    success.push(results)
    await BRPCharDev.xpOutput(success, partic)
    return;
  }  

  //Make XP check and if appropriate calc/roll XP gain
  static async xpCheck(actor,token,itemId,type) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor);
    let improvVal = 0
    let item = partic.items.get(itemId)
    let score = item.system.total
    if (!item.system.improve) {return}
    let result = await BRPCharDev.xpRoll (score, actor.system.xpBonus)
    if(result.level === 1) {
      if(type === 'fixed') {
        improvVal = game.settings.get('brp','xpFixed')
      }  else {
        let roll = new Roll(game.settings.get('brp','xpFormula'))
        await roll.roll({ async: true});
        improvVal = roll.total
      }
    }
    await item.update({
                       'system.improve': false,
                       'system.xp': item.system.xp+improvVal
                      })
    return ({
      name: item.name,
      level: result.level,
      diceRoll: result.diceRoll,
      score: score,
      improvVal,
    })  
  }


  //XP Check Dice Roll & return success level
  static async xpRoll(target,bonus) {
    let resultLevel = 0
    let roll = new Roll('1D100')
    await roll.roll({ async: true});
    target =Math.min(target,100)
    if (Number(roll.total)+bonus > target) {
      resultLevel = 1
    }
    return ({'level': resultLevel,
             'diceRoll': Number(roll.total)+bonus
            })
  }


  //Get ready to produce the XP check Output
  static async xpOutput(success, partic) {
    const html = await BRPCharDev.xpChatCard(success, partic.name);
    let msg = await BRPCharDev.showXPChat (html,partic)
  }  


  //Prepare XP Roll Chat Card
  static async xpChatCard (success, actorName) {
    let messageData = {
      speaker: ChatMessage.getSpeaker({ actor: actorName }),
      success: success
    }
    const messageTemplate = 'systems/brp/templates/chat/XP-result.html'
    let html = await renderTemplate (messageTemplate, messageData);
    return html;
  }


  // Display the XP chat card
  static async showXPChat(html, actor) {
    let chatData={};
    chatData = {
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: html,
      speaker: {
        actor: actor._id,
        alias: actor.name,
      },
      }
    let msg = await ChatMessage.create(chatData);
    AudioHelper.play({ src: CONFIG.sounds.dice }, true)
    return 
  }


  //POW Improvement Check
  static async powImprov (actor,token,type){
    let partic = await BRPactorDetails._getParticipantPriority(token, actor);
    let max = 21   //TODO - replace this with variable based on culture
    let score = partic.system.stats.pow.total
    let chance = (max-score)*5
    let resultLevel = 0
    let roll = new Roll('1D100')
    await roll.roll({ async: true});
    if (roll.total <= chance) {
      resultLevel = 1
    }
    let improvVal = 1
    if (type != "fixed"){
      let impRoll = new Roll ('1D3-1')
      await impRoll.roll({ async: true})
      improvVal = impRoll.total
    }  
    let success = []
    success.push({
      name: game.i18n.localize('BRP.StatsPowAbbr'),
      level: resultLevel,
      diceRoll: roll.total,
      score: chance,
      improvVal,
    }) 
    await BRPCharDev.xpOutput(success, partic)

    await partic.update ({'system.stats.pow.exp': partic.system.stats.pow.exp + improvVal,
                          'system.stats.pow.improve':false
                        })
    return;
  }
}