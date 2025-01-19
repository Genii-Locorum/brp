export class BRPCombat extends Combat {

  async nextRound() {
     if (game.settings.get('brp','initRound') !== 'no') {
      await this.resetAll();      
    }
    if (game.settings.get('brp','initRound') === 'auto') {
      await this.rollAll(); 
      await this.setupTurns();   
    }
    super.nextRound()
  }  

}