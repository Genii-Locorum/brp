/**
 * Return true is CTRL key is pressed
 * Used for MAC compat.
 * @param {S.Event} event
 * @returns
 */
export function isCtrlKey (event) {
    if (event === false) {
      return false
    }
    return (
      event.metaKey ||
      event.ctrlKey ||
      event.keyCode === 91 ||
      event.keyCode === 224
    )
  }