
function GeometryCallback(viewer,copiedGeometryName,curveMaterial) {

  this.viewer = viewer;   
  this.opiedGeometryName = copiedGeometryName;

  // linewidth does not take effect in Chrome and Firefox 
  // It is a known issue with OpenGL core
  // try with Safari
  this.curveMaterial = curveMaterial;
  this.is2PITimes = function(angle1,angle2){
    return Math.abs(angle1-angle2)/Math.PI % 2 == 0
  }

}

GeometryCallback.prototype.onLineSegment = function(x1, y1, x2, y2, vpId) {

  var vpXform = this.viewer.model.getPageToModelTransform(vpId);
  //if in CAD coordinate system, applyMatrix4 with vpXform
  var pt1 = new THREE.Vector3().set(x1, y1, 0)//.applyMatrix4(vpXform);
  var pt2 = new THREE.Vector3().set(x2, y2, 0)//.applyMatrix4(vpXform); 

  console.log('Line segment vertices coordinates: ', {
      pointX1: pt1.x,
      pointY1: pt1.y,
      pointX2: pt2.x,
      pointY2: pt2.y
  }); 
  
  //add overlay geometry   
  const $viewer = $('#' +viewer.clientContainer.id + ' div.adsk-viewing-viewer');

  const $label = $(`
      <label class="markup update">
          Label
      </label>
      `);  
  $viewer.append($label); 

  const screen_pos = viewer.worldToClient(pt1);
  $label.css('left', Math.floor(screen_pos.x - $label[0].offsetWidth / 2) + 'px');
  $label.css('top', Math.floor(screen_pos.y - $label[0].offsetHeight / 2) + 'px'); 

  var storeData = JSON.stringify(pt1);
  $label.data('3DData', storeData); 
  
  this.viewer.impl.invalidate (true)   
}

GeometryCallback.prototype.onCircularArc = function(cx, cy, start, end, radius, vpId) {

  var vpXform = this.viewer.model.getPageToModelTransform(vpId);
  //if in CAD coordinate system, applyMatrix4 with vpXform
  var center = new THREE.Vector3().set(cx, cy, 0)//.applyMatrix4(vpXform);
 
  console.log('CircleArc segment: ', {
    centerX: center.x,
    centerY: center.y,
    radius: radius,
    startAngle: start,
    endAngle: end
  }); 
 
};

GeometryCallback.prototype.onEllipticalArc = function(cx, cy, start, end, major, minor, tilt, vpId) {
  var vpXform = this.viewer.model.getPageToModelTransform(vpId);
  //if in CAD coordinate system, applyMatrix4 with vpXform
  var center = new THREE.Vector3().set(cx, cy, 0)//.applyMatrix4(vpXform);
   console.log('EllipticalArc segment: ', {
    centerX: center.x,
    centerY: center.y,
    radius: radius,
    startAngle: start,
    endAngle: end
  });  
};
GeometryCallback.prototype.onOneTriangle = function(x1, y1, x2, y2, x3, y3, vpId){
  //Similar logic as above
};
GeometryCallback.prototype.onTexQuad = function(centerX, centerY, width, height, rotation, vpId){
  //from VertexBufferReader.js:
  //Currently this case does not actually come up
};

function add2DLabel_By_HTMLElement(){
  
  var _copiedGeometryName = 'copiedGeometryName'

  // linewidth does not take effect in Chrome and Firefox 
  // It is a known issue with OpenGL core
  // try with Safari
  var _curveMaterial = new THREE.LineBasicMaterial ({
    color: new THREE.Color (0xFF00FF),
    transparent: true,
    depthWrite: false,
    depthTest: false,
    linewidth: 5,
    opacity: 1.0
    }) 

    //create overlay
    viewer.impl.createOverlayScene (_copiedGeometryName, _curveMaterial)   
    //start to monitor select event 
    viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, function(evt){
      console.log(evt) 
      //selected object id
      var dbId = evt.dbIdArray[0] 
      //get instance tree
      var it = viewer.model.getData().instanceTree;
      //dump fragments of the object
      it.enumNodeFragments( dbId, function( fragId ) {
          //get each fragment
          var m = viewer.impl.getRenderProxy(viewer.model, fragId);
          //initialize VertexBufferReader
          var vbr = new Autodesk.Viewing.Private.VertexBufferReader(m.geometry, viewer.impl.use2dInstancing);
          //dump geometry of this fragment
          vbr.enumGeomsForObject(dbId, new GeometryCallback(viewer,_copiedGeometryName, _curveMaterial));
      }); 
    }) 

    //start to monitor camera change event 
    viewer.addEventListener(Autodesk.Viewing.CAMERA_CHANGE_EVENT, function(evt){
      for (const label of $('#' + viewer.clientContainer.id + ' div.adsk-viewing-viewer .update')) {
        const $label = $(label);

        const model_pos = JSON.parse($label.data('3DData')); 
        const screen_pos = viewer.worldToClient(model_pos);
        $label.css('left', Math.floor(screen_pos.x - $label[0].offsetWidth / 2) + 'px');
        $label.css('top', Math.floor(screen_pos.y - $label[0].offsetHeight / 2) + 'px'); 
      }
    }) 
}
 