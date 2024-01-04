import { BRPCheck} from "../apps/check.mjs"

export class GRCard {

  //Add a new skill to a Combined Card
  static async GRAdd (config, msgId) {
    if (game.user.isGM) {
      let targetMsg = await game.messages.get(msgId)
      if ((targetMsg.flags.brp.chatCard).length >=5 && (targetMsg.flags.brp.cardType === 'GR' || targetMsg.flags.brp.cardType === 'CO')) {
        ui.notifications.warn(game.i18n.localize('BRP.resolveMax'))    
        return
      } else if ((targetMsg.flags.brp.chatCard).length >=2 && targetMsg.flags.brp.cardType === 'OP') {
        ui.notifications.warn(game.i18n.localize('BRP.resolveMax'))    
        return
      }

      let newChatCards = targetMsg.flags.brp.chatCard
      newChatCards.push(config.chatCard[0])
      await targetMsg.update({'flags.brp.chatCard' :newChatCards})
      const pushhtml = await BRPCheck.startChat(targetMsg.flags.brp)
      await targetMsg.update({content: pushhtml})
    } else {
      const availableGM = game.users.find(d => d.active && d.isGM)?.id
      if (availableGM) {
        game.socket.emit('system.brp', {
          type: 'GRAdd',
          to: availableGM,
          value: {config, msgId}
        })
      } else {
        ui.notifications.warn(game.i18n.localize('BRP.noAvailableGM'))     
      }
    }
  }

  
  //Remove a skill from a combined card
  static async GRRemove (config) {
    let targetMsg = await game.messages.get(config.targetChatId)
    let rank = config.event.currentTarget.dataset.rank
    let newChatCards =targetMsg.flags.brp.chatCard
    newChatCards.splice(rank, 1)
    await targetMsg.update({'flags.brp.chatCard' :newChatCards})
    return
  }


  //Resolve a combined card - roll dice, update and close
  static async GRResolve (config) {
    let targetMsg = await game.messages.get(config.targetChatId)
    let chatCards =targetMsg.flags.brp.chatCard
    let cardType = targetMsg.flags.brp.cardType
    if (chatCards.length <2) {
      ui.notifications.warn(game.i18n.localize('BRP.resolveMore'))
      return
    }
    
    let newchatCards = []
    let roll = new Roll(chatCards[0].rollFormula)
    await roll.roll({ async: true})
    let rollResult = Number(roll.result)

    let successes = 0
    for (let i of chatCards) {
      i.rollResult = rollResult
      i.rollVal = rollResult
      i.resultLevel = await BRPCheck.successLevel({
        targetScore: i.targetScore,
        rollVal: i.rollVal,
        cardType,
      })
      if (i.resultLevel > 1) {successes++}
      i.resultLabel = game.i18n.localize('BRP.resultLevel.'+i.resultLevel)
      newchatCards.push(i)
    }
    successes = successes/chatCards.length    
    AudioHelper.play({ src: CONFIG.sounds.dice }, true)
    await targetMsg.update({'flags.brp.chatCard' :newchatCards,
                            'flags.brp.state': 'closed',
                            'flags.brp.successLevel': successes,
                            'flags.brp.rollResult': rollResult,
                            'rolls': [roll]})
    const pushhtml = await BRPCheck.startChat(targetMsg.flags.brp)
    await targetMsg.update({content: pushhtml})                        
    await BRPCheck.tickXP (targetMsg.flags.brp)
    return
  }  

  static async GRClose (config) {
    let targetMsg = await game.messages.get(config.targetChatId)
    await targetMsg.update({'flags.brp.state': 'closed',
                            'flgs.brp.successLevel': -1,
                            'flags.brp.chatCard' :[]})
    const pushhtml = await BRPCheck.startChat(targetMsg.flags.brp)
    await targetMsg.update({content: pushhtml})                        
    return
  }  
}