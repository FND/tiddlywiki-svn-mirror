config.macros.VismoChart = {
        handler: function(place,macroName,params,wikifier,paramString,tiddler){
                var prms = paramString.parseParams(null, null, true);
                var data = store.getTiddler(getParam(prms,"data"));
                
                var rowsofdata =data.text.split("\n");
                
                var newplace = document.createElement("div");
                var width = 500;
                var height = 500;
                jQuery(newplace).css({width:500,height:500});
                place.appendChild(newplace);
                var canvas = new VismoCanvas(newplace)
                /*first two used for labels */
                var edgeCoords = [];
                var min_x,max_x, min_y,max_y;
                var move = true;
                for(var i=1; i < rowsofdata.length; i++){
                        var columnsofdata = rowsofdata[i].split("|");
                        columns = [];
                        for(var j =0; j < columnsofdata.length; j++){
                                var col =columnsofdata[j];
                                if(col != "") columns.push(col);
                        }
                        if(columns.length > 0){
                 
                
                        x = parseFloat(columns[0]);
                        y = parseFloat(columns[1]);
                        
                        if(move){
                                edgeCoords.push("M")
                                move = false;
                        }
                        else{
                              //  move = true;
                        }
                        edgeCoords.push(x);
                        edgeCoords.push(-y);
                        
                        if(!max_y || x > max_x) max_x = x;
                        if(!max_y || y > max_y) max_y = y;
                        if(!min_x || x < min_x) min_x = x;
                        if(!min_y || y < min_y) min_y = y;
                        
                        }
                }
                
                var properties = {shape:"path",stroke: '#000000',lineWidth: '1'};
                

                canvas.add(new VismoShape(properties,["M",min_x,0,max_x,0,"M",0,-min_y,0,-max_y]));
                console.log(edgeCoords);
                canvas.add(new VismoShape(properties,edgeCoords));
                
               
                var range_x = max_x - min_x;
                var range_y =max_y - min_y;
                var t = {translate: {x: 0,y:0 }};
                t.scale = {};
                t.scale.x = width /range_x;
                t.scale.y = height / range_y;
                //canvas.setTransformation(t);
                
                canvas.render();
  
        }      
};