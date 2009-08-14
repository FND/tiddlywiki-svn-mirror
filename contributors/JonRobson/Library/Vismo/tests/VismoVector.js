VismoTests.add("VismoVector", {
     shapehasfillpropertychanged: function(){
         var originalFill = "rgb(255,0,0)";
             var s=  new VismoShape({coordinates:[0,0,0,100,100,100,100,0],fill:originalFill});
             var c = VismoTests.Mocks.div();
             var vector = new VismoVector(s,c);
             vector.render(c);
             
             var actualFill = vector.el.fillcolor;
            
            //setup second test
             var secondfill = "rgb(0,255,0)";       
             //console.log("xxx");      
             vector.vismoShape.setProperty("fill",secondfill);
             //run second test
             vector.render(c);
           
             var actualFill2 = vector.el.fillcolor;
             
             //check results
             return VismoTests.assertAllEqual([[actualFill,originalFill],[secondfill,actualFill2]]);
     }
     
 }
);