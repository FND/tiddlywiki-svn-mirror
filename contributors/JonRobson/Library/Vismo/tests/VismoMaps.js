module("VISMO: VismoMap");
test("test initialisation geojson (feature with multiple shapes)", function() {
  var expected,actual,map,data,el;
  var el = config.extensions.VismoMocks.div();
  data = {type:"FeatureCollection", features:[{type:"Feature", id:826, geometry:{type:"MultiPolygon", coordinates:[[[[-6.35, 55.24], [-5.43, 54.48], [-6.27, 54.1], [-8.16, 54.44], [-7.41, 54.95], [-7.25, 55.07], [-6.35, 55.24]]], [[[-5.78, 56.51], [-6.37, 56.31], [-6.32, 56.6], [-5.78, 56.51]]], [[[-6.14, 57.57], [-5.66, 57.2], [-6.79, 57.45], [-6.14, 57.57]]], [[[-6.2, 58.36], [-7.12, 57.82], [-7.04, 58.23], [-6.2, 58.36]]], [[[-3.01, 58.63], [-4.44, 57.57], [-1.77, 57.46], [-3.28, 56.36], [-2.58, 56.27], [-3.73, 56.03], [-1.63, 55.58], [-1.3, 54.76], [-0.07, 54.11], [0.12, 53.56], [-0.72, 53.7], [0.24, 53.4], [0.000037000000134, 52.88], [1.68, 52.75], [1.59, 52.08], [0.38, 51.45], [1.41, 51.18], [-5.68, 50.04], [-4.23, 51.19], [-3.03, 51.21], [-2.38, 51.76], [-3.35, 51.38], [-5.25, 51.73], [-4.13, 52.33], [-4.13, 52.91], [-4.76, 52.79], [-4.2, 53.21], [-2.7, 53.35], [-3.11, 53.55], [-2.81, 54.22], [-3.63, 54.51], [-3.04, 54.98], [-4.95, 54.65], [-5.17, 55], [-4.61, 55.49], [-4.92, 55.7], [-4.88, 55.94], [-4.48, 55.92], [-4.83, 56.11], [-5.3, 55.85], [-5.03, 56.23], [-5.78, 55.3], [-5.12, 56.82], [-6.24, 56.71], [-5.4, 57.11], [-5.82, 57.82], [-5.1, 57.85], [-5.46, 58.08], [-5, 58.62], [-3.01, 58.63]]], [[[-2.79, 58.95], [-3.19, 58.91], [-3.35, 59.11], [-2.79, 58.95]]], [[[-1.3, 60.49], [-1.27, 59.85], [-1.69, 60.28], [-1.3, 60.49]]]]}, properties:{name:"UNITED KINGDOM"}}]};
  
  map = new VismoMap(el,{geojson:data});
  canvas = map.getVismoCanvas();
  var vismoShapes = canvas.getMemory();
  same(vismoShapes.length,7);
  for(var i=0; i < vismoShapes.length;i++){
    var shape = vismoShapes[i];
    same(shape.getProperty("name"),"UNITED KINGDOM","all newly created shape have the same name property");
  }
  features = map.getFeatures();
  same(features.length,1,"map only contains one feature");
  
  features[0].setProperty("name","FRANCE"); //France invades the UK.
  vismoShapes = canvas.getMemory();
  for(var i=0; i < vismoShapes.length;i++){
    var shape = vismoShapes[i];
    same(shape.getProperty("name"),"FRANCE","renaming a feature was a success");
  }
});

test("test initialisation geojson (feature with 1 shape)", function() {
  var expected,actual,map,data,el;
  var el = config.extensions.VismoMocks.div();
  data = {type:"FeatureCollection", features:[{type:"Feature", id:826, geometry:{type:"MultiPolygon", coordinates:[[[[-6.35, 55.24], [-5.43, 54.48], [-6.27, 54.1], [-8.16, 54.44], [-7.41, 54.95], [-7.25, 55.07], [-6.35, 55.24]]]]}, properties:{name:"UNITED KINGDOM"}}]};
  
  map = new VismoMap(el,{geojson:data});
  canvas = map.getVismoCanvas();
  var vismoShapes = canvas.getMemory();
  same(vismoShapes.length,1);
  features = map.getFeatures();
  same(features.length,1,"map only contains one feature");
  var feature = features[0];
  var feature_shapes = feature.getVismoShapes();
  var shape =feature_shapes[0];
  var coords = shape.getCoordinates();
  same(coords.splice(0,2),[-6.35,-55.24],"checking the y coordinate has been inverted");
  same(shape.getProperty("shape"),"polygon","the shape was created as a polygon")
});




