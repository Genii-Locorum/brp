import { BRPCheck } from './check.mjs';
import { GRCard } from '../cards/combined-card.mjs';
import { BRPDamage } from '../combat/damage.mjs';

export class BRPSystemSocket {

  static async callSocket(data) {
    switch (data.type) {
      case 'chatUpdate':
        if (data.to === game.user.id) {
          BRPCheck.handleChatButton(data.value);
        }
        break;

      case 'GRAdd':
        if (data.to === game.user.id) {
          GRCard.GRAdd(data.value.config, data.value.msgId);
        }
        break;

      case 'firstAidFumble':
        if (data.to === game.user.id) {
          BRPDamage.firstAidFumble(data.value.actorId, data.value.actorType, data.value.locationId);
        }
        break;
    }
  }
}
