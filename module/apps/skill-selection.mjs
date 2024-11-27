export class SkillsSelectDialog extends Dialog {
    activateListeners (html) {
      super.activateListeners(html)
  
      html.find('.select.rollable').click(async event => this._onSelectClicked(event))
      html.find('.closecard').click(async event => this._shutdialog(event))
    }
  
    async _onSelectClicked (event) {
      const chosen = event.currentTarget.closest('.mediumIcon')
      let choice = chosen.dataset.set
      let change = 1
      if (this.data.data.selectOptions[choice].selected) change = -1
      //Don't allow spend over picks
      if (this.data.data.added+change<=this.data.data.picks) {
        //Change the points spent
        this.data.data.added = this.data.data.added + change

        //Update points spent and the stats value on the form
        const form = event.currentTarget.closest('.skill-select')
        const divCount = form.querySelector('.count')
        divCount.innerText = this.data.data.added
        const selected = form.querySelector('.item-'+choice)
        if (this.data.data.selectOptions[choice].selected) {
          this.data.data.selectOptions[choice].selected = false
          selected.innerHTML = '<a><i class="fa-regular fa-square"></i> </a>'
        } else {
          this.data.data.selectOptions[choice].selected = true
          selected.innerHTML = '<a><i class="fa-regular fa-square-check"></i> </a>'        
        }
        const closecard = form.querySelector('.closecard')
        if (this.data.data.added >= this.data.data.picks) {
          closecard.innerHTML = "<button class='proceed cardbutton' type='button'>"+game.i18n.localize('BRP.confirm')+"</button>" 
        } else {
          closecard.innerHTML = "<button class='cardbutton' type='button'>"+game.i18n.localize('BRP.makeSelection')+"</button>" 
        }  
      }
    }
  
    async _shutdialog(event) {
      if (this.data.data.added >= this.data.data.picks) {
        this.close()
      }
    }

    static async create (selectOptions,picks, type) {
      let destination = 'systems/brp/templates/dialog/skillSelect.html';
      let winTitle = game.i18n.format("BRP.selectItem", {type: type});
      let data = {
        selectOptions,
        picks,
        added : 0
      }
      const html = await renderTemplate(destination,data);
      
      return new Promise(resolve => {
        const dlg = new SkillsSelectDialog(
          {
            title: winTitle,
            content: html,
            data,
            buttons: {},
            close: () => {
              if (data.added < data.picks) return resolve(false)
              const selected = data.selectOptions.filter(option => (option.selected))
              return resolve(selected)
            }
          },
          { classes: ['brp'] }
        )
        dlg.render(true)
      })

    }
  }