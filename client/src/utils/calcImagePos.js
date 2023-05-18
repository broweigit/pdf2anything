function calcImagePos(stagePos, stage) {
    return ({x: (stagePos.x - stage.x()) / stage.scaleX(), y: (stagePos.y - stage.y()) / stage.scaleY()})
  }
  
  export default calcImagePos;