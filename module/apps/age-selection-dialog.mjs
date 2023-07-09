import { BRPUtilities } from "../apps/utilities.mjs";

/* global Dialog, renderTemplate */
export class AgeSelectDialog extends Dialog {
   activateListeners (html) {
      super.activateListeners(html)
  
      html
        .find('.agingPoint').change(async event => this._onAddAgingPoint(event))
    }
    
    async _onAddAgingPoint(event) {
      let added = 0
      let points = Number(event.currentTarget.dataset.points)
      for (let i = 0; i<event.currentTarget.form.length; i++){
        added += Number(event.currentTarget.form[i].value)
      }
      if (added === points) {
        let confirmation = await BRPUtilities.confirmation();
        if (!confirmation) {return}
        
        this.close()}
    }



    static async create (data) {
      const html = await renderTemplate(
        'systems/BRP/templates/dialog/ageSelect.html',
        data
      ) 
      return new Promise(resolve => {
        let formData = null
        const dlg = new AgeSelectDialog(
          {
            title: data.title,
            content: html,
            data,
            buttons: {
                roll: {
                  label: game.i18n.localize("BRP.accept"),
                  callback: html => {
                  formData = new FormData(html[0].querySelector('#age-selection-form'))
                  return resolve(formData)
                  }
                }
              },
            default: 'roll',
            close: () => {}
            })
        dlg.render(true)
      })
    }

    static async agingCreate (data) {
      const html = await renderTemplate(
        'systems/BRP/templates/dialog/agingSelect.html',
        data
      ) 
      return new Promise(resolve => {
        let formData = null
        const dlg = new AgeSelectDialog(
          {
            title: data.title,
            content: html,
            data,
            buttons: {},
            close: (html) => {
              formData = new FormData(html[0].querySelector('#aging-selection-form'))
              let spent = Number(formData.get('str'))+Number(formData.get('con'))+Number(formData.get('siz'))+Number(formData.get('int'))+Number(formData.get('pow'))+Number(formData.get('dex'))+Number(formData.get('cha'))
                  let points = data.points
                  if (points === spent) {
                    return resolve(formData)
                  }  else {
                    return resolve (false)
                  } 
            }
            })
        dlg.render(true)
      })
    }

  }

  