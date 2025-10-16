//If a new world then create a default scene
Hooks.on('ready', () => {
  console.log("Adding a default scene")
  const isNewWorld = !(game.actors.size + game.items.size + game.journal.size);
  if (game.scenes.filter(doc => doc.id !== 'NUEDEFAULTSCENE0').length === 0) {
    Scene.create({name:'Default',active:true,background:{src:'systems/brp/assets/brp-logo-powered_by-02.png'},foregroundElevation:4,thumb:'systems/brp/assets/brp-logo-powered_by-02.png',grid:{type:0},height:3000, width:3000,tokenVision:false,fog:{exploration:false},initial:{scale: 0.3868}})
  }
})
