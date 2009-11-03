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
|''Dependencies:''|Jon Robson's Vismo Library + VGraphPlugin|

Allows the adding of multiple level drop down menus and checkboxes to the edit template.
***/




var FamilyTreeInstance;
config.macros.FamilyTreeLabel = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler){
        //tiddler.vismoShape
          if(!paramString)paramString = "";
          var options = {};
            var namedprms = paramString.parseParams(null, null, true);
            for(var i=0; i < namedprms.length;i++){
                var nameval = namedprms[i];
                options[nameval.name] = nameval.value;

            }
        var title_to_label = function(title){
            return title;
        }
        if(options.showinitials){
            title_to_label=  function(title){
                var name_parts = title.split(" ");
                var labelTxt = "";
                for(var j=0; j < name_parts.length; j++){
                    var part = name_parts[j];
                    labelTxt += part.charAt(0)+".";
                }
                return labelTxt;
            }
        }   
        
        var title = tiddler.title;
        var femaleNodeColor ="rgb(255,105,180)";
        var maleNodeColor = "#71B4FF";
        if(tiddler.vismoShape){
            var properties = tiddler.vismoShape.properties;
        
            var labelTxt = "[["+title_to_label(title)+"|"+title+"]]";
            if(tiddler.fields.spouse){
                var spouses = tiddler.fields.spouse.readBracketedList();
                for(var i=0; i < spouses.length;i++){
                    var spouse = spouses[i];
                    labelTxt += " m. [["+title_to_label(spouse)+"|"+spouse+"]]\n";
                }
            }
            if(tiddler.fields.photo){
                var photo = tiddler.fields.photo;
                jQuery(place).append("<img src='"+photo+"' class='ftLabelImage'/>");
            }
            jQuery(place).append("<div class='ftLabelText'></div>");
            var newPlace=jQuery(".ftLabelText",place)[0];
            wikify(labelTxt,newPlace);
            
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
        }
    }
};

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

    ,handler: function(place,macroName,params,wikifier,paramString,tiddler){
        
        /* construct graph*/
        var options = {};
        
        var div = document.createElement("div");
        place.className = "FamilyTree"
        place.appendChild(div);
        var w = jQuery(place).width();
        var h = jQuery(place).height();
        if(!w) w = 700;
        if(!h) h= 300;
        jQuery(div).css({width:w,height:h,"position":"relative"});

        //,prepNode
        if(!options.root){
              var tiddlers = store.getTaggedTiddlers("rootTree");
              if(tiddlers.length >0){
                options.root = tiddlers[0].title;
              }
        }
        if(!options.parentFields)options.parentFields = ["father","mother"];
        if(!options.labelMacro)options.labelMacro = "FamilyTreeLabel";
        if(!options.excludeTags)options.excludeTags = ["systemConfig","excludeTree","excludeLists"];
        var newInstance = config.macros.VGraph.handler(div,false,false,false,paramString,false,options);
        /*jQuery(place).append("<a href='#'>expand</a>");
        jQuery("a",place).click(function(){
           jQuery(".FamilyTree").css({height:"100%"});
           var newh = jQuery(".FamilyTree").height();
           
           newInstance._canvas.resize(false,newh);
        });*/
        this.rootDropdown(div,newInstance,newInstance.options);
        config.activeTree = newInstance;
 
    }

};




