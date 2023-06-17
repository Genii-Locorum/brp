/* global Dialog, FormData, game, renderTemplate */
export class SkillSpecSelectDialog {
    static async create (
      skill,
      title = skill.name,
      name = skill.system.mainName
    ) {
      const html = await renderTemplate(
        'systems/BRP/templates/dialog/skillSpecSelect.html',
        {
          //hasSkills: skills.length > 0,
          skill,
          //base: baseValue,
          name
        }
      )
      return new Promise(resolve => {
        let formData = null
        const dlg = new Dialog({
          title: title,
          content: html,
          buttons: {
            validate: {
              label: game.i18n.localize('BRP.confirm'),
              callback: html => {
                formData = new FormData(
                  html[0].querySelector('#skill-select-form')
                )
                return resolve(formData)
              }
            }
          },
          default: 'validate',
          close: () => {
            return resolve(false)
          }
        })
        dlg.render(true)
      })
    }
  }