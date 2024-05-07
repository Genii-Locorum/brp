import { BRPCheck} from "../apps/check.mjs"

export class OPCard {

 
  //Resolve an opposed card - roll dice, update and close
  static async OPResolve (config) {
    let targetMsg = await game.messages.get(config.targetChatId)
    let chatCards =targetMsg.flags.brp.chatCard
    if (chatCards.length <2) {
      ui.notifications.warn(game.i18n.localize('BRP.resolveMore'))
      return}

    //Sort chatCards by result level, by roll and then by rawValue
    chatCards.sort(function(a, b){
      let x = a.rawScore;
      let y = b.rawScore;
      let r = a.rollVal;
      let s = b.rollVal;
      let p = a.resultLevel;
      let q = b.resultLevel;
      if (p > q) {return -1};
      if (p < q) {return 1};
      if (r > s) {return -1};
      if (r < s) {return 1};
      if (x > y) {return -1};
      if (x < y) {return 1};
      return 0;
    });

    let newchatCards = []
    //Get the success level of the second placed person
    let adjLevel = chatCards[1].resultLevel
    adjLevel = Math.max(adjLevel -1,0)
    for (let i of chatCards) {
      i.origResLevel = i.resultLevel
      if (i.origResLevel >1) {
        i.resultLevel = Math.max(i.resultLevel - adjLevel,2)
      }
      i.resultLabel = game.i18n.localize('BRP.resultLevel.'+i.resultLevel)  
      i.origResLabel = game.i18n.localize('BRP.resultLevel.'+i.origResLevel)
      newchatCards.push(i)
      await OPCard.showDiceRoll(i)  
    }  

    await targetMsg.update({'flags.brp.chatCard' :newchatCards,
                            'flags.brp.state': 'closed',
                          })
    const pushhtml = await BRPCheck.startChat(targetMsg.flags.brp)
    await targetMsg.update({content: pushhtml})    
    await BRPCheck.tickXP (targetMsg.flags.brp)
    return
  }  

  static async showDiceRoll(chatCard) {  
    //If this is an Opposed or Combat roll then for the dice to roll if Dice so Nice used
      if (game.modules.get('dice-so-nice')?.active) {
        let tens = Math.floor(chatCard.rollResult/10)
        let units = chatCard.rollResult-(10*tens)
        if (chatCard.rollResult === 100) {
          tens=0
          units = 0
        }
        const diceData = {
          throws:[{
            dice:[
              {
                resultLabel:chatCard.rollResult,
                result:tens,
                type:"d100",
                options: {},  
                vectors:[]
              },
              {
                resultLabel:chatCard.rollResult,
                result:units,
                type:"d10",
                options: {},  
                vectors:[]
              }
            ]
          }]
        }
        game.dice3d.show(diceData,game.user,true,null,false)  //Dice Data,user,sync,whispher,blind
      }  
  }
}