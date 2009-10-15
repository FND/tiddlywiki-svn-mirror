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
    ,handler: function(place,macroName,params,wikifier,paramString,tiddler){
        var namedprms = paramString.parseParams(null, null, true);

        var nodes = store.getTiddlers();
        var n = [];
        var edges = [];
        var tempnodes = {};
        var femaleNodeColor ="rgb(255,105,180)";
        var maleNodeColor = "#71B4FF";
        
        for(var i=0; i< nodes.length; i++){
            var node = nodes[i];
            var id1 = node.title;

            var tags = node.tags;
            if(tags.indexOf("systemConfig") == -1 && tags.indexOf("excludeTree") == -1 && tags.indexOf("excludeLists") == -1){ 
              var name_parts = id1.split(" ");
              var initials = "";
              for(var j=0; j < name_parts.length; j++){
                  var part = name_parts[j];
                  initials += part.charAt(0)+".";
              }
              var json={id:nodes[i].title,properties:{label:initials,hover:nodes[i].title}};
              var properties = json.properties;
              if(node.fields.sex){
                  if(node.fields.sex == 'M'){
                      properties.sex= "M";
                      properties.fill = maleNodeColor;
                  }
                  else if(node.fields.sex =='F'){
                      properties.sex = "F";
                      properties.fill = femaleNodeColor;
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
        jQuery(div).append(str);
        var algorithmStr = "<select class='changeAlgorithm'><option value='-1'>change layout algorithm</option>";
        var algs =VismoGraphAlgorithms.available();
       
        for(var i=0;i < algs.length; i++){
            var alg_id = algs[i];
            var alg = VismoGraphAlgorithms[alg_id];
            if(alg.name){
                algorithmStr += "<option value='"+alg_id+"'>"+alg.name+"</option>";
            }
        }
        algorithmStr += "</select>";
        
        jQuery(div).append(algorithmStr);
        jQuery(".changeroot",div).change(function(e){
            if(this.value == "-1") return;
           that.vgr.clear();
           that.vgr.compute(this.value);
        });
        jQuery(".changeAlgorithm",div).change(function(e){
           if(this.value == "-1") return;
           
           that.vgr.algorithm(this.value);
            that.vgr.clear();
            that.vgr.compute();
        });
        
        var requested_alg = getParam(namedprms,"algorithm");
        if(!requested_alg){
            alg='walkers';
        }
        else{
            alg = requested_alg;
            
        }
        var options = {graph:graph,"algorithm_name":alg,nodeWidth:20,nodeHeight:10,defaultNodeColor:"rgb(200,200,200)",lineColor:"rgb(255,255,255)",lineWidth:"4"};
     
        for(var i=0; i < namedprms.length;i++){
            var nameval = namedprms[i];
            options[nameval.name] = nameval.value;
        }
        if(rootid) options.root=rootid;
        var that = this;
        jQuery(tooltip).css({position:"absolute",display:"none"});
        options.vismoController = {labels:true,controlFill:"rgb(255,255,255)",controlShape: "circle",controlStroke:"#39AC1B"};
        options.move = function(e,s){ jQuery(tooltip).css({display:"none"});if(s){var bb = s.getBoundingBox();jQuery(tooltip).text(s.getProperty("name"));jQuery(tooltip).css({top:e.screenY - e.clientY,left:0,display:""});}};
        options.dblclick = function(e,s){story.displayTiddler(null,s.properties.name);};
        this.vgr = new VismoGraphRenderer(div,options);
        config.activeTree = this.vgr;
    }

};

