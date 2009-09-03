config.macros.edittags = {
    saveTags: function(title,tags){
		var tiddler =  store.getTiddler(title);
		if(!tiddler) {
			store.saveTiddler(title,title,null,true,null,tags,config.defaultCustomFields,null);
			tiddler =  store.getTiddler(title);
		}
		store.setValue(tiddler,"tags",tags);
    }
    ,refreshTagDisplay: function(place,tiddler){
        jQuery(place).html("");
        var tags = tiddler.tags;
        for(var t=0; t < tags.length; t++){
            var tag = tags[t];
            jQuery(place).append(" "+tag+" <span class='deleter' deletes='"+tag+"'>x</span>");
        }
        
        jQuery(".deleter",place).click(function(e){
            var todelete = jQuery(this).attr("deletes");
            var newtags = [];
            for(var i=0; i < tags.length; i++){
                if(tags[i] != todelete){
                   newtags.push(tags[i]);
                }
            }
            tiddler.tags = newtags;
            config.macros.edittags.saveTags(tiddler.title,tags);
            
            config.macros.edittags.refreshTagDisplay(place,tiddler);
        });
    }
    ,handler: function(place,macroName,paramlist,wikifier,paramString,tiddler){
        var displayer = document.createElement("div");
        place.appendChild(displayer);
        config.macros.edittags.refreshTagDisplay(displayer,tiddler);
        
        var tagplace = document.createElement("div");

        place.appendChild(tagplace);

        var saveNewTag= function(value){
            tiddler.tags.push(value);
            config.macros.edittags.refreshTagDisplay(displayer,tiddler);
            adder.value = "";
            config.macros.edittags.saveTags(tiddler.title,tiddler.tags);
        };
        var adder;
        if(config.macros.AdvancedEditTemplate){
            //config.macros.AdvancedEditTemplate.handler(tagplace,null,null,null,"aet type:search metaDataName:assignby valuesSource:Suggestions");
             var params = paramString.parseParams("anon",null,true,false,false);

            var srcTiddler = getParam(params,"valuesSource");
            var suggestions = [];
            if(srcTiddler){
                var text = store.getTiddler(srcTiddler).text;
                var tempdiv = document.createElement("div");
                wikify(text,tempdiv);
                suggestions = jQuery(tempdiv).html().split("<br>");
            }
            
           config.macros.AdvancedEditTemplate.createSearchBox(tagplace,"tags",suggestions,"",function(v){saveNewTag(v);jQuery("input",tagplace).val("");})
            adder = jQuery("input",tagplace)[0];
        }
        else{
            adder = document.createElement("input");

            tagplace.appendChild(adder);
            
        }
        var addbutton = document.createElement("button");
        addbutton.innerHTML = "add";
        tagplace.appendChild(addbutton);
        

        jQuery(addbutton).click(function(e){
            var val = adder.value;
            saveNewTag(val);
        });
        
        
        
    }
    
};