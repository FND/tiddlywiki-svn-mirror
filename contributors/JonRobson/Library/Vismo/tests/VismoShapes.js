VismoTests.add("VismoShapes", {


        getBoundingBoxCircle: function(){
               var shape = new VismoShape({coordinates:[50,30,20,30],shape:"circle"});
               var bb = shape.getBoundingBox();
               
               return VismoTests.assertAllEqual([[bb.center.x,50],[bb.center.y,30],[bb.width,40],[bb.height,60]]);
                
        }
        ,setCoordinatesPoint: function(){
             var s = new VismoShape({coordinates:[0,5],shape:"point"});
             s.setCoordinates([2,2]);
             var bb = s.getBoundingBox();
             var c = s.getCoordinates();
            
             return VismoTests.assertAllEqual([[c,[0,5,5,5]],[bb.center.x,2],[bb.center.y,2],[bb.width,5],[bb.height,5]]);
        },
        getBoundingBoxPoint: function(){
            var s = new VismoShape({coordinates:[0,5],shape:"point"});
            var bb =s.getBoundingBox();
             return VismoTests.assertAllEqual([[bb.center.x,0],[bb.center.y,5],[bb.width,5],[bb.height,5]]);
        }
        
        ,getCoordinatesCircle: function(){
            var shape = new VismoShape({coordinates:[50,30,20],shape:"circle"});
            return VismoTests.assertEqual(shape.getCoordinates(),[50,30,20,20]);
        }

    }
);