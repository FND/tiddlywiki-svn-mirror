config.shadowTiddlers["tflStyles"] = store.getTiddlerText("tflSearchMacro##StyleSheet");
store.addNotification("tflStyles", refreshStyles);


config.macros.tflSearch = {};

config.macros.tflSearch.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var j = store.getTiddlerText(window.journey);
	var jarray = j.split("\n");
	var last = jarray[jarray.length-1];
	var w = new Wizard();
	var select = "<select id='profile_info' onchange='javascript:config.macros.tflSearch.dropdownChange();'> <option value='http://openbritain.labs.osmosoft.com/bags/tim/tiddlers/profile.txt'>Tim</option><option value='http://openbritain.labs.osmosoft.com/bags/douglas/tiddlers/profile.txt'>Douglas</option></select>";
	select ="";
	w.createWizard(place," new route item" );
	w.addStep("where do you want to go?",select+'From <input name="from" class="inputWide" value="'+last+'" /><br />To <input name="to"   class="inputWide" value="Greenwich DLR Station" /><br /> <input type=checkbox name="stairs" checked="true">I cannot use stairs<br/><input type=checkbox name="stairs"> I cannot use escalators<br/><input type=checkbox name="stairs"> I cannot use lifts<br/><input type=checkbox name="stairs"> I use wheelchair accessible vehicles');
	w.setButtons([{caption:'Find Routes', onClick:function() {
		config.macros.tflSearch.doPost(w);
	}}])
}

config.macros.tflSearch.dropdownChange = function() {
	doHttp("GET",jQuery("#profile_info").val(),null,null, null, null,config.macros.tflSearch.dropdownChangeCallback,null);
}

config.macros.tflSearch.dropdownChangeCallback = function(a, params, data) {
	console.log(data);
	
}

config.macros.tflSearch.doPost = function(w) {
	var type = "POST";
	var url = "http://openbritain.labs.osmosoft.com/tfl";
	var data = "Submit=Search&advOptActive_2=1&calculateCO2=1&calculateDistance=1&changeSpeed=normal&execInst=normal&imageFormat=png|pdf&imageHeight=500&imageOnly=1&imageWidth=705&imparedOptionsActive=1&inclMOT_0=on&inclMOT_1=on&inclMOT_11=1&inclMOT_2=on&inclMOT_4=on&inclMOT_5=on&inclMOT_7=on&inclMOT_9=on&includedMeans=checkbox&itOptionsActive=1&itdDateDay=23&itdDateYearMonth=201003&itdLPxx_view&itdTimeHour=14&itdTimeMinute=54&itdTripDateTimeDepArr=dep&language=en&nameDefaultText_destination=end&nameDefaultText_origin=start&nameDefaultText_via=Enter location (optional)&nameState_destination=notidentified&nameState_origin=notidentified&nameState_via=notidentified&name_destination="+w.formElem['to'].value+"&name_origin="+w.formElem['from'].value+"&name_via=Enter location (optional)&noSolidStairs=on&placeDefaultText_via=London&place_destination=London&place_origin=London&place_via=London&ptAdvancedOptions=1&ptOptionsActive=1&requestID=0&routeType=LEASTTIME&sessionID=0&trITMOT=100&trITMOTvalue=20&trITMOTvalue101=60&type_destination=stop&type_origin='stop'&type_via='stop'";
	var params = {};
	params.w = w;
	doHttp(type,url,data,null, null, null,config.macros.tflSearch.callback, params);
};

config.macros.tflSearch.callback = function(a, params, data) {
	//jQuery('body').html(data);
	var count = 0;
	var html = "";
	jQuery.xmlDOM(data).find('itdRequest > itdTripRequest > itdItinerary > itdRouteList > itdRoute ').each(function() {
		var changes = "changes : "+jQuery(this).attr('changes');
		var duration = "duration : "+jQuery(this).attr('publicDuration');
		count++;
		html = html + "<h3>Route "+count+"<small><small>&nbsp;&nbsp;&nbsp;  "+changes+" "+duration+"</small></small></h3><br/><div id='route_"+count+"'>";
		var iDom = jQuery(this).children().filter('itdpartialroutelist');
		var r = "";
		console.log(iDom);
		iDom.children().each(function() {
			item = jQuery(this).children();
			console.log(item);
			html = html + item.attr("name")+" <a href='http://www.disabledgo.com/en/access-guide/"+item.attr("name").replace(/ /g, "-")+"'>details</a><br/>";
			r = r + item.attr("name")+"<br/>";			
		});
	window.addRoute = function(route) {
			var route_spec = jQuery("#route_spec_"+route).html();
//			console.log('=---',jQuery(route_spec).text().replace(/details/g, ""));
			var newJourney = store.getTiddlerText(window.journey) + "\n" + route_spec.replace(/<br>/g, "\n");
			store.saveTiddler(window.journey, window.journey, newJourney, null, null, null, merge({},config.defaultCustomFields));
			autoSaveChanges(null, window.journey);
			story.refreshTiddler('TripPlanner', null, true);
	}
	html = html +"</div><div id='route_spec_"+count+"' style='display:none'>"+r+"</div><div class='addToRoute' onclick='javascript:window.addRoute("+count+")' id='addRoute"+count+"'>Add Route</div>";
	});
	params.w.addStep("Here are the routes from "+params.w.formElem['from'].value+" to : "+params.w.formElem['to'].value,html);
	w.setButtons([{caption:'cancel', onClick:function() {
		story.refreshTiddler('TripPlanner', null, true);
	}}])
	jQuery('#results').append(html);	
	
};

jQuery(document).bind('xmlParseError', function(event, error) {
    alert('A parse error occurred! ' + error);
});

/***
!StyleSheet




html body .wizard{
	border:1px solid #ccc;
	background:#eee !important;
}

.wizardFooter {
	border-bottom:0px;
	background:#eee !important;
}

.wizardStep {
 border: 1px solid #ccc;
}

.addToRoute {
	float:right;
	position:relative;
	right:8em;
	top:-4em;
	font-size:2em:
	background:#eee;
	border:1px solid #ddd;
	padding:1em 2em;
}

.wizardStep {
	font-size:1.3em;
	line-height:2em;
}

.wizardStep .inputWide {
font-size:1.4em;
width:80%;
}

.stationContainer {
background:#eee;
padding:1.5em;
margin:1.5em;
border:1px solid #ccc;
}

.stationContainer .title {
color:#000;
}


.comment .heading {
background:#fff;
border:0px;
}
.comment {
border:1px solid #fff;
}

.trainImg {
top:1em;
padding-right:0.6em;
}
***/