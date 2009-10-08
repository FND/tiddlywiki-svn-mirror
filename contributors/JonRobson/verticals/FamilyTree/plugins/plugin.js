
var FamilyTreeInstance;
config.macros.FamilyTree = {
    tooltip:function(){
    
    }
    ,handler: function(place,macroName,params,wikifier,paramString,tiddler){
        var namedprms = paramString.parseParams(null, null, true);
        var nodes = store.getTiddlers();
        var n = [];
        var edges = [];
        var tempnodes = {};
        for(var i=0; i< nodes.length; i++){
            var node = nodes[i];
            var id1 = node.title;

            var tags = node.tags;
            if(tags.indexOf("systemConfig") == -1 && tags.indexOf("excludeTree") == -1 && tags.indexOf("excludeLists") == -1){ 
              var json={id:nodes[i].title,properties:{}};
              var properties = json.properties;
              if(node.fields.sex){
                  if(node.fields.sex == 'M'){
                      properties.sex= "M";
                      properties.fill = "rgb(0,0,200)";
                  }
                  else if(node.fields.sex =='F'){
                      properties.sex = "F";
                      properties.fill = "rgb(255,105,180)";
                  }
              }
              properties.name = id1;
              if(!tempnodes[json.id])tempnodes[json.id] = json;
              
              if(node.fields.father) edges.push([node.fields.father,id1]);
              if(node.fields.mother) edges.push([node.fields.mother,id1]);
            }

        }
        
        for(var i in tempnodes){
            n.push(tempnodes[i]);
        }
        var graph = new VismoGraph({nodes:n,edges:edges});
        var div = document.createElement("div");
        place.className = "FamilyTree"
        place.appendChild(div);
        
        var w = jQuery(place).width();
        var h = jQuery(place).height();
        if(!w) w = 700;
        if(!h) h= 300;
        jQuery(div).css({width:w,height:h,"position":"relative"});
        var rootid;
        if(getParam(namedprms,"root")){
            rootid = getParam(namedprms,"root");
        }
         else{
                var tiddlers = store.getTaggedTiddlers("rootTree");
                if(tiddlers.length >0){
                    rootid = tiddlers[0].title;
                }

            }
    
        var root = store.getTiddler(rootid);
        var tooltip = document.createElement("div");
        tooltip.className = "ft_tooltip";
        place.appendChild(tooltip);
        jQuery(tooltip).css({position:"relative",border:"red"});

        var orphans = graph.getOrphans().sort();
        var str = "<select class='changeroot' style='z-index:4000;float:right;position:relative;'>";
        for(var i=0; i < orphans.length;i++){
            var p=orphans[i];
            var node = graph.getNode(p);
            if(node.properties.sex != "F"){
                       str +="<option value='"+p+"'";
                        if(p == rootid)  str += " selected";
                        str += ">"+p+"</option>";  
           }
            
     
        }
        str += "</select>";
        jQuery(div).append(str);
        jQuery(".changeroot",div).change(function(e){
           that.vgr.clear();
           that.vgr.compute(this.value);
        });
        
        var options = {graph:graph,algorithm:FT_algorithm,nodeWidth:20,nodeHeight:10};
        
        if(rootid) options.root=rootid;
        var that = this;
        jQuery(tooltip).css({position:"absolute",display:"none"});
        options.move = function(e,s){ jQuery(tooltip).css({display:"none"});if(s){var bb = s.getBoundingBox();jQuery(tooltip).text(s.getProperty("name"));jQuery(tooltip).css({top:e.screenY - e.clientY,left:0,display:""});}};
        options.dblclick = function(e,s){story.displayTiddler(null,s.properties.name);};
        this.vgr = new VismoGraphRenderer(div,options);
        config.activeTree = this.vgr;
    }

};

