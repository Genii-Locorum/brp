import { BRPIDEditor } from "../../brpid/brpid-editor.mjs";

const { api, sheets } = foundry.applications;

export class BRPItemSheetV2 extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
  constructor(options = {}) {
    super(options);
  }

  static DEFAULT_OPTIONS = {
    classes: ['brp', 'sheet', 'item'],
    position: {
      width: 520,
      height: 620
    },
    window: {
      resizable: true,
    },
    tag: "form",
    form: {
      submitOnChange: true,
    },
    actions: {
      onEditImage: this._onEditImage,
      editBRPid: this._onEditBRPid,
      itemToggle: this._onItemToggle,
    }
  }

  //Add BRPID Editor Button as seperate icon on the Window header
  async _renderFrame(options) {
    const frame = await super._renderFrame(options);
    //define button
    const sheetBRPID = this.item.flags?.brp?.brpidFlag;
    const noId = (typeof sheetBRPID === 'undefined' || typeof sheetBRPID.id === 'undefined' || sheetBRPID.id === '');
    //add button
    const label = game.i18n.localize("BRP.BRPIDFlag.id");
    const brpidEditor = `<button type="button" class="header-control icon fa-solid fa-fingerprint ${noId ? 'edit-brpid-warning' : 'edit-brpid-exisiting'}"
        data-action="editBRPid" data-tooltip="${label}" aria-label="${label}"></button>`;
    let el = this.window.close;
    while (el.previousElementSibling.localName === 'button') {
      el = el.previousElementSibling;
    }
    el.insertAdjacentHTML("beforebegin", brpidEditor);
    return frame;
  }

  async _prepareContext(options) {
    return {
      editable: this.isEditable,
      owner: this.document.isOwner,
      limited: this.document.limited,
      item: this.item,
      flags: this.item.flags,
      system: this.item.system,
      hasOwner: this.item.isEmbedded === true,
      isGM: game.user.isGM,
      itemType: game.i18n.localize('TYPES.Item.' + this.item.type),
      headerDisplay: false,
      useWealth: game.settings.get('brp', 'useWealth'),
      wealthLabel: game.settings.get('brp', 'wealthLabel'),
    }
  }

  //------------ACTIONS-------------------

  // Change Image
  static async _onEditImage(event, target) {
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document, attr);
    const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
      {};
    const fp = new foundry.applications.apps.FilePicker({
      current,
      type: 'image',
      redirectToRoot: img ? [img] : [],
      callback: (path) => {
        this.document.update({ [attr]: path });
      },
      top: this.position.top + 39,
      left: this.position.left + 9,
    });
    return fp.browse();
  }

  // Handle editBRPid action
  static _onEditBRPid(event, target) {
    event.stopPropagation(); // Don't trigger other events
    if (event.detail > 1) return; // Ignore repeated clicks
    new BRPIDEditor({ document: this.document }, {}).render(true, { focus: true })
  }

  // Toggle something on the item
  static _onItemToggle(event, target) {
    event.preventDefault();
    let checkProp = {};
    const prop = target.dataset.property
    if (['armVar', 'armBal', 'HPL', 'minorOnly', 'basic','noXP', 'specialism', 'variable', 'group', 'chosen', 'combat', 'var', 'parry','burst', 'stun', 'choke',
      'entangle', 'fire', 'pierce', 'sonic', 'poison', 'explosive', 'emp'].includes(prop) && !game.user.isGM) {
        return
    };


    if (['allegEnemy', 'allegApoth', 'allegAllied', 'improve', 'armVar', 'armBal', 'HPL', 'dead', 'severed', 'bleeding', 'mem', 'minorOnly', 'minor', 'oppimprove',
       'perLvl', 'noXP', 'specialism', 'variable', 'group', 'chosen', 'basic', 'combat','var', 'parry','burst', 'stun', 'choke', 'entangle', 'fire', 'pierce', 'sonic',
       'poison', 'explosive', 'emp', 'treated'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !this.item.system[prop] }
    } else { return }

    if (prop === 'var' & this.item.type === 'sorcery') {
      if (this.item.system.var) {
        checkProp = {
          'system.var': false,
          'system.currLvl': this.item.system.maxLvl,
          'system.memLvl': this.item.system.maxLvl,
        }
      }
    }
    this.item.update(checkProp)
  }
}

