export default class ChaosiumCanvasInterface extends foundry.data.regionBehaviors.RegionBehaviorType {
  static initSelf () {
    const oldOnClickLeft = foundry.canvas.layers.TokenLayer.prototype._onClickLeft
    foundry.canvas.layers.TokenLayer.prototype._onClickLeft = function (event) {
      oldOnClickLeft.call(this, event)
      if (canvas.activeLayer instanceof foundry.canvas.layers.TokenLayer) {
        const destination = canvas.activeLayer.toLocal(event)
        for (const region of canvas.scene.regions.contents) {
          if (region.behaviors.filter(b => !b.disabled).find(b => b.system instanceof ChaosiumCanvasInterface) && region.object.document.polygonTree.testPoint(destination)) {
            region.behaviors.filter(b => !b.disabled).map(async (b) => { if (await b.system._handleMouseOverEvent() === true && typeof b.system._handleLeftClickEvent === 'function') { await b.system._handleLeftClickEvent() } })
          }
        }
      }
    }

    const oldOnClickRight = foundry.canvas.layers.TokenLayer.prototype._onClickRight
    foundry.canvas.layers.TokenLayer.prototype._onClickRight = function (event) {
      oldOnClickRight.call(this, event)
      if (canvas.activeLayer instanceof foundry.canvas.layers.TokenLayer) {
        const destination = canvas.activeLayer.toLocal(event)
        for (const region of canvas.scene.regions.contents) {
          if (region.behaviors.filter(b => !b.disabled).find(b => b.system instanceof ChaosiumCanvasInterface) && region.object.document.polygonTree.testPoint(destination)) {
            region.behaviors.filter(b => !b.disabled).map(async (b) => { if (await b.system._handleMouseOverEvent() === true && typeof b.system._handleRightClickEvent === 'function') { await b.system._handleRightClickEvent() } })
          }
        }
      }
    }

    document.body.addEventListener('mousemove', async function (event) {
      if (canvas.activeLayer instanceof foundry.canvas.layers.TokenLayer) {
        const pointer = canvas?.app?.renderer?.events?.pointer
        if (!pointer) {
          return
        }
        const destination = canvas.activeLayer.toLocal(event)
        let setPointer = false
        for (const region of canvas.scene.regions.contents) {
          if (region.behaviors.filter(b => !b.disabled).find(b => b.system instanceof ChaosiumCanvasInterface) && region.object.document.polygonTree.testPoint(destination)) {
            setPointer = await region.behaviors.filter(b => !b.disabled).reduce(async (c, b) => {
              const r = await b.system._handleMouseOverEvent()
              if (r !== false && r !== true) {
                console.error(b.uuid + ' did not return a boolean')
              }
              c = c || r
              return c
            }, false)
          }
        }
        if (setPointer) {
          document.getElementById('board').style.cursor = 'pointer'
        } else {
          document.getElementById('board').style.cursor = ''
        }
      }
    })
  }

  static async ClickRegionLeftUuid (docUuid) {
    const doc = await fromUuid(docUuid)
    if (doc) {
      doc.behaviors.filter(b => !b.disabled).filter(b => b.system instanceof ChaosiumCanvasInterface).map(async (b) => { if (await b.system._handleMouseOverEvent() === true && typeof b.system._handleLeftClickEvent === 'function') { await b.system._handleLeftClickEvent() } })
    } else {
      console.error('RegionUuid ' + docUuid + ' not loaded')
    }
  }

  static async ClickRegionRightUuid (docUuid) {
    const doc = await fromUuid(docUuid)
    if (doc) {
      doc.behaviors.filter(b => !b.disabled).filter(b => b.system instanceof ChaosiumCanvasInterface).map(async (b) => { if (await b.system._handleMouseOverEvent() === true && typeof b.system._handleRightClickEvent === 'function') { await b.system._handleRightClickEvent() } })
    } else {
      console.error('RegionUuid ' + docUuid + ' not loaded')
    }
  }
}
