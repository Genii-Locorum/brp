import { BRPCharacterSheet } from '../actor/sheets/character.mjs';
import { BRPactorDetails } from './actorDetails.mjs';
import { BRPCheck } from './check.mjs';

export class BRPUtilities {

  static async getDataset(el, dataitem) {
    const elem = await el.target ? el.target : el[0];
    const element = await elem?.closest(".item");
    return element.dataset[dataitem];
  }

  static async triggerEdit(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    if (!itemId) { return }
    const item = actor.items.get(itemId);
    item.sheet.render(true);
    return
  }

  static async triggerDelete(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    if (!itemId) { return }
    let name = actor.items.get(itemId).name
    let type = actor.items.get(itemId).type
    let confirmation = await this.confirmation(name, type);
    if (confirmation) {
      await BRPCharacterSheet.confirmItemDelete(actor, itemId);
    }
    return confirmation
  }

  static async confirmation(name, type) {
    let title = ""
    if (type === 'chatMsg') {
      title = game.i18n.localize('BRP.' + name)
    } else {
      title = game.i18n.localize('BRP.delete') + ":" + game.i18n.localize('BRP.' + type) + "(" + name + ")";
    }
    let confirmation = await Dialog.confirm({
      title: title,
      content: game.i18n.localize('BRP.proceed'),
    });
    return confirmation;
  }

  static async getDataFromDropEvent(event, entityType = 'Item') {
    if (event.originalEvent) return []
    try {
      const dataList = JSON.parse(event.dataTransfer.getData('text/plain'))
      if (dataList.type === 'Folder' && dataList.documentName === entityType) {
        const folder = await fromUuid(dataList.uuid)
        if (!folder) return []
        return folder.contents
      } else if (dataList.type === entityType) {
        const item = await fromUuid(dataList.uuid)
        if (!item) return []
        return [item]
      } else {
        return []
      }
    } catch (err) {
      return []
    }
  }

  static async professionDelete(event, actor) {
    const confirmation = await this.triggerDelete(event, actor, "itemId")
    if (!confirmation) { return }

  }




  //Update attributes
  static async updateAttribute(actor, token, att, adj) {
    let partic = await BRPactorDetails._getParticipantPriority(token, actor)
    let checkprop = ""
    let newVal = partic.system[att].value
    let newMax = partic.system[att].max
    if (adj === 'spend') {
      checkprop = { [`system.${att}.value`]: newVal - 1 }
    } else if (adj === 'recover' && newVal < newMax) {
      checkprop = { [`system.${att}.value`]: newVal + 1 }
    } else if (adj === 'restore') {
      checkprop = { [`system.${att}.value`]: newMax }
    } else { return }
    partic.update(checkprop)
  }

  //Create Macro
  static createMacro(bar, data, slot) {
    if (data.type !== 'Item') return
    const item = fromUuidSync(data.uuid, bar)
    if (!item) return
    let command = ''
    command = `game.brp.rollItemMacro("${data.uuid}");`
    if (command !== '') {
      // Create the macro command
      const macro = game.macros.contents.find(
        m => m.name === item.name && m.command === command
      )
      if (!macro) {
        Macro.create(foundry.utils.duplicate({
          name: item.name,
          type: 'script',
          img: item.img,
          command: command,
          flags: { "brp.itemMacro": true }
        })).then(macro => {
          game.user.assignHotbarMacro(macro, slot)
        })
        return false
      }
      game.user.assignHotbarMacro(macro, slot)
      return false
    }
    return true
  }

  //Toggle Beastiary Mode
  static async beastiaryMode(toggle) {
    let state = await game.settings.get('brp', 'beastiary')
    await game.settings.set('brp', 'beastiary', !state)
    ui.notifications.info(
      state
        ? game.i18n.localize('BRP.beastiaryOff')
        : game.i18n.localize('BRP.beastiaryOn')
    )
  }

  //Convert to Kebab Case
  static toKebabCase(s) {
    if (!s) {
      return ''
    }
    const match = s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)

    if (!match) {
      return ''
    }

    return match.join('-').toLowerCase()
  }


  //Copy to Clipboard
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999px'
        textArea.style.top = '-999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        return new Promise((resolve, reject) => {
          document.execCommand('copy')
            ? resolve()
            : reject(
              new Error(game.i18n.localize('BRP.UnableToCopyToClipboard'))
            )
          textArea.remove()
        }).catch(err => ui.notifications.error(err))
      }
    } catch (err) {
      ui.notifications.error(game.i18n.localize('BRP.UnableToCopyToClipboard'))
    }
  }

  //Regex expression
  static quoteRegExp(string) {
    // https://bitbucket.org/cggaertner/js-hacks/raw/master/quote.js
    const len = string.length
    let qString = ''

    for (let current, i = 0; i < len; ++i) {
      current = string.charAt(i)

      if (current >= ' ' && current <= '~') {
        if (current === '\\' || current === "'") {
          qString += '\\'
        }

        qString += current.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
      } else {
        switch (current) {
          case '\b':
            qString += '\\b'
            break

          case '\f':
            qString += '\\f'
            break

          case '\n':
            qString += '\\n'
            break

          case '\r':
            qString += '\\r'
            break

          case '\t':
            qString += '\\t'
            break

          case '\v':
            qString += '\\v'
            break

          default:
            qString += '\\u'
            current = current.charCodeAt(0).toString(16)
            for (let j = 4; --j >= current.length; qString += '0');
            qString += current
        }
      }
    }
    return qString
  }

  //Sort by Name Key
  static sortByNameKey(a, b) {
    return a.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .localeCompare(
        b.name
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLocaleLowerCase()
      )
  }

  //Send Item Description to Chat
  static async sendToChat(el, actor, dataitem) {
    const itemId = await this.getDataset(el, dataitem)
    if (!itemId) { return }
    const item = actor.items.get(itemId);
    let description = item.system.description.replace(/(<([^>]+)>)/g, "");
    let label = item.name
    let chatType = CONST.CHAT_MESSAGE_STYLES.OTHER
    let chatTemplate = 'systems/brp/templates/chat/itemDescription.html'

    let chatMsgData = {
      description,
      label,
      chatType,
      chatTemplate,
    }
    const html = await BRPCheck.startChat(chatMsgData)

    let chatData = {}
    chatData = {
      author: game.user.id,
      type: chatMsgData.chatType,
      content: html,
      speaker: {
        actor,
        alias: actor.name,
      },
    }
    let msg = await ChatMessage.create(chatData)
    return msg._id

  }

}
