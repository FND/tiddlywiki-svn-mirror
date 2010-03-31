window.journey = 'Olympic Journey';


config.shadowTiddlers["tflStyles2"] = store.getTiddlerText("showRoutePlugin##StyleSheet");
store.addNotification("tflStyles2", refreshStyles);

	 

config.macros.showRoute = {};
config.macros.showRoute.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
 	console.log('ps', paramString);
	if(paramString!='')
		var journey = paramString;
	else
		var journey = window.journey;
	var c = createTiddlyElement(place, "center");
	var j = store.getTiddlerText(journey);
	var jItems = j.split("\n");
	for(var i = 0; i < jItems.length; i++) {
		var div = createTiddlyElement(c, "div", null, 'routeItem');
		createTiddlyLink(div, jItems[i], jItems[i]);
		var img = createTiddlyElement(c, "img");
		img.src = "http://t2.gstatic.com/images?q=tbn:FlS2c-eOXHQa3M:http://www.hotmobile.org/2009/images/down_arrow_black.gif";	
	}
} 


/***

!StyleSheet


.routeItem {
	background:#eee;
	border:1px solid;
	padding:2em 1em;
	margin:2em;
	border:1px solid orange;
	cursor:pointer;
}

.floatFrame {
width:500px;
height:600px;
}

.floatRight {
	float:right;
}

.worldIcon {
float:right;
}
***/