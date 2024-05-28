export function listen () {
  Hooks.on('renderDialog', (dialog, html) => {
    const form = html.find('form')
    if (form.is('#document-create') && form.find('select').length !== 0) {
      const entityCreateSelectTag = form.find("[name='type']")
      const entitySortedList = []
      entityCreateSelectTag.children().each((o, entityOption) => {
        const key = (entityOption.textContent.split(".")[2])?.capitalize()
        if (game.i18n.has(`BRP.Entities.${key}`)) {
          entityOption.textContent = game.i18n.localize(`BRP.Entities.${key}`)
        }
        entitySortedList.push(entityOption)
      })
      entityCreateSelectTag.empty()
      entityCreateSelectTag.append(
        entitySortedList.sort((first, second) =>
          first.innerText.localeCompare(second.innerText)
        )
      )
    }
  })
}