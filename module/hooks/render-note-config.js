export function listen() {
  Hooks.on('renderNoteConfig', async (application, element, context, options) => {
    const hideBackground = application.document.getFlag('brp', 'hide-background') ?? false
    const formGroup = element.querySelector('[name=texture\\.tint]').closest('div.form-group')
    const newGroup = document.createElement('div')
    newGroup.classList.add('form-group')
    formGroup.after(newGroup)
    const label = document.createElement('label')
    label.setAttribute('for', application.id + '-hide-background')
    label.innerText = game.i18n.localize('BRP.mapNoteNoBackground')
    const div = document.createElement('div')
    div.classList.add('form-fields')
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.name = 'flags.brp.hide-background'
    input.checked = hideBackground
    input.id = application.id + '-hide-background'
    div.append(input)
    newGroup.append(label)
    newGroup.append(div)
    formGroup.after(newGroup)
    application.document?.object?.draw()
  })
}
