import { BRPCheck} from "../apps/check.mjs"

export class COCard {

 
  //Resolve a combined card - roll dice, update and close
  static async COResolve (config) {
    let targetMsg = await game.messages.get(config.targetChatId)
    let card=""
    let chatCards =targetMsg.flags.brp.chatCard
    if (chatCards.length <2) {
      ui.notifications.warn(game.i18n.localize('BRP.resolveMore'))
      return}

    let maxRes = -99
    let minRes = 99  
    for (let i = 1; i < chatCards.length; i++) {
      card=chatCards[i]
      maxRes = Math.max(maxRes,card.resultLevel)
      minRes = Math.min(minRes,card.resultLevel)
    }
    let adjVal = 0
    if (minRes === 0) {adjVal = -50} 
    else if (maxRes === 1) {adjVal = -10}
    else if (maxRes === 2) {adjVal = 20}
    else if (maxRes === 3) {adjVal = 30}
    else if (maxRes === 4) {adjVal = 50}
    card=chatCards[0]
    card.flatMod = card.flatMod + adjVal
    card.targetScore = card.targetScore + adjVal
    let newConfig = {
      rollFormula: "1D100",
      targetScore: card.targetScore
    }
    await BRPCheck.makeRoll(newConfig)

    card.resultLevel = newConfig.resultLevel
    card.roll = newConfig.roll
    card.rollResult = newConfig.rollResult
    card.rollVal = newConfig.rollVal
    card.targetScore = newConfig.targetScore  
    card.resultLabel = game.i18n.localize('BRP.resultLevel.'+newConfig.resultLevel)

    let newchatCards = []
    newchatCards.push(card)
    for (let i = 1; i < chatCards.length; i++) {
      card=chatCards[i]
      newchatCards.push(card)
    }

    AudioHelper.play({ src: CONFIG.sounds.dice }, true)
    await targetMsg.update({'flags.brp.chatCard' :newchatCards,
                            'flags.brp.successLevel': newConfig.resultLevel,
                            'flags.brp.successLabel': game.i18n.localize('BRP.resultLevel.'+newConfig.resultLevel), 
                            'flags.brp.successRoll': newConfig.rollVal,
                            'flags.brp.state': 'closed',
                          })
    const pushhtml = await BRPCheck.startChat(targetMsg.flags.brp)
    await targetMsg.update({content: pushhtml})    
    if (newConfig.resultLevel > 1) {                      
      await BRPCheck.tickXP (targetMsg.flags.brp)
    }  
    return
  }  


}