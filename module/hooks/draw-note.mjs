export function listen() {
  Hooks.on('drawNote', async (application) => {
    if (application.document.getFlag('brp', 'hide-background') ?? false) {
      application.controlIcon.bg.clear()
    }
  })
}
