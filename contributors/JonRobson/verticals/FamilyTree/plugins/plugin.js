/***
|''Name:''|FamilyTreePlugin|
|''Description:''|Creates basic graphical representation of a family tree in TiddlyWiki |
|''Version:''|0.1|
|''Date:''|October 09|
|''Source:''|http://www.jonrobson.me.uk|
|''Author:''|Jon Robson |
|''Contributors:''|uses code from ECO Tree http://www.codeproject.com/KB/scripting/graphic_javascript_tree.aspx#quick|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.3|

Allows the adding of multiple level drop down menus and checkboxes to the edit template.
***/

var FamilyTreeInstance;
config.macros.FamilyTree = {
    tooltip:function(){
    
    }

    ,rootDropdown: function(place,vgr,options){
        var that = this;
        var rootid = options.root;
        var graph = vgr.graph();
        var orphans = graph.getOrphans().sort();
        var str = "<select class='changeroot' style=''><option value='-1'>select a root</option>";
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
        jQuery(place).append(str);

        jQuery(".changeroot",place).change(function(e){
            if(this.value == "-1") return;
           vgr.clear();
           vgr.compute(this.value);
        });
    }
    ,algorithmDropdown: function(place,vgr,selected){
        var that = this;
        var algorithmStr = "<select class='changeAlgorithm'><option value='-1'>change layout algorithm</option>";
        var algs =VismoGraphAlgorithms.available();
       
        for(var i=0;i < algs.length; i++){
            var alg_id = algs[i];
            var alg = VismoGraphAlgorithms[alg_id];
            var selectStr = "";
            if(selected == alg_id){
                selectStr = " selected";
            }
            if(alg.name){
                algorithmStr += "<option value='"+alg_id+"'"+selectStr+">"+alg.name+"</option>";
            }
        }
        algorithmStr += "</select>";
        
        jQuery(place).append(algorithmStr);
        jQuery(".changeAlgorithm",place).change(function(e){
           if(this.value == "-1") return;
           
            vgr.algorithm(this.value);
            vgr.clear();
            vgr.compute();
        });
    }
    

    ,handler: function(place,macroName,params,wikifier,paramString,tiddler){
        
        /* construct graph*/
        
        var femaleNodeColor ="rgb(255,105,180)";
        var maleNodeColor = "#71B4FF";
        var prepNode = function(tiddler,json){
            var properties = json.properties;
            var title = tiddler.title;
            var name_parts = title.split(" ");
            var initials = "";
            for(var j=0; j < name_parts.length; j++){
                var part = name_parts[j];
                initials += part.charAt(0)+".";
            }
            properties.label = initials;
            properties.hover = title;
            if(tiddler.fields.sex){
                if(tiddler.fields.sex == 'M'){
                    properties.sex= "M";
                    properties.fill = maleNodeColor;
                }
                else if(tiddler.fields.sex =='F'){
                    properties.sex = "F";
                    properties.fill = femaleNodeColor;
                }
            }
                properties.name = title;
        };
        var options = {};
        options.styleNode = prepNode;
        var div = document.createElement("div");
        place.className = "FamilyTree"
        place.appendChild(div);
        var w = jQuery(place).width();
        var h = jQuery(place).height();
        if(!w) w = 700;
        if(!h) h= 300;
        jQuery(div).css({width:w,height:h,"position":"relative"});

        //,prepNode
        var newInstance = config.macros.VGraph.handler(div,false,false,false,paramString,false,options);
        this.rootDropdown(div,newInstance.vgr,newInstance.options);
        this.algorithmDropdown(div,newInstance.vgr,newInstance.options.algorithm);
        
 
    }

};

