import { registerSheets } from '../setup/register-sheets.mjs'

export function listen () {
    Hooks.once('init', async () => {
      registerSheets()
    })
  }