config.macros.ratemytiddler = {
    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
        var newplace = document.createElement("div");
        var handler = function(e){
            jQuery.get(config.defaultCustomFields["server.host"]+"/stats/AVERAGE?field=rating&tiddler="+tiddler.title+"&value="+ this.value);
            jQuery(newplace).html("Thanks for the feedback!");
        };
        
        newplace.className = "ratingPlace";
        place.appendChild(newplace);
        config.macros.aet.setupRadioboxes(newplace,"Boring:1\nA little boring:2\nOK:3\nQuite Interesting:4\nInteresting:5","1",handler);
    }
    
};