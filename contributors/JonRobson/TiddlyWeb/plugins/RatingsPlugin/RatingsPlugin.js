/* Requires AdvancedEditTemplate plugin and TiddlyWeb stats plugin */


config.macros.ratemytiddler = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
        var newplace = document.createElement("div");
        var handler = function(e){
			var host = config.defaultCustomFields["server.host"];
            jQuery.get(host+"/stats/AVERAGE?field=rating&tiddler="+tiddler.title+"&value="+ this.value);
            jQuery(newplace).html("Thanks for the feedback!");
        };
        
        newplace.className = "ratingPlace";
        place.appendChild(newplace);
        config.macros.aet.setupRadioboxes(newplace,"Boring:1\nA little boring:2\nOK:3\nQuite Interesting:4\nInteresting:5","1",handler);
    }
    
};

config.macros.viewfloat= {
	 handler: function(place,macroName,params,wikifier,paramString,tiddler) {
	 	var field = params[0];
	 	var pre = params[1];
	 	var val;
	 	if(tiddler.fields[field])val= parseFloat(tiddler.fields[field]).toFixed(pre);
	 	else val = "?"
	 	wikify(val,place);
	 }
};

var host = config.defaultCustomFields["server.host"];       
if(!host) alert("make sure you have included the system bag to allow saving!");