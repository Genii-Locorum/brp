export default class BRPDialog extends foundry.applications.api.DialogV2 {

  static DEFAULT_OPTIONS = {
    classes: ["brp","item"],
    position: {
      width: 400,
      height: "auto",
      top: 200,
      left: 1200,
      zIndex: 500
    },
  }
}
