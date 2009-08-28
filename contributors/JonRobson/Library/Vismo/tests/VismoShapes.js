VismoTests.add("VismoShapes", {


        getBoundingBoxCircle: function(){
               var shape = new VismoShape({coordinates:[50,30,20,30],shape:"circle"});
               var bb = shape.getBoundingBox();
               
               return VismoTests.assertAllEqual([[bb.center.x,50],[bb.center.y,30],[bb.width,40],[bb.height,60]]);
                
        }
        ,setCoordinatesPoint: function(){
             var s = new VismoShape({coordinates:[0,5,7],shape:"point"});
             s.setCoordinates([2,2]);
             var bb = s.getBoundingBox();
             var c = s.getCoordinates();
            
             return VismoTests.assertAllEqual([[c,[2,2,7,7]],[bb.center.x,2],[bb.center.y,2],[bb.width,14],[bb.height,14]]);
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
        ,moveToCircle: function(){
            var shape = new VismoShape({coordinates:[50,30,20],shape:"circle"});
            
            //run
            shape.moveTo(200,200);
            
            //test
            var bb = shape.getBoundingBox();
            var c = shape.getCoordinates();

            
            //run test 2
            shape.moveTo(30,30);
            var c2 = shape.getCoordinates();
            var bb2 = shape.getBoundingBox();
            return VismoTests.assertAllEqual([c,[200,200,20,20],[bb.center.x,200], [bb.center.y,200],[c2,[30,30,20,20]],[bb2.center.x,30],[bb2.center.y,30]]);
        }
        
        ,scalePolygon: function(){
                 var shape = new VismoShape({coordinates:[[173.04, 34.44, 173.27, 35.02, 174.32, 35.23, 174.85, 36.85, 175.58, 37.24, 175.35, 36.48, 175.84, 36.75, 175.99, 37.64, 177.16, 38.01, 178.57, 37.71, 177.91, 39.26, 177.05, 39.2, 176.83, 40.18, 175.32, 41.61, 174.59, 41.28, 175.16, 40.1, 173.75, 39.29, 174.59, 38.82, 174.97, 37.75, 174.55, 37.07, 174.89, 37.06, 174.19, 36.5, 174.51, 36.23, 173.91, 35.87, 174.08, 36.41, 173.4, 35.57, 173.66, 35.31, 173.09, 35.21, 172.72, 34.5, 173.04, 34.44]],shape:"polygon"});
//50*50 center 75,75 width 50 height 50
          //run
                shape.resize(1.5,1.5);
//100*100 center 75,75 width 100 height 100
                //test
                var c = shape.getCoordinates();
                return VismoTests.assertEqual(c,[173.04, 34.44, 173.27, 35.02, 174.32, 35.23, 174.85, 36.85, 175.58, 37.24, 175.35, 36.48, 175.84, 36.75, 175.99, 37.64, 177.16, 38.01, 178.57, 37.71, 177.91, 39.26, 177.05, 39.2, 176.83, 40.18, 175.32, 41.61, 174.59, 41.28, 175.16, 40.1, 173.75, 39.29, 174.59, 38.82, 174.97, 37.75, 174.55, 37.07, 174.89, 37.06, 174.19, 36.5, 174.51, 36.23, 173.91, 35.87, 174.08, 36.41, 173.4, 35.57, 173.66, 35.31, 173.09, 35.21, 172.72, 34.5, 173.04, 34.44]);    
        },
        moveToPolygon: function(){
            var shape = new VismoShape({coordinates:[0,0,200,0,200,200,0,200],shape:"polygon"});
            
            //run
            shape.moveTo(80,50);
            
            //test
            var c = shape.getCoordinates();
            return VismoTests.assertEqual(c,[-20,-50,180,-50,180,150,-20,150]);
            
        }

    }
);