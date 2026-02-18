import BRPDialog from "../setup/brp-dialog.mjs"
import { BRPActor } from "../actor/actor.mjs"

/* global Dialog, game, ui */
export default async function (document, options, userId) {
  // Only token creator can roll
  if (game.user.id !== userId) return
  // Set token icon correctly
  if (
    document.texture.src === 'icons/svg/mystery-man.svg' &&
    document.texture.src !== document._object.actor.img) {
    document.texture.src = document._object.actor.img
  }

  //Set Token Name and Resource Bars
  if (document.actor.type === 'npc') {
      if (game.settings.get('brp', 'npcName')) {
        let updates = [({ _id: document._id, displayName: CONST.TOKEN_DISPLAY_MODES[game.settings.get('brp', 'npcName')] })]
        canvas.scene.updateEmbeddedDocuments("Token", updates)
      }
      if (game.settings.get('brp', 'npcBars')) {
        let updates = [({ _id: document._id, displayBars: CONST.TOKEN_DISPLAY_MODES[game.settings.get('brp', 'npcBars')] })]
        canvas.scene.updateEmbeddedDocuments("Token", updates)
      }
  }

  // If there is something to roll ask if we should roll it
  if (document._object.actor.type === 'npc') {
    let dropM = game.settings.get('brp', 'tokenDropMode');

    let askStats = false;
    let askDialog = false

    if (dropM === 'ask' && document._object.actor.hasRollableCharacteristics) {
      askStats = true;
      askDialog = true;
    }

    if (askDialog) {
      let statCreateOptions = {
        "roll": game.i18n.localize('BRP.tokenCreationRoll.buttonRoll'),
        "average": game.i18n.localize('BRP.tokenCreationRoll.buttonAverage'),
        "ignore": game.i18n.localize('BRP.buttonSkip')
      }



      const data = {
        askStats,
        statCreateOptions,
      }
      let choices = await createTokenDialog.tokenDialog(data)

      //If choices cancelled then assume any 'ask' become 'ignore'
      if (!choices) {
        if (askStats) {dropM = 'ignore'};
      } else {
        if (askStats) {dropM = choices.statCreate};
      }
    }

    //Apply the Stat Creation Option
    switch (dropM) {
      case 'roll':
        document._object.actor.rollCharacteristicsValue()
        ui.notifications.info(game.i18n.format('BRP.tokenCreationRoll.rolled', { name: document.object.actor.name }))
        document._object.actor.locked = true
        break
      case 'average':
        document._object.actor.averageCharacteristicsValue()
        ui.notifications.info(game.i18n.format('BRP.tokenCreationRoll.averaged', { name: document.object.actor.name }))
        document._object.actor.locked = true
        break
      case 'ignore':
        break
    }
  }
}

export class createTokenDialog {
  static async tokenDialog(data) {
      const html = await foundry.applications.handlebars.renderTemplate("systems/brp/templates/dialog/npcTokenCreate.hbs", data);
      const choices = await BRPDialog.input(
        {
          window: {title: game.i18n.localize('BRP.tokenCreationRoll.title')},
          content: html,
          ok: {},
        }
      );
    return choices;
  }
}
