import { registerSheets } from '../setup/register-sheets.mjs'
import { BRPID } from '../brpid/brpid.mjs'

export function listen () {
    Hooks.once('init', async () => {
      BRPID.init()
      registerSheets()
    })
  }