module("VISMO Shapes");
test("getBoundingBoxCircle", function(){
               var shape = new VismoShape({coordinates:[50,30,20,30],shape:"circle"});
               var bb = shape.getBoundingBox();
               same([bb.center.x,bb.center.y,bb.width,bb.height],[50,30,40,60],"testing the bounding box of a circle");
});
test("setCoordinatesPoint", function(){
             var s = new VismoShape({coordinates:[0,5,7],shape:"point"});
             s.setCoordinates([2,2]);
             var bb = s.getBoundingBox();
             var c = s.getCoordinates();
            
             same(c,[2,2,7,7],"coordinates were set correctly"),
             same([bb.center.x,bb.center.y],[2,2],"centre point is correct")
             same([bb.width,bb.height],[14,14],"dimensions are correct");
});
test("getBoundingBoxPoint", function(){
            var s = new VismoShape({coordinates:[0,5],shape:"point"});
            var bb =s.getBoundingBox();
            same([bb.center.x,bb.center.y],[0,5],"center point correct");
            same([bb.width,bb.height],[5,5],"dimensions correct");
});
        
test("getCoordinatesCircle", function(){
            var shape = new VismoShape({coordinates:[50,30,20],shape:"circle"});
            same(shape.getCoordinates(),[50,30,20,20],"coordinates of newly created circle as expected");
});
test("moveToCircle",function(){
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
            same(c,[200,200,20,20],"coordinates are correct");
            same([bb.center.x,bb.center.y], [200,200],"center correct");
            same(c2,[30,30,20,20],"coordinates after moving circle correct");
            same([bb2.center.x,bb2.center.y],[30,30],"center after move correct");
});
test("scalePolygon",function(){
                 var shape = new VismoShape({coordinates:[200,-20,230,-18,300,-15,400,200,300,220,200,-20],shape:"polygon"});
                shape.resize(1.5,1.5);
                
                var c = shape.getCoordinates();
                /*
                the width of the original shape is 200 and height 240 and center is at 300,100. Resizing the shape by 1.5,1.5 will create a shape with
                dimensions 300 by 360 with the same center 
                
                the old coordinate 200,-20 lay -100,-120 from the center. Now this distance has multiplied by 1.5 so it lies -150,-180 from the center 
                */
                
                same(c.splice(0,2),[150,-80],"coordinates of resized polygon are correct");    
        });
        
test("moveToPolygon", function(){
            var shape = new VismoShape({coordinates:[0,0,200,0,200,200,0,200],shape:"polygon"});
            
            //run
            shape.moveTo(80,50);
            
            //test
            var c = shape.getCoordinates();
            same(c,[-20,-50,180,-50,180,150,-20,150],"moved polygon coordinates are correct");
            
        });