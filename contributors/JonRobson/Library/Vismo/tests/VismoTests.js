var VismoTests = {
    tests:{
    }
    ,failures:{
        
    }
    ,successes: {
        
    },
    Mocks: {
        div: function(){
            jQuery("#mockArea").append("<div style='width:200;height:200'></div>");
            var kids = jQuery("#mockArea").children();
            return kids[kids.length-1];
        },
        canvas: function(options){
            var el = this.div();
            var cc = new VismoCanvas(el,options);
            return cc;
        }
    },
    assertAllEqual: function(list){
        var endresult = true;
        var errorstring = "";
        for(var i=0; i < list.length; i++){
            var res = VismoTests.assertEqual(list[i][0],list[i][1]);
            if(res[0] === false){
                endresult = false;
                errorstring += "{"+i+"}"+res[1]+","
            }
        }
        return [endresult,errorstring];
    },
    assertEqual: function(x,y){
        //console.log("is x == y?",x,y);
        if(typeof(x) == 'undefined' && y) return [false,"x is undefined but y is"];
        if(typeof(y) == 'undefined'&& x) return [false,"x is undefined but y is"];
        if(typeof x == 'object'){
            
            var end = true;
            var i;
            for(i in x){
                if(x[i] !== y[i]){
                    end = false;
                }
            }
            return end;
        }
        //console.log("is x == y?",x,y);
        if(x === y){
                
                return [true,""];
            }
            else{
                return [false,x.toString()+" != "+y.toString()];
            }
        
    }
    ,add: function(name,testSuite){
        this.tests[name] = testSuite;
       
    }
    ,run: function(){
        var i,j;
        document.write("<div><span class='ok'><span id='noSuccess'></span> tests succedded</span>, <span class='bad'><span id='noFailures'></span> failures</span></div><div id='mockArea' style='display:none'></div>");
        var results = "";
        var failed = 0;
        var succeeded =0;
        for(i in this.tests){
            results += "<h2>"+i+"</h2>";
            for(j in this.tests[i]){
                var res;
                 
                try{
                    res = this.tests[i][j]();
                }
                catch(e){
                    res =[false,e];
       
                }
                //console.log("run");
                
                if(false === res[0]) {
                    results += "<div class='bad'>test failed:"+i+"."+j+" ("+res[1]+")</div>";
                    failed += 1;
                }
                else{
                    results += "<div class='ok'>test passed:"+i+"."+j+"</div>";
                    succeeded += 1;
                }
            }
        }
        jQuery("#noSuccess").text(succeeded);
        jQuery("#noFailures").text(failed);
        document.write(results);
    }
};

