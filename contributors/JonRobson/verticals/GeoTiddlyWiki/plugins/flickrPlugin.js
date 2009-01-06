config.macros.flickrMyGeo = {};
config.macros.flickrMyGeo.handler =function(place,macroName,params,wikifier,paramString,tiddler){
	var url = params[0];
		var id = params[1];
	//accesses gml
	var u = EasyMapUtils;
	var tid = tiddler;
	var callback = function(status,params,responseText,url,xhr){
		var data = {'type':'FeatureCollection','features':[]};
		var xml = u._getXML(responseText);
		var gmls = xml.getElementsByTagName("item");
		for(var i=0; i <gmls.length;i++){
			var la = getElementChild(gmls[i],'geo:lat').firstChild.nodeValue;
			var lo = getElementChild(gmls[i],'geo:long').firstChild.nodeValue;
			var media =getElementChild(gmls[i],'media:content');
			
			var image =media.getAttribute("url");
			var height = media.getAttribute("height"); 
			var width = media.getAttribute("width"); 
			
			//do resizing
			if(width > 600){
				var factor = 600 / parseInt(width);
				width = 600;
				height *= factor;
			}
			var colour = "#0000FF";
			var text = "<html><img src='"+image+"' width='"+width+"' height='"+height+"'></html>";
		
			var la = parseFloat(la);
			var lo = parseFloat(lo);
			var prop ={name: image, text: text, tags: ['flickr'],fill: colour};
			data.features.push(new GeoTag(lo,la,prop)); //add the tagging feature
			
		}	
	
		data.points = true;
		var geoid = id;
		if(!geoid) geoid = "default";
		geomaps[geoid].drawFromGeojson(data);
		
		
	};
	u.loadRemoteFile(url,callback);

	
};

