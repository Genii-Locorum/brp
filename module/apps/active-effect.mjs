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
        item = fromUuidSync(this.origin)
      }
      if (item instanceof Item) {
        if (item.type === 'wound') {
          return super.active
        }
        if (['armour','weapon','gear'].includes(item.type)) {
            if (['worn','carried'].includes(item.system.equipStatus)) {
              return super.active
            } else {
              return false;
            }
        }
      }
    }
    return super.active;
  }
}
