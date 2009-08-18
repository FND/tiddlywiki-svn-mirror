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
        },
        
        moveToPolygon: function(){
            var shape = new VismoShape({coordinates:[0,0,200,0,200,200,0,200],shape:"polygon"});
            
            //run
            shape.moveTo(80,50);
            
            //test
            var c = shape.getCoordinates();
            return VismoTests.assertEqual(c,[-20,-50,220,-50,220,150,-20,150]);
            
        }

    }
);