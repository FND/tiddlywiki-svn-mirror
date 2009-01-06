config.macros.DopplrMyGeo = {};

config.macros.DopplrMyGeo.handler =function(place,macroName,params,wikifier,paramString,tiddler){
	var url = params[0];
	//accesses gml
	var u = EasyMapUtils;
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
			var whenstring = getElementChild(gmls[i],'gd:when').getAttribute("startTime");
			var endstring = getElementChild(gmls[i],'gd:when').getAttribute("endTime");

			var colour = "#00FF00";
			var now= new Date();
			
			var when = new Date();
			var y = whenstring.substring(0,4);
			var  m = whenstring.substring(5,7);
			var d = whenstring.substring(8,10);
			when.setYear(y);
			when.setMonth(m);
			when.setDate(d);
			
			var when2 = new Date();
			var y2 = endstring.substring(0,4);
			var  m2 = endstring.substring(5,7);
			var d2 = endstring.substring(8,10);
			when2.setYear(y2);
			when2.setMonth(m2);
			when2.setDate(d2);
			var endstring = d2+"/"+m2+"/"+y2;
			if(when){
				what += " ("+d+"/"+m+"/"+y;
				if(endstring) what += " - "+ endstring;
				what += ")";
			 }
						
		//yellow been
		//green going
			if(when < now){//gone
				colour = "#FFFF00";
			}
			var coords = pos.firstChild.nodeValue.split(" ");
			var la = parseFloat(coords[0]);
			var lo = parseFloat(coords[1]);
			var props ={name: what, fill: colour};
			props.tags = ['dopplr'];
			data.features.push(new GeoTag(lo,la,props)); //add the tagging feature
			
		}	
	
		data.points = true;
		var geoid = id;
		if(!geoid) geoid = "default";
		
		geomaps[geoid].drawFromGeojson(data);
		
	};
	u.loadRemoteFile(url,callback);

	
};