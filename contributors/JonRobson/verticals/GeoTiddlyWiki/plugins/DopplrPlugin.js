config.macros.DopplrMyGeo = {};

config.macros.DopplrMyGeo.handler =function(place,macroName,params,wikifier,paramString,tiddler){
	var url = params[0];
	var pastColor = params[2];
	var currentColor = params[3];
	var futureColor = params[4];

	var u = EasyFileUtils;
	var tid = tiddler;

	var id = params[1];
	var callback = function(status,params,responseText,url,xhr){
		
		var data = {'type':'FeatureCollection','features':[]};
		var xml = u._getXML(responseText);
		var gmls = xml.getElementsByTagName("entry");
		for(var i=0; i <gmls.length;i++){
			var where = getElementChild(gmls[i],'georss:where');
			var pos = getElementChild(getElementChild(where,'gml:Point'),"gml:pos");
			var what = getElementChild(gmls[i],'title').firstChild.nodeValue;
			var startTime = getElementChild(gmls[i],'gd:when').getAttribute("startTime");
			var endstring = getElementChild(gmls[i],'gd:when').getAttribute("endTime");

			var colour = futureColor;
			var now= new Date();
			
			var when = new Date();
			var y = startTime.substring(0,4);
			var  m = startTime.substring(5,7);
			var d = startTime.substring(8,10);
			when.setYear(parseInt(y));
			when.setMonth(parseInt(m));
			when.setDate(parseInt(d));

						
		//yellow been
		//green going
			if(when < now){//when is in past
				colour = pastColor;
			}
			var coords = pos.firstChild.nodeValue.split(" ");
			var la = parseFloat(coords[0]);
			var lo = parseFloat(coords[1]);
			var props ={name: what, fill: colour};
			props.tags = ['dopplrTrip'];
			data.features.push(new GeoTag(lo,la,props)); //add the tagging feature
			
		}	
	
		data.points = true;
		var geoid = id;
		if(!geoid) geoid = "default";
		
		geomaps[geoid].drawFromGeojson(data);
		
	};
	u.loadRemoteFile(url,callback);

	
};