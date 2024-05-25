import {BRPCheck} from "../apps/check.mjs"
import {isCtrlKey} from '../apps/helper.mjs'

export class BRPItem extends Item {
  constructor (data, context) {
    if (typeof data.img === 'undefined') {
      if (data.type === 'powerMod') {
        data.img = 'systems/brp/assets/Icons/broken-shield.svg'
      } else if (data.type === 'failing') {
        data.img = 'systems/brp/assets/Icons/drama-masks.svg'
      } else if (data.type === 'hit-location') {
        data.img = 'systems/brp/assets/Icons/arm-bandage.svg'
      } else if (data.type === 'magic') {
        data.img = 'systems/brp/assets/Icons/scroll-unfurled.svg'
      } else if (data.type === 'mutation') {
        data.img = 'systems/brp/assets/Icons/dna1.svg'
      } else if (data.type === 'personality') {
        data.img = 'systems/brp/assets/Icons/inner-self.svg'
      } else if (data.type === 'power') {
        data.img = 'systems/brp/assets/Icons/lightning-helix.svg'
      } else if (data.type === 'profession') {
        data.img = 'systems/brp/assets/Icons/blacksmith.svg'
      } else if (data.type === 'psychic') {
        data.img = 'systems/brp/assets/Icons/suspicious.svg'
      } else if (data.type === 'skill') {
        data.img = 'systems/brp/assets/Icons/skills.svg'
      } else if (data.type === 'sorcery') {
        data.img = 'systems/brp/assets/Icons/bolt-spell-cast.svg'
      } else if (data.type === 'powerMod') {
        data.img = 'systems/brp/assets/Icons/broken-shield.svg'
      } else if (data.type === 'super') {
        data.img = 'systems/brp/assets/Icons/deadly-strike.svg'
      } else if (data.type === 'armour') {
        data.img = 'systems/brp/assets/Icons/lamellar.svg'
      } else if (data.type === 'gear') {
        data.img = 'systems/brp/assets/Icons/knapsack.svg'
      } else if (data.type === 'weapon') {
        data.img = 'systems/brp/assets/Icons/saber-and-pistol.svg'
      } else if (data.type === 'wound') {
        data.img = 'systems/brp/assets/Icons/drop.svg'
      } else if (data.type === 'allegiance') {
        data.img = 'systems/brp/assets/Icons/all-seeing-eye.svg'
      } else if (data.type === 'passion') {
        data.img = 'systems/brp/assets/Icons/shining-heart.svg'
      }
    }
    super(data, context)
  }


  prepareData() {
    super.prepareData();
  }

   getRollData() {
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    rollData.item = foundry.utils.deepClone(this.system);
    return rollData;
  }

  async roll() {
    const item = this;
    const actor = this.actor;
    let altKey = event.altKey;
    let ctrlKey = isCtrlKey(event ?? false);
    let cardType = "NO";
    let rollType =""
    let skillId = "";
    let itemId = "";
    let shiftKey = event.shiftKey;
    if (game.settings.get('brp','switchShift')) {
      shiftKey = !shiftKey
    }
  
    switch (item.type) {
      case 'skill':
        rollType="SK"
        skillId = item._id
        if (ctrlKey){cardType='OP'}
        if (altKey){cardType='GR'}
        break
        case 'allegiance':
          rollType="AL"
          skillId = item._id
          break  
      case 'weapon' :
        rollType="CM"
        itemId = item._id
        skillId = actor.items.get(itemId).system.sourceID
        break
      default:
        item.sheet.render(true);
        return
    }

    BRPCheck._trigger({
      rollType,
      cardType,
      skillId,
      itemId,
      shiftKey,
      actor,
    })
  }  
  
}
