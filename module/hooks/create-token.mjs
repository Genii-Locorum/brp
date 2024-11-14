/* global Hooks, Dialog, game, ui */
export function listen () {
    Hooks.on('createToken', async (tokenDocument, options, creatorId) => {
        // Only token creator can roll
        if (game.user.id !== creatorId) return
      // Set token icon correctly
      if (
        tokenDocument.texture.src === 'icons/svg/mystery-man.svg' &&
        tokenDocument.texture.src !== tokenDocument._object.actor.img) {
        tokenDocument.texture.src = tokenDocument._object.actor.img
      }

      //Set Name and Bars Displays based on game settings.
      if(tokenDocument.actor.type === 'npc') {
        if (game.settings.get('brp','npcName')) {
          let updates=[({_id:tokenDocument._id,displayName:CONST.TOKEN_DISPLAY_MODES[game.settings.get('brp','npcName')]})]
          canvas.scene.updateEmbeddedDocuments("Token", updates)
        }
        if (game.settings.get('brp','npcBars')) {
          let updates=[({_id:tokenDocument._id,displayBars:CONST.TOKEN_DISPLAY_MODES[game.settings.get('brp','npcBars')]})]
          canvas.scene.updateEmbeddedDocuments("Token", updates)
        }
      }

      // If not a character, is not linked to actor and there is something to roll ask if we should roll it
      if (tokenDocument._object.actor.type !== 'character' && (tokenDocument._object.actor.hasRollableCharacteristics) && !tokenDocument._object.actor.prototypeToken.actorLink ) {
        switch (game.settings.get('brp', 'tokenDropMode')) {
          case 'ask':
            new Dialog(
              {
                title: game.i18n.localize('BRP.tokenCreationRoll.title'),
                content: game.i18n.localize('BRP.tokenCreationRoll.prompt'),
                buttons: {
                  roll: {
                    label: game.i18n.localize('BRP.tokenCreationRoll.buttonRoll'),
                    callback: async () => {
                      await tokenDocument._object.actor.rollCharacteristicsValue()
                      ui.notifications.info(game.i18n.format('BRP.tokenCreationRoll.rolled', { name: tokenDocument.object.actor.name }))
                      tokenDocument._object.actor.lock = true
                    }
                  },
                  average: {
                    label: game.i18n.localize('BRP.tokenCreationRoll.buttonAverage'),
                    callback: async () => {
                      await tokenDocument._object.actor.averageCharacteristicsValue()
                      ui.notifications.info(game.i18n.format('BRP.tokenCreationRoll.averaged', { name: tokenDocument.object.actor.name }))
                      tokenDocument._object.actor.lock = true
                    }
                  },
                  skip: {
                    label: game.i18n.localize('BRP.buttonSkip')
                  }
                }
              }).render(true)
            break
  
          case 'roll':
            tokenDocument._object.actor.rollCharacteristicsValue()
            ui.notifications.info(game.i18n.format('BRP.tokenCreationRoll.rolled', { name: tokenDocument.object.actor.name }))
            tokenDocument._object.actor.lock = true
            break
  
          case 'average':
            tokenDocument._object.actor.averageCharacteristicsValue()
            ui.notifications.info(game.i18n.format('BRP.tokenCreationRoll.averaged', { name: tokenDocument.object.actor.name }))
            tokenDocument._object.actor.lock = true
            break
  
          case 'ignore':
            break
        }
      }
    })
  }