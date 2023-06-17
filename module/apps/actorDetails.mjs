export class BRPactorDetails {

    //
    // Get token/actor ID and type
    //
    static async _getParticipantId(token,actor){
      let particId = "";
        let particType ="";
          if (token && !token.actorLink){
            particId = token._id;
            particType = "token"; 
          } else {
            particId = actor._id;
            particType = "actor";
          }
        let partic = ({particId, particType})
        return partic;
      }

    //
    // Get token/actor - determine precedence
    //
    static async _getParticipantPriority(token,actor){
        let partic ="";  
        if (token && !token.actorLink){
            partic = token;
          } else {
            partic = actor
          }
        return partic;
      }

      //
      //Get actor from ID & type
      //
      static async _getParticipant(particId, particType) {
        let actor="";
        if (particType === "token") {
          actor = game.actors.tokens[particId];
        } else {
          actor = game.actors.get(particId) 
        }
        return actor
      }
    
    //
    //Get Id of target of attack etc
    //
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
    
    }