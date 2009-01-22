config.macros.itineraryMaker={


	parseMediaWikiPageLinks: function(text){
		
		var temp = text;
		var urlRule =/<a href=\"([^\"]*)\"[^>]*>([^<]*)<\/a>/;
		var x= temp.match(urlRule);
		
		var urls = [];
		while(x){
			var link = {};
			link.url = x[1];
			link.title = x[2];
			
			if(link.url.indexOf(":") == -1 && link.url.indexOf("php") == -1 && link.url.indexOf("#") == -1 && link.url.indexOf("http") == -1 && link.title.indexOf("[") == -1){ 
				//ignore external link
				urls.push(link);
			}
			temp =temp.replace(urlRule,"");
			x = temp.match(urlRule);
			
			
		}
		return urls;
	}
	,getMediaWikiPageContent: function(text){
		
		
		var bodyRule = /<div id="bodyContent">([\s\S]*)<div class="printfooter">/;
		
		var x = text.match(bodyRule);
		
		if(x)
			return x[1];
		else
			return text;
	}
	
	,parseMediaWikiGeo: function(text){
		var temp = text;
		var urlRule =/<a href=\"([^\"]*)\"[^>]*>([^<]*)<\/a>/;
		var x= temp.match(urlRule);
		
		var urls = [];
		while(x){
			var link = {};
			link.url = x[1];
			link.title = x[2];
			urls.push(link);
			
			temp =temp.replace(urlRule,"");
			x = temp.match(urlRule);
			
			
		}
		return urls;	
	}
	,createTravelTiddlerFromMediaWikiPage: function(baseurl,relativeurl,parentName,currentDepth,usefeelinglucky){	

		if(currentDepth <= -1) return;
			
		var titleRule =/\/[^\/]*\//;
		
		var title = relativeurl.replace(titleRule,""); //get rid of language
		
		var that = this;
		

		var callback = function(status,params,responseText,url,xhr){
			var depth = currentDepth;
			
			var text = that.getMediaWikiPageContent(responseText);
			if(currentDepth > 0){
				currentDepth -= 1;
				
				var links =that.parseMediaWikiPageLinks(text);
	
				for(var j=0; j <links.length;j++){
					
					that.createTravelTiddlerFromMediaWikiPage(baseurl,links[j].url,title,currentDepth);
				}
			}
						
			var fields = {};
			var tags = [];
			tags.push(parentName);
			that.saveGeoTiddler(title,title,"<html>"+text+"</html>",null,null,tags,fields);		
			
		};
		var url;
		if(usefeelinglucky){
			url ="http://www.google.com/search?hl=en&btnI=Google+Search&q=site%3A" + baseurl+ " " + relativeurl;
		}	
		else{
			url= baseurl + relativeurl;
		}
		EasyFileUtils.loadRemoteFile(url,callback,null,null,null,null,null,null,true);

	}
	
	,saveGeoTiddler: function(title,title,text,u,v,tags,fields){
	 


		var callback= function(results){
			if(!results || !results[0]) return;
			fields.longitude= results[0].lng;
			fields.latitude= results[0].lat;
			store.saveTiddler(title,title,"<html>"+text+"</html>",null,null,tags,fields);
		}
		
		
		
		if(!fields.longitude){
			var query = title.replace("/"," ");
			EasyMapUtils.getLocationsFromQuery(query,callback);
		}
		else{
			store.saveTiddler(title,title,"<html>"+text+"</html>",null,null,tags,fields);
		}
		
	}

	,handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var that = this;
		var handler = function(results){
			var topresult = results[0];
			var title = topresult.titleNoFormatting;
			var friendlytitle = title.replace(",","");

			var friendlytitle = title.replace(",","");
			var travelwikibaseurl ="http://wikitravel.org";
			var relativeurl ="/en/"+friendlytitle;
			that.createTravelTiddlerFromMediaWikiPage(travelwikibaseurl,relativeurl,title,1,true);
			
			//that.createTravelTiddlerFromMediaWikiPage(flurl,friendlytitle,title,1);
			
			
			var countrycode = topresult.country;
			var lo = topresult.lng;
			var la = topresult.lat;
			//256 <<geogoto "+la+ " "+lo+ " 1 mytrip>>
			var wikiText = "<<geo projection:googlestaticmap source:false id:mytrip>><<geosearchandgoto id:mytrip>>";
			store.saveTiddler("The Map","The Map",wikiText,null,null,[],{});
			store.saveTiddler("DefaultTiddlers","DefaultTiddlers","[[The Map]]",null,null,[],{});
			
			
		}
		config.macros.googlelocalsearcher.setup(place,handler);
	}	
};
	