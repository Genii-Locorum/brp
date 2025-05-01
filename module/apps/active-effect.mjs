export class BRPActiveEffect extends ActiveEffect {
  get active() {
    if (typeof this.origin === 'string') {
      let item
      if (this.parent.isToken && !this.parent.token.actorLink) {
        const match = this.origin.match(/\.([^\.]+)$/)
        if (match) {
          item = this.parent.items.get(match[1])
        }
      } else {
        const item = fromUuidSync(this.origin)
      }
      if (item instanceof Item) {
        if (item.type === 'armour' ? item.system.equipStatus !== 'worn' : item.system.equipStatus !== 'carried') {
          return false;
        }
      }
    }
    return super.active;
  }
}
