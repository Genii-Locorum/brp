/* global Dialog, renderTemplate */
export class SkillSelectDialog extends Dialog {
    activateListeners (html) {
      super.activateListeners(html)
  
      html
        .find('.select-skill')
        .click(async event => this._onSelectSkillClicked(event))
    }
  
    async _onSelectSkillClicked (event) {
      const li = event.currentTarget.closest('.item')
      this.data.data.skills[Number(li.dataset.index)].selected = true
      event.currentTarget.style.display = 'none'
      if (!this.data.data.added) this.data.data.added = 0
      this.data.data.added++
      const form = event.currentTarget.closest('.skill-selector')
      const divCount = form.querySelector('.count')
      divCount.innerText = this.data.data.added
      if (this.data.data.added >= this.data.data.optionsCount) {
        this.close()
      }
    }
  
    static async create (data) {
      const html = await renderTemplate(
        'systems/BRP/templates/dialog/groupSkillSelect.html',
        data
      ) 
      return new Promise(resolve => {
        const dlg = new SkillSelectDialog(
          {
            title: data.title,
            content: html,
            data,
            buttons: {},
            close: () => {
              if (!data.added >= data.optionsCount) return resolve(false)
              const selected = data.skills.filter(skill => skill.selected)
              return resolve(selected)
            }
          },
          { classes: ['brp', 'dialog', 'skill-select'] }
        )
        dlg.render(true)
      })
    }
  }