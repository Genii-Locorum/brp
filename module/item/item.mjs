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
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // If there's no roll data, send a chat message.
    if (!this.system.formula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