config.macros.VGraph= {
    
    handler: function(place,macroName,params,wikifier,paramString,tiddler,options){
        /*setup options */
        
        if(jQuery(place).hasClass("viewer")){
            var div = document.createElement("div");
               place.className = "VGraph"
               place.appendChild(div);
               var w = jQuery(place).width();
               var h = jQuery(place).height();
               if(!w) w = 700;
               if(!h) h= 300;
               jQuery(div).css({width:w,height:h,"position":"relative"});
               place = div;
        }
        var nodes = store.getTiddlers();
        if(!options){
            options = {};
        }
   
        merge(options,{nodeWidth:20,nodeHeight:10,defaultNodeColor:"rgb(200,200,200)",lineColor:"rgb(200,200,200)",lineWidth:"4"});
    
        if(!paramString)paramString = "";
        var namedprms = paramString.parseParams(null, null, true);
        for(var i=0; i < namedprms.length;i++){
            var nameval = namedprms[i];
            options[nameval.name] = nameval.value;
            
        }
        if(!options.parentFields) {
            options.parentFields = ["father","mother"];
        }
        
        if(!options.excludeTags){
            options.excludeTags =["systemConfig","excludeTree","excludeLists"];
        }
        if(!options.styleNode){
            options.styleNode = function(tiddler,json){
                json.properties.label = json.id;
            }
        }
   
        var graph = this.constructGraph(nodes,options);
        options.graph = graph;     
           
        if(!options.algorithm)options.algorithm = "walkers";
        if(!options.root){
              var tiddlers = store.getTaggedTiddlers("rootTree");
              if(tiddlers.length >0){
                options.root = tiddlers[0].title;
              }
        }
        return this.setup(place,options)
    }
    ,constructGraph: function(tiddlers,options){
        var parentFields =options.parentFields;
        var ignoreTags = options.excludeTags;
        var prepNode = options.styleNode;
        var n = [];
        var edges = [];
        var tempnodes = {};
       
        for(var i=0; i< tiddlers.length; i++){
            var node = tiddlers[i];
            var id1 = node.title;

            var tags = node.tags;
            if(this._includeTiddlerInGraph(node,ignoreTags)){ 

              var json={id:id1,properties:{}};
              if(prepNode)prepNode(node,json);
              tempnodes[json.id] = json;
              /*define parents of that tiddler */
              for(var j=0; j < parentFields.length; j++){
                var field = parentFields[j];
                if(field == 'tags'){
                    
                    for(var k=0; k < node.tags.length; k++){ 
                       var tag = node.tags[k];
                       if(!tempnodes[tag])tempnodes[tag] = {id:tag,properties:{}};
                       edges.push([tag,id1]);
                    }
                }
                else if(node[field]) {
                    edges.push([node[field],id1]);
                }
                else if(node.fields[field]){
                    edges.push([node.fields[field],id1]);
                }
              }

            }
        }

        for(var l in tempnodes){
            n.push(tempnodes[l]);
        }
        console.log(n,edges);
        var graph = new VismoGraph({nodes:n,edges:edges});
        return graph;
    }
    ,setup: function(place,options){
        this.options = options;
        this.setuptooltip(place);
        var that = this;
        options.dblclick = function(e,s){story.displayTiddler(null,s.properties.name);};
       
        this.options.vismoController = {labels:true,controlFill:options.lineColor,controlShape: "circle",controlStroke:"rgb(255,255,255)"};
       
        this.vgr = new VismoGraphRenderer(place,options);
       
        return this;
    }
    ,graph: function(){
        return this.vgr.graph();
    }
    ,setuptooltip: function(place){
        
        var tooltip = document.createElement("div");
        tooltip.className = "ft_tooltip";
        place.appendChild(tooltip);
        jQuery(tooltip).css({position:"absolute",display:"none"});
        
        var that = this;
        this.options.move = function(e,s){ jQuery(tooltip).css({display:"none"});if(s){var bb = s.getBoundingBox();jQuery(tooltip).text(s.getProperty("name"));jQuery(tooltip).css({top:e.screenY - e.clientY,left:0,display:""});}};
        
        
        
    }

    ,_includeTiddlerInGraph: function(tiddler,ignoreTags){
        for(var i=0; i < ignoreTags.length; i++){
            var tag = ignoreTags[i];
            if(tiddler.tags.indexOf(tag) != -1) return false;
        }
        return true;
    }
};


