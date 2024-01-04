//Add GM tools to Scene

export class BRPLayer extends PlaceablesLayer {

    constructor(...args) {
      super(...args);
  
      this.documentName = "Scene"
      this.isSetup = false;
    }
  
    static get layerOptions() {
      return foundry.utils.mergeObject(super.layerOptions, {
        zIndex: 180,
        name: "BRPgmtools"
      });
    }
    
    getDocuments() {
      return []
    }
  
    activate() {
      super.activate();
    }
  
    deactivate() {
      super.deactivate();
      this._clearChildren();
    }
  
    render(...args) {
      super.render(...args);
    }
  
    _clearChildren() {
      if (!this.UIContainer) return;
      this.UIContainer.children.forEach(child => {
        child.clear()
      });
    }
  
  }

