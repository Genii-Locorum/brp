import { BRPCheck } from '../apps/check.mjs';
import { BRPactorDetails } from '../apps/actorDetails.mjs';

export function addChatListeners(html) {
  html.on('click', '.cardbutton', BRPCheck.triggerChatButton)
  //return
}


export class BRPChat {
  static async renderMessageHook(message, html) {
    ui.chat.scrollBottom()
    html.querySelectorAll(".cardbutton").forEach(b => b.addEventListener('click', BRPCheck.triggerChatButton));
    if (!game.user.isGM) {
      const ownerOnly = html.querySelectorAll('.owner-only')
      for (const zone of ownerOnly) {
        let actor = await BRPactorDetails._getParticipant(zone.dataset.particId, zone.dataset.particType)
        if ((actor && !actor.isOwner) || (!actor && !game.user.isGM)) {
          zone.style.display = 'none'
        }
      }
    }

    const gmVisibleOnly = html.querySelectorAll('.gm-visible-only')
    for (const elem of gmVisibleOnly) {
      if (!(game.user.isGM)) elem.style.display = 'none'
    }
    return
  }
}
