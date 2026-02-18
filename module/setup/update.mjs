/**
 * Perform a system migration for the entire World, applying migrations for Actors, Items, and Compendium packs.
 * @param {object} [options={}]
 * @param {boolean} [options.bypassVersionCheck=false]  Bypass certain migration restrictions gated behind system
 *                                                      version stored in item stats.
 * @returns {Promise}      A Promise which resolves once the migration is completed
 */
export async function updateWorld({ bypassVersionCheck = false } = {}) {
  const currentVersion = game.settings.get("brp", "gameVersion");
  const targetVersion = game.system.version;
  console.log("UPDATE", currentVersion, targetVersion)

    //Migration to 13.1.53
    if (foundry.utils.isNewerVersion('13.1.53', currentVersion ?? '0')) {
      let response = await updateDialog('systems/brp/templates/updates/update13.1.53.hbs')
      if (!response) {
        ui.notifications.warn("Item Migration to Version 13.1.53 cancelled");
        return
      }
      await v13153()
    }

  await game.settings.set("brp", "gameVersion", targetVersion);
}

export async function updateDialog(msg) {
  const content = await foundry.applications.handlebars.renderTemplate(msg)
  const response = await foundry.applications.api.DialogV2.prompt({
    position: {
      width: 500,
      height: 450,
    },
    classes: ['brp', 'item'],
    window: {
      title: "Update",
    },
    content,
    modal: true
  })
  return response
}



export async function v13153() {
  console.log("Updating  NPC & Character Notes")
  for (let actor of game.actors) {
    if (actor.type === 'npc') {
      let newNotes = actor.system.description
      if (newNotes === "") { continue }
      if (actor.system.extDesc != "") {
        newNotes = actor.system.extDesc + "<p><strong>Legacy Notes</strong)</p><p>" + newNotes + "</p>"
      }
      await actor.update({
        'system.extDesc': newNotes,
        'system.description': ""
      })
    } else if (actor.type === 'character') {
        let newStories = actor.system.stories
              ? foundry.utils.duplicate(actor.system.stories)
              : []
        if (actor.system.background != "") {
          newStories.push({
            title: game.settings.get('brp', 'background1'),
            value: actor.system.background
          })
        }
        if (actor.system.biography != "") {
          newStories.push({
            title: game.settings.get('brp', 'background1'),
            value: actor.system.biography
          })
        }
        if (actor.system.backstory != "") {
          newStories.push({
            title: game.settings.get('brp', 'background1'),
            value: actor.system.backstory
          })
        }
        await actor.update({"system.stories": newStories})
    }
  }

  //Migrate Compendium Packs
  for (const pack of game.packs) {
    if (pack.metadata.packageType === "system") { continue }
    if (pack.documentName != "Actor") { continue }
    console.log("Updating: ",pack.metadata.packageName)
    // Unlock the pack for editing
    const wasLocked = pack.locked;
    await pack.configure({ locked: false });
    // Begin by requesting server-side data model migration and get the migrated content
    const documents = await pack.getDocuments();
    for (let doc of documents) {
      if (doc.type === 'npc') {
        let newNotes = doc.system.description
        if (newNotes === "") { continue }
        if (doc.system.extDesc != "") {
          newNotes = doc.system.extDesc + "<p><strong>Legacy Notes</strong)</p>" + newNotes
        }
        await doc.update({
          'system.extDesc': newNotes,
          'system.description': ""
        })
      } else if (actor.type === 'character') {
        let newStories = actor.system.stories
              ? foundry.utils.duplicate(actor.system.stories)
              : []
        if (actor.system.background != "") {
          newStories.push({
            title: game.settings.get('brp', 'background1'),
            value: actor.system.background
          })
        }
        if (actor.system.biography != "") {
          newStories.push({
            title: game.settings.get('brp', 'background1'),
            value: actor.system.biography
          })
        }
        if (actor.system.backstory != "") {
          newStories.push({
            title: game.settings.get('brp', 'background1'),
            value: actor.system.backstory
          })
        }
        await actor.update({"system.stories": newStories})
      }
    }
    await pack.configure({ locked: wasLocked });
  }
  console.log("Update Complete")

}
