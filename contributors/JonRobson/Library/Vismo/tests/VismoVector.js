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
     },
     move: function(){
            var s = new VismoShape({coordinates: [10,20,52],shape:"circle"});
            var d = VismoTests.Mocks.div();
            var v = VismoTests.Mocks.vector(s,d);
            var t = VismoTests.Mocks.transformation();
            v.render(d,t);
            var el1 = v.getVMLElement();
            var top1 = el1.style.top;
            var left1 = el1.style.left;
            
            s.moveTo(3,300);
            v.render(d,t);
            var el2 = v.getVMLElement();
            var top2 = el2.style.top;
            var left2=el2.style.left;
            
            return VismoTests.assertAllEqual([[top1,"-32px"],[left1,"-42px"],[left2,"-49px"],[top2,"248px"]]);
     }
     
 }
);