const { api, sheets } = foundry.applications;
import { BRPIDEditor } from "../../brpid/brpid-editor.mjs";
import { BRPSelectLists } from "../../apps/select-lists.mjs";
import { BRPRollType } from "../../apps/rollType.mjs";
import { BRPactorItemDrop } from "../actor-itemDrop.mjs";
import { BRPDamage } from '../../combat/damage.mjs';
import { BRPUtilities } from '../../apps/utilities.mjs';
import BRPDialog from '../../setup/brp-dialog.mjs';
import { BRPActor } from "../actor.mjs";
import { isCtrlKey } from '../../apps/helper.mjs'
import { BRPCharDev } from "../../apps/charDev.mjs";

export class BRPActorSheetV2 extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
  constructor(options = {}) {
    super(options);
    this._dragDrop = this._createDragDropHandlers();
  }

  static DEFAULT_OPTIONS = {
    classes: ['brp', 'sheet', 'actor'],
    position: {
      width: 587,
      height: 800
    },
    window: {
      resizable: true,
    },
    tag: "form",
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: null }],
    form: {
      handler: BRPActorSheetV2._updateObject,
      submitOnChange: true,
    },
    actions: {
      onEditImage: this._onEditImage,
      editBRPid: this._onEditBRPid,
      actorToggle: this._onActorToggle,
      itemToggle: this._onItemToggle,
      rollStats: this._onRollStats,
      rollCharStats: this._onRollCharStats,
      skillRoll: this._onSkillRoll,
      statRoll: this._onStatRoll,
      weaponRoll: this._onWeaponRoll,
      damageRoll: this._onDamageRoll,
      armourRoll: this._onArmourRoll,
      passionRoll: this._onPassionRoll,
      allegianceRoll: this._onAllegianceRoll,
      personalityRoll: this._onPersTraitRoll,
      reputationRoll: this._onReputationRoll,
      viewDoc: this._viewDoc,
      deleteDoc: this._deleteDoc,
      createDoc: this._onItemCreate,
      hplHeal: this._onHPLHeal,
      deleteCulture: this._deleteCulture,
      deleteProfession: this._deleteProfession,
      deletePersonality: this._deletePersonality,
      addDamage: this._addDamage,
      healWound: this._healWound,
      attribute: this._onAttribute,
      restoreFatigue: this._onRestoreFatigue,
      restorePower: this._onRestorePower,
      skillCalc: this._onSkillCalc,
      treatWound: this._treatWound,
      viewWound: this._viewWound,
      healing: this._onHealing,
      armourToggle: this._onArmourToggle,
      armourLocToggle: this._onArmourLocToggle,
      impactRoll: this._onImpactRoll,
      redistStat: this._onRedisttibuteStats,
      xpRolls: this._onXPRolls,
      powImprove: this._onPowImprove,
    }
  }


  //Add BRPID Editor Button as seperate icon on the Window header
  async _renderFrame(options) {
    const frame = await super._renderFrame(options);
    //define button
    const sheetBRPID = this.actor.flags?.brp?.brpidFlag;
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
      actor: this.actor,
      flags: this.actor.flags,
      isGM: game.user.isGM,
      fields: this.document.schema.fields,
      config: CONFIG.BRP,
      system: this.actor.system,
      isLocked: this.actor.system.lock,
      isLinked: this.actor.prototypeToken?.actorLink === true,
      isSynth: this.actor.isToken,
      useEDU: game.settings.get('brp', 'useEDU'),
      useFP: game.settings.get('brp', 'useFP'),
      useSAN: game.settings.get('brp', 'useSAN'),
      useRes5: game.settings.get('brp', 'useRes5'),
      useHPL: game.settings.get('brp', 'useHPL'),
      useAlleg: game.settings.get('brp', 'useAlleg'),
      usePassion: game.settings.get('brp', 'usePassion'),
      useAVRand: game.settings.get('brp', 'useAVRand'),
      useReputation: game.settings.get('brp', 'useReputation'),
      useBeastiary: game.settings.get('brp', 'beastiary'),
      statOptions: await BRPSelectLists.addStatOptions(""),
    };
  }

  //---------------ACTIONS-------------

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

  // Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
  static async _onItemCreate(event, target) {
    event.preventDefault();
    const docCls = getDocumentClass(target.dataset.documentClass);
    const docData = {
      name: docCls.defaultName({
        type: target.dataset.type,
        parent: this.actor,
      }),
    };
    // Loop through the dataset and add it to our docData
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      // Ignore data attributes that are reserved for action handling
      if (['action', 'documentClass'].includes(dataKey)) continue;
      foundry.utils.setProperty(docData, dataKey, value);
    }

    // Create the embedded document
    const newItem = await docCls.create(docData, { parent: this.actor });
    let key = await game.system.api.brpid.guessId(newItem)
    await newItem.update({
      'flags.brp.brpidFlag.id': key,
      'flags.brp.brpidFlag.lang': game.i18n.lang,
      'flags.brp.brpidFlag.priority': 0
    })

    //And in certain circumstances render the new item sheet
    if (docData.type === 'hit-location') {
      await newItem.update({
        'system.displayName': newItem.name
      })
    }

    //And in certain circumstances render the new item sheet
    if (!['wound'].includes(docData.type)) {
      newItem.sheet.render(true);
    }
  }


  //Toggle Actor
  static async _onActorToggle(event, target) {
    const prop = target.dataset.property;
    let checkProp = {};
    let checkVal = ""
    if (['lock','showNotes','skillOrder'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !this.actor.system[prop] }
    } else     if (['strdb'].includes(prop)) {
      checkProp = { [`system.mod.${prop}`]: !this.actor.system.mod[prop] }
    } else if (['viewTab'].includes(prop)) {
      checkVal = target.dataset.tabval;
      checkProp = { [`system.${prop}`]: checkVal }
    }  else if (prop === 'powimprove') {
      checkProp = { 'system.stats.pow.improve': !this.actor.system.stats.pow.improve }
    } else if (prop === 'minorWnd') {
      checkProp = {
        'system.minorWnd': !this.actor.system.minorWnd,
        'system.health.daily': 0
      }
    } else if (prop === 'majorWnd') {
      checkProp = {
        'system.majorWnd': !this.actor.system.majorWnd,
        'system.health.daily': 0
      }
    } else {
      return
    }
    await this.actor.update(checkProp);
    return
  }

  //Roll Stats for NPC
  static async _onRollStats(event, target) {
    let type = target.dataset.property;
    for (let [key, stat] of Object.entries(this.actor.system.baseStats)) {
      let rollForm = stat.average
      if (type === 'random') {
        rollForm = stat.random
      }
      let checkProp = ""
      if (rollForm === "") {
        checkProp = { [`system.stats.${key}.base`]: 0 }
      } else {
        let roll = new Roll(rollForm)
        await roll.evaluate()
        let newVal = Math.round(Number(roll.total))
        checkProp = { [`system.stats.${key}.base`]: newVal }
      }
      await this.actor.update(checkProp)
      //Update Current HP etc to max
      checkProp = {
        'system.health.value': this.actor.system.health.max,
        'system.power.value': this.actor.system.power.max,
        'system.fatigue.value': this.actor.system.fatigue.max,
        'system.sanity.value': this.actor.system.sanity.max
      }
      await this.actor.update(checkProp)
    }

    //If using HPL set location Current HP to Max HP
    await BRPActorSheetV2._resetHPL(this.actor)
  }

  //Roll Character Stats
  static async _onRollCharStats(event, target) {
    let confirmation = await BRPUtilities.confirmation('rollStats', 'chatMsg');
    if (!confirmation) { return }
    let results = []
    for (let [key, stat] of Object.entries(this.actor.system.stats)) {
      let checkProp = ""
      if (stat.formula === "") { continue }
      if (key === 'edu' && !game.settings.get('brp', 'useEDU')) { continue }
      let roll = new Roll(stat.formula)
      await roll.evaluate()
      let newVal = Math.round(Number(roll.total))
      checkProp = { [`system.stats.${key}.base`]: newVal }
      let diceRolled = ""
      for (let diceRoll of roll.dice) {
        for (let diceResult of diceRoll.results) {
          if (diceRolled === "") {
            diceRolled = diceResult.result
          } else {
            diceRolled = diceRolled + "," + diceResult.result
          }
        }
      }
      results.push({ label: stat.labelShort, result: newVal, formula: roll.formula, diceRolled: diceRolled })
      await this.actor.update(checkProp)
      if (game.modules.get('dice-so-nice')?.active) {
        game.dice3d.showForRoll(roll, game.user, true, null, false)  //Roll,user,sync,whispher,blind
      }
    }
    let messageData = {
      speaker: ChatMessage.getSpeaker({ actor: this.actor.name }),
      actrImage: this.actor.img,
      results: results
    }
    const messageTemplate = 'systems/brp/templates/chat/rollStats.html'
    let html = await foundry.applications.handlebars.renderTemplate(messageTemplate, messageData);

    let chatData = {};
    let chatType = ""
//    if (!foundry.utils.isNewerVersion(game.version, '11')) {
//      chatType = CONST.CHAT_MESSAGE_STYLES.OTHER
//    } else {
      chatType = CONST.CHAT_MESSAGE_OTHER
//    }
    chatData = {
      user: game.user.id,
      type: chatType,
      content: html,
      speaker: {
        actor: this.actor._id,
        alias: this.actor.name,
      },
    }
    let msg = await ChatMessage.create(chatData);
    return
  }

  //Stat Roll
  static _onStatRoll(event, target) {
    BRPRollType._onStatRoll(event, target.dataset, this.document)
  }

  //Skill Roll
  static _onSkillRoll(event, target) {
    BRPRollType._onSkillRoll(event, target.dataset, this.document)
  }

  //Weapon Roll
  static _onWeaponRoll(event, target) {
    BRPRollType._onWeaponRoll(event, target.dataset, this.document)
  }

  //Damage Roll
  static _onDamageRoll(event, target) {
    BRPRollType._onDamageRoll(event, target.dataset, this.document)
  }

  //Armour Roll
  static _onArmourRoll(event, target) {
    BRPRollType._onArmour(event, target.dataset, this.document)
  }

  //Passion Roll
  static _onPassionRoll(event, target) {
    BRPRollType._onPassionRoll(event, target.dataset, this.document)
  }

  //Allegiance Roll
  static _onAllegianceRoll(event, target) {
    BRPRollType._onAllegianceRoll(event, target.dataset, this.document)
  }

  //Personality Trait Roll
  static _onPersTraitRoll(event, target) {
    BRPRollType._onPersTraitRoll(event, target.dataset, this.document)
  }

  //Reputation Trait Roll
  static _onReputationRoll(event, target) {
    BRPRollType._onReputationRoll(event, target.dataset, this.document)
  }

  //Magic Spell Impact Roll
  static async _onImpactRoll(event, target) {
    await BRPRollType._onImpactRoll(event, target.dataset, this.document)
  }

  //Resest HPL Action
  static async _onHPLHeal (event, target) {
    await BRPActorSheetV2._resetHPL(this.actor)
  }

  //Delete Culture
  static async _deleteCulture (event, target) {
    await BRPactorItemDrop.cultureDelete(event, this.actor)
  }

  //Delete Profession
  static async _deleteProfession (event, target) {
    await BRPactorItemDrop.professionDelete(event, this.actor)
  }

  //Delete Personality
  static async _deletePersonality (event, target) {
    await BRPactorItemDrop.personalityDelete(event, this.actor)
  }

  //Add Damage
  static async _addDamage(event, target) {
    await BRPDamage.addDamage(target,this.actor, this.token, 0)
  }

  //Heal a Wound
  static async _healWound(event, target) {
    await BRPDamage.treatWound(event, this.actor)
  }

  //Restore All Fatigue
  static async _onRestoreFatigue (event, target) {
    if (event.detail === 2) {  //Only perform on double click
      await BRPUtilities.updateAttribute(this.actor, this.token, "fatigue", "restore")
    }
  }

  //Restore All Power
  static async _onRestorePower (event, target) {
    if (event.detail === 2) {  //Only perform on double click
      await BRPUtilities.updateAttribute(this.actor, this.token, "power", "restore")
    }
  }

  //Start Attribute modify
  static async _onAttribute(event, target) {
    let att = target.dataset.att
    let adj = target.dataset.adj
    let checkprop = ""
    let newVal = this.actor.system[att].value
    let newMax = this.actor.system[att].max
    if (adj === 'spend') {
      checkprop = { [`system.${att}.value`]: newVal - 1 }
    } else if (adj === 'recover' && newVal < newMax) {
      checkprop = { [`system.${att}.value`]: newVal + 1 }
    } else { return }

    this.actor.update(checkprop)
  }

  //Recalculate Skill Base Scores
  static async _onSkillCalc(event, target) {
    await BRPActor.charBaseSkillScores(this.actor);
  }

  //Item Toggle
  static async _onItemToggle(event, target) {
    const element = target;
    const li = $(target).closest("li");
    const item = this.actor.items.get(li.data("itemId"));
    const prop = element.dataset.property;
    let checkProp = {};
    if (['hide', 'improve', 'oppimprove', 'mem', 'injured', 'bleeding', 'incapacitated', 'severed', 'dead', 'unconscious'].includes(prop)) {
      checkProp = { [`system.${prop}`]: !item.system[prop] }
    } else if (prop === 'equipStatus') {
      if (item.system.equipStatus === 'carried' && item.type === 'armour') {
        checkProp = { 'system.equipStatus': "worn" }
      } else if (item.system.equipStatus === 'carried' && item.type != 'armour') {
        checkProp = { 'system.equipStatus': "packed" }
      } else if (item.system.equipStatus === 'worn') {
        checkProp = { 'system.equipStatus': "packed" }
      } else if (item.system.equipStatus === 'packed') {
        checkProp = { 'system.equipStatus': "stored" }
      } else if (item.system.equipStatus === 'stored') {
        checkProp = { 'system.equipStatus': "carried" }
      }
    } else { return }

    await item.update(checkProp);
    this.actor.render(false);
    return;
  }

  static async _resetHPL(actor) {
    if (game.settings.get('brp', 'useHPL') || game.settings.get('brp', 'beastiary')) {
      let hitLocs = await actor.items.filter(itm => itm.type === 'hit-location').map(itm => {
        return { _id: itm.id, 'system.currHP': itm.system.maxHP }
      })
      await Item.updateDocuments(hitLocs, { parent: actor })
    }
  }

  // View Embedded Document (CTRL+click to delete)
  static async _viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    if (!doc) {return}
    let ctrlKey = isCtrlKey(event ?? false);
    if (!target.classList.contains('improvtab')) {
      if (ctrlKey) {
        if (!['profession','culture','personality'].includes(doc.type)) {
          const confirmation = await BRPDialog.confirm({
            window: { title: game.i18n.localize("BRP.deleteItem") },
            content: game.i18n.localize("BRP.deleteConfirm") + "<br><strong> " + doc.name + "</strong>"
          })
          if (confirmation) {
            await doc.delete();
          }
          return
        }
      }
    }
    if (event.altKey) {
      if (['magic','mutation','psychic','sorcery','super','failing'].includes (doc.type)) {
        BRPUtilities.sendToChat(event, this.document, "itemId")
        return
      }
    }
    doc.sheet.render(true);
  }

  //Delete Embedded Document
  static async _deleteDoc(event, target) {
    if (event.detail === 2) {  //Only perform on double click
      const doc = this._getEmbeddedDocument(target);
      await doc.delete();
    }
  }

  //Get Embedded Document
  _getEmbeddedDocument(target) {
    let docRow = target.closest('li[data-document-class]');
    if (!docRow) {docRow = target}
    if (docRow.dataset.documentClass === 'Item') {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === 'ActiveEffect') {
      const parent =
        docRow.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow?.dataset.effectId);
    } else return console.warn('Could not find document class');
  }

  //Treat a Wound
  static async _treatWound(event, target) {
    let treatType = target.dataset.healing
    await BRPDamage.treatWound(event, this.actor, "itemId", treatType);
  }

  //View Wound
  static async _viewWound(event, target) {
    let hitloc = this.actor.items.get(target.dataset.itemId);
    let wound = this.actor.items.get(target.dataset.woundId)
    let ctrlKey = isCtrlKey(event ?? false);
    if (ctrlKey) {
      const confirmation = await BRPDialog.confirm({
        window: { title: game.i18n.localize("BRP.deleteItem") },
        content: game.i18n.localize("BRP.deleteConfirm") + "<br><strong> " + wound.name + "</strong>"
       })
      if (confirmation) {
        await wound.delete();
      }
      return
    } else if (event.altKey) {
      await BRPDamage.treatWound(event, this.actor, "woundId", "")
      return
    }
    wound.sheet.render(true);
  }

  //Healing Options
  static async _onHealing (event, target) {
    let prop = target.dataset.prop
    if (!prop) return
    switch (prop) {
      case 'natural':
        BRPDamage.naturalHeal(event, this.actor)
        break;
      case 'all':
        BRPDamage.allHeal(event, this.actor)
        break;
      case 'reset':
        BRPDamage.resetDaily(event, this.actor)
        break;
    }
  }

  //Collapse/Expand Armour on all Hit Locs
  static async _onArmourToggle(event, target) {
    if (!game.settings.get('brp', 'useHPL')) { return }
    let expand = event.shiftKey
    let changes = []
    let hitLocs = this.actor.items.filter(itm => itm.type === "hit-location").map(itm => {
      return { id: itm.id }
    })
    for (let hitLoc of hitLocs) {
      changes.push({
        _id: hitLoc.id,
        'system.hide': expand
      })
    }
    await Item.updateDocuments(changes, { parent: this.actor });
  }

  //Collaspe expand armour on hit locations
  static async _onArmourLocToggle(event, target) {
    if (!game.settings.get('brp', 'useHPL')) { return }
    let hitLocId = target.dataset.itemId
    let hitLoc = this.actor.items.get(hitLocId)
    await hitLoc.update({'system.hide': !hitLoc.system.hide})
  }

  //Redistribute Characteristics
  static async _onRedisttibuteStats(event, target) {
    let key = target.dataset.stat
    let change = target.dataset.type
    let checkProp = ""
    if (change === 'decrease') {
      //If at maximum redistribute points
      if (this.actor.system.redistDec <= -3 && this.actor.system.stats[key].redist <= 0) { return }
      //Don't go below min stat values
      if ((this.actor.system.stats[key].base + this.actor.system.stats[key].redist) === 3) { return }
      if (['int', 'siz'].includes(key) && ((this.actor.system.stats[key].base + this.actor.system.stats[key].redist) === 8)) { return }
      checkProp = { [`system.stats.${key}.redist`]: this.actor.system.stats[key].redist - 1 }
    }
    if (change === 'increase') {
      //If at maximum redistribute points
      if (this.actor.system.redistInc >= 3 && this.actor.system.stats[key].redist >= 0) { return }
      //Don't exceed 21 stat value
      if ((this.actor.system.stats[key].base + this.actor.system.stats[key].redist) === 21) { return }
      checkProp = { [`system.stats.${key}.redist`]: this.actor.system.stats[key].redist + 1 }
    }
    await this.actor.update(checkProp)
  }

  //Make Single XP Improvement Roll
  static async _onXPRolls(event, target) {
    let rollType = target.dataset.roll
    let improveType = target.dataset.prop
    if (improveType === 'all') {
      await BRPCharDev.onXPGainAll(this.document, this.document.token, rollType)
    } else {
      const li = $(event.target).closest(".item");
      let opp = li.data("opp")
      let itemId = li.data("itemId")
      await BRPCharDev.onXPGainSingle(itemId, this.document, this.document.token, rollType, opp)
    }
  }

  //POW Improvement Roll
  static async _onPowImprove(event, target) {
    let type = target.dataset.roll
    await BRPCharDev.powImprov(this.document, this.document.token, type)
  }




    //--------------------HANDLER----------------------------------
  static async _updateObject(event, form, formData) {
    const biographyKeyRegex = /^system.stories\.(\d+)\.(.+)$/
    const biographyKeys = Object.keys(formData.object).map(k => k.match(biographyKeyRegex)).filter(m => m)
    if (biographyKeys.length) {
      const biography = foundry.utils.duplicate(this.actor.system.stories)
      for (const biographyKey of biographyKeys) {
        biography[biographyKey[1]][biographyKey[2]] = formData.object['system.stories.' + biographyKey[1] + '.' + biographyKey[2]]
        delete formData[biographyKey[0]]
      }
      formData.object['system.stories'] = biography
    }


    if (event.target) {
      if (event.target.classList) {
        if (event.target.classList.contains('bio-section-value')) {
          const index = parseInt(
            event.target.dataset.index
          )
          await BRPActorSheetV2.updateBioValue(this.document,index, event.target.value)
          return
        }
        if (event.target.classList.contains('bio-section-title')) {
          const index = parseInt(
            event.target.closest('.bio-section').dataset.index
          )
          await BRPActorSheetV2.updateBioTitle(this.document,index, event.target.value)
          return
        }
      }
    }

    //const system = foundry.utils.expandObject(formData.object)?.system
    //formData.object.name = game.i18n.localize("BRP." + formData.object['system.category']);
    await this.document.update(formData.object)
  }






