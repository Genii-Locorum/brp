export class BRPactorDetails {

    // Get token/actor ID and type
    static async _getParticipantId(token,actor){
      let particId = ""
      let particType = ""
      let particName = ""
      if (!token){
        particId = actor.id
        particType = "actor"
        particName = actor.name
      } else {
        let tokenId = token.uuid.split(".")[3]
        if (game.actors.tokens[tokenId]) {
          particId = tokenId
          particType = "token"
          particName = token.name
        } else {
          particId = token.actor.id
          particType = "actor"
          particName = token.actor.name
        }
      }  

      //TODO TEST THEM REMOVE BELOW
      /*let particId = "";
      let particType ="";
      let particName ="";
          if (token && !token.actorLink){
            particId = token._id;
            particType = "token";
            particName = token.name; 
          } else {
            particId = actor._id;
            particType = "actor";
            particName = actor.name;
          }*/
        let partic = ({particId, particType, particName})
        return partic;
      }

    // Get token/actor - determine precedence
    static async _getParticipantPriority(token,actor){
        let target = await this._getParticipantId(token,actor);
        let partic = await this._getParticipant(target.particId, target.particType); 
        return partic;
      }

      //Get actor from ID & type
      static async _getParticipant(particId, particType) {
        let actor="";
        if (particType === "token") {
          actor = game.actors.tokens[particId];
        } else {
          actor = game.actors.get(particId) 
        }
        return actor
      }
    
    //Get Id of target of attack etc
    static async _getTargetId() {
        let targetId = "";
        let targetType = "none";
        let targetName = "Dummy";
        if (game.user.targets.size > 0) {  
          let target = Array.from(game.user.targets)
          targetName = target[0].document.name
          if (target[0].document.actorLink) {
            targetId = target[0].document.actorId;
            targetType = "actor";
          } else {
            targetId = target[0].id;
            targetType = "token";
          }
        }
        let result =({targetId, targetType, targetName});
        return result;
      }
    
    //Get Actor Image for Id  
    static async getParticImg (particId,particType) {
      if (!particId || !particType) return null
      const actor = await BRPactorDetails._getParticipant(particId, particType)
      let image = actor.img
      //If wildcard image then get that
      if (actor.prototypeToken.randomImg) {
        image = actor.token.texture.src
      }
      return image
    }


}