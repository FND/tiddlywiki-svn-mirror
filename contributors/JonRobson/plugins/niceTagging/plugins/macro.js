/***
|''Name:''| NiceTaggingPlugin|
|''Description:''| creates a nicer interface for adding and removing TiddlyWiki. Ideal for tiddly novices. |
|''Version:''|0.5|
|''Date:''|8 September 2009|
|''Source:''|http://www.jonrobson.me.uk/development/niceTagging|
|''Author:''|Jon Robson|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.3|
|''Dependencies:''|AdvancedEditTemplatePlugin|
***/

if(store){
  config.shadowTiddlers.NiceTaggingStyle = "/*{{{*/\n" +
  ".tip {font-style:italic;font-weight:bold;}\n"+
  ".dp-popup {position:absolute;background-color:white;} a.dp-choose-date {	float: left;	width: 16px;	height: 16px;	padding: 0;	margin: 5px 3px 0;	display: block;	text-indent: -2000px;	overflow: hidden;	background: url(calendar.png) no-repeat; }a.dp-choose-date.dp-disabled {	background-position: 0 -20px;	cursor: default;}input.dp-applied {	width: 140px;	float: left;}\n"+
  ".niceTagger input {width:200px; float:left;}\n"+
  ".deleter {color:red; font-weight:bold; padding:2px; cursor:pointer;}\n"+
  "/*}}}*/";
store.addNotification("NiceTaggingStyle", refreshStyles);
}


config.macros.niceTagger = {
	lingo:{
		add: "add"
	}
	,init: function(){
	    var x= store.getTiddlers();
        for(var i=0; i < x.length; i ++){
        	var y = x[i].tags;
        	config.macros.niceTagger.twtags = config.macros.niceTagger.twtags.concat(y);
        };
	}
    ,saveTags: function(title,tags){
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
            jQuery(place).append(" <span class='tag'>"+tag+"</span> <span class='deleter' deletes='"+escape(tag)+"'>x</span>");
        }
        
        jQuery(".deleter",place).click(function(e){
            var todelete = jQuery(this).attr("deletes");
            var newtags = [];
            for(var i=0; i < tags.length; i++){
                if(escape(tags[i]) != todelete){
                   newtags.push(tags[i]);
                }
            }
            tiddler.tags = newtags;
            config.macros.niceTagger.saveTags(tiddler.title,tiddler.tags);
            
            config.macros.niceTagger.refreshTagDisplay(place,tiddler);
        });
    }
    ,handler: function(place,macroName,paramlist,wikifier,paramString,tiddler){
        var displayer = document.createElement("div");
        displayer.className = "niceTagger";
        place.appendChild(displayer);
        config.macros.niceTagger.refreshTagDisplay(displayer,tiddler);
        var tagplace = document.createElement("div");

        place.appendChild(tagplace);
        var saveNewTag= function(value){
          if(value.replace(" ","").length == 0) return;
		  if(tiddler.tags.indexOf(value) != -1) return;
            tiddler.tags.push(value);
            config.macros.niceTagger.refreshTagDisplay(displayer,tiddler);
            adder.value = "";
            config.macros.niceTagger.saveTags(tiddler.title,tiddler.tags);
        };
        var adder;
        if(config.macros.AdvancedEditTemplate){
            //config.macros.AdvancedEditTemplate.handler(tagplace,null,null,null,"aet type:search metaDataName:assignby valuesSource:Suggestions");
             var params = paramString.parseParams("anon",null,true,false,false);
			 var textcase = getParam(params,"case");
            var srcTiddler = getParam(params,"valuesSource");
            var suggestions = [];
            if(srcTiddler){
                var text = store.getTiddler(srcTiddler).text;
                var tempdiv = document.createElement("div");
                wikify(text,tempdiv);
                suggestions = jQuery(tempdiv).html().split("<br>");
            }
            if(textcase && textcase == "lower"){
              for(var i=0; i < suggestions.length;i++){
                suggestions[i] =suggestions[i].toLowerCase();
              }
            }
		var tagsoff = getParam(params,"nostoretags");
		if(!tagsoff) suggestions = suggestions.concat(config.macros.niceTagger.twtags);
		
		
		var uniqueSuggestions = [];
		for(var i=0; i < suggestions.length; i++){
			var s =suggestions[i];
			//rtrim then ltrim
			s = s.replace(new RegExp("[\\s]+$", "g"), "").replace(new RegExp("^[\\s]+", "g"), "");
			//console.log(uniqueSuggestions.toString(),s,uniqueSuggestions.indexOf(s));
				if(uniqueSuggestions.indexOf(s) ==-1){
					uniqueSuggestions.push(s);
				}
		}
		//console.log(uniqueSuggestions);
           config.macros.AdvancedEditTemplate.createSearchBox(tagplace,"tags",uniqueSuggestions,"",function(v){saveNewTag(v);jQuery("input",tagplace).val("");})
           adder = jQuery("input",tagplace)[0];
			
		
        }
        else{
            adder = document.createElement("input");

            tagplace.appendChild(adder);
            
        }
		jQuery(adder).keypress(function (e) {
			if(e.which == 13){
				var results = jQuery(".ac_over",".ac_results"); //is anything highlighted in autocomplete plugin
				if(results.length ==0)
		
					saveNewTag(adder.value);
			}
		});
        var addbutton = document.createElement("button");
        addbutton.innerHTML = config.macros.niceTagger.lingo.add;
		addbutton.className = "adder";
        tagplace.appendChild(addbutton);
        

        jQuery(addbutton).click(function(e){
            var val = adder.value;
            saveNewTag(val);
        });
        
        
        
    },
	twtags:[]
    
};
config.macros.niceTagger.init();