//----------------LISTENERS---------------------------

  // Update skills etc without opening the item sheet
  static async skillInline(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const li = $(event.currentTarget).closest(".item");
    const item = this.actor.items.get(li.data("itemId"));
    let field = event.target.dataset.field;
    let newScore = event.target.value;
    if (['base', 'personality', 'profession', 'culture', 'personal','xp','effects', 'currHP', 'quantity',
        'npcVal', 'allegPoints', 'hpCurr', 'ammoCurr','av1','ppCurr','pSCurr'].includes(field)) {
      newScore = Number(newScore)
      field = 'system.' + field;
    } else if (['displayName', 'ap', 'bap', 'apRnd', 'bapRnd', 'att', 'dmg1'].includes(field)) {
      field = 'system.' + field;
    } else if (field === 'name') {
    } else {
      console.log("Error, can't find action for field:" + field)
      return
    }
    await item.update({ [field]: newScore });
    this.actor.render(false);
    return;
  }

  //Add a New Story Section
  static async createBioSection (title = null) {
    const bio = this.document.system.stories
      ? foundry.utils.duplicate(this.document.system.stories)
      : []
    bio.push({
      title: "",
      value: null
    })
    await this.document.update({ 'system.stories': bio }, { renderSheet: false })
  }

  static async updateBioValue (actor, index, content) {
    const bio = foundry.utils.duplicate(actor.system.stories)
    bio[index].value = content
    await actor.update({ 'system.stories': bio })
    actor.render();
  }

  static async updateBioTitle (actor, index, title) {
    const bio = foundry.utils.duplicate(actor.system.stories)
    bio[index].title = title
    await actor.update({'system.stories': bio })
  }

  static async deleteBioSection (event) {
    const index = parseInt(
        event.target.closest('.bio-section').dataset.index
    )
    const bio = foundry.utils.duplicate(this.actor.system.stories)
    bio.splice(index, 1)
    await this.actor.update({ 'system.stories': bio })
  }

  static async moveBioSectionUp (event) {
    const index = parseInt(
        event.target.closest('.bio-section').dataset.index
    )
    if (index === 0) return
    const bio = foundry.utils.duplicate(this.actor.system.stories)
    if (index >= bio.length) return
    const elem = bio.splice(index, 1)[0]
    bio.splice(index - 1, 0, elem)
    await this.actor.update({ 'system.stories': bio })
  }

  static async moveBioSectionDown (event) {
    const index = parseInt(
        event.target.closest('.bio-section').dataset.index
    )
    const bio = foundry.utils.duplicate(this.actor.system.stories)
    if (index >= bio.length - 1) return
    const elem = bio.splice(index, 1)[0]
    bio.splice(index + 1, 0, elem)
    await this.actor.update({ 'system.stories': bio })
  }


  //-------------Drag and Drop--------------

  // Define whether a user is able to begin a dragstart workflow for a given drag selector
  _canDragStart(selector) {
    return this.isEditable;
  }

  //Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
  _canDragDrop(selector) {
    return this.isEditable;
  }

  //Callback actions which occur at the beginning of a drag start workflow.
  _onDragStart(event) {
    const docRow = event.currentTarget.closest('li');
    if ('link' in event.target.dataset) return;
    // Chained operation
    let dragData = this._getEmbeddedDocument(docRow)?.toDragData();
    if (!dragData) return;
    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  //Callback actions which occur when a dragged element is over a drop target.
  _onDragOver(event) { }

  //Callback actions which occur when a dragged element is dropped on a target.
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call('dropActorSheetData', actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case 'ActiveEffect':
        return this._onDropActiveEffect(event, data);
      case 'Actor':
        return this._onDropActor(event, data);
      case 'Item':
        return this._onDropItem(event, data);
      case 'Folder':
        return this._onDropFolder(event, data);
    }
  }

  //Handle the dropping of ActiveEffect data onto an Actor Sheet
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass('ActiveEffect');
    const effect = await aeCls.fromDropData(data);
    if (!this.actor.isOwner || !effect) return false;
    if (this.actor.type === 'party') return false;
    return aeCls.create(effect, { parent: this.actor });
  }

  //Handle dropping of an Actor data onto another Actor sheet
  async _onDropActor(event, data) {
    if (!this.actor.isOwner) return false;
    await this.DropActor(data);
  }

  //Handle dropping of an item reference or item data onto an Actor Sheet
  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    if (this.actor.type === 'party') return false;
    const item = await Item.implementation.fromDropData(data);
    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid)
      return this._onSortItem(event, item);
    // Create the owned item
    return this._onDropItemCreate(item, event);
  }

  //Handle dropping of a Folder on an Actor Sheet.
  async _onDropFolder(event, data) {
    if (!this.actor.isOwner) return [];
    const folder = await Folder.implementation.fromDropData(data);
    if (folder.type !== 'Item') return [];
    const droppedItemData = await Promise.all(
      folder.contents.map(async (item) => {
        if (!(document instanceof Item)) item = await fromUuid(item.uuid);
        return item;
      })
    );
    return this._onDropItemCreate(droppedItemData, event);
  }

  //Handle the final creation of dropped Item data on the Actor.
  async _onDropItemCreate(itemData, event) {
    itemData = await BRPactorItemDrop._BRPonDropItemCreate(this.actor, itemData)
    const list = await this.actor.createEmbeddedDocuments('Item', itemData);
    return list;
  }

  //Returns an array of DragDrop instances
  get dragDrop() {
    return this._dragDrop;
  }

  _dragDrop;

  //Create drag-and-drop workflow handlers for this Application
  _createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this),
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this),
      };
      return new foundry.applications.ux.DragDrop(d);
    });
  }

  //Drop Actor on to an Actor Sheet
  async DropActor(data) {
    return

  }
}
