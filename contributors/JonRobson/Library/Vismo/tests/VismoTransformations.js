VismoTests.add("VismoTransformations", {
     applyTransformationUndoTransformation: function(){
              var t= {translate:{x:40,y:40},scale:{x:16,y:16},origin:{x:200,y:200}};
              var before = {x:60,y:69};
              var then = VismoTransformations.applyTransformation(60,69,t);
              var after = VismoTransformations.undoTransformation(then.x,then.y,t);
              

              return VismoTests.assertAllEqual([[after.x,before.x],[after.y,before.y]]);
     },
     undoThenApply: function(){
         var t= {translate:{x:40,y:40},scale:{x:16,y:16},origin:{x:200,y:200}};
           var before = {x:60,y:69};
           var then = VismoTransformations.undoTransformation(60,69,t);
           var after = VismoTransformations.applyTransformation(then.x,then.y,t);
           

           return VismoTests.assertAllEqual([[after.x,before.x],[after.y,before.y]]);
         
     }
     
 }
);