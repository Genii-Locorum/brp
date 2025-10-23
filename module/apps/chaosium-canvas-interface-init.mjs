import ChaosiumCanvasInterfaceAmbientLightToggle from "./chaosium-canvas-interface-ambient-light-toggle.mjs";
import ChaosiumCanvasInterfaceDrawingToggle from "./chaosium-canvas-interface-drawing-toggle.mjs";
import ChaosiumCanvasInterfaceMapPinToggle from "./chaosium-canvas-interface-map-pin-toggle.mjs";
import ChaosiumCanvasInterfaceOpenDocument from "./chaosium-canvas-interface-open-document.mjs";
import ChaosiumCanvasInterfacePlaySound from "./chaosium-canvas-interface-play-sound.mjs";
import ChaosiumCanvasInterfaceToScene from "./chaosium-canvas-interface-to-scene.mjs";
import ChaosiumCanvasInterfaceTileToggle from "./chaosium-canvas-interface-tile-toggle.mjs";
import ChaosiumCanvasInterface from "./chaosium-canvas-interface.mjs";

export default class ChaosiumCanvasInterfaceInit extends ChaosiumCanvasInterface {
  static initSelf () {
    const known = [
      ChaosiumCanvasInterfaceAmbientLightToggle,
      ChaosiumCanvasInterfaceDrawingToggle,
      ChaosiumCanvasInterfaceMapPinToggle,
      ChaosiumCanvasInterfaceOpenDocument,
      ChaosiumCanvasInterfacePlaySound,
      ChaosiumCanvasInterfaceToScene,
      ChaosiumCanvasInterfaceTileToggle
    ]

    super.initSelf()
    const dataModels = {}
    const typeIcons = {}
    const types = []
    for (const cci of known) {
      const name = (new cci).constructor.name
      dataModels[name] = cci
      typeIcons[name] = cci.icon
      types.push(name)
    }

    Object.assign(CONFIG.RegionBehavior.dataModels, dataModels)

    Object.assign(CONFIG.RegionBehavior.typeIcons, typeIcons)

    foundry.applications.apps.DocumentSheetConfig.registerSheet(
      RegionBehavior,
      'brp',
      foundry.applications.sheets.RegionBehaviorConfig,
      {
        types: types,
        makeDefault: true
      }
    )
  }
}
