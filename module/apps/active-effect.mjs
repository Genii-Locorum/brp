export class BRPActiveEffect extends ActiveEffect {
  get active() {
    if (typeof this.origin === 'string') {
      const item = fromUuidSync(this.origin)
      if (item instanceof Item) {
        if (item.type === 'armour' ? item.system.equipStatus !== 'worn' : item.system.equipStatus !== 'carried') {
          return false;
        }
      }
    }
    return super.active;
  }
}
