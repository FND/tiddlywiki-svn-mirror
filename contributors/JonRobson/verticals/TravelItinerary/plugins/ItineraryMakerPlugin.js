/*To do:
Limit additions to within a certain radius of start */

config.macros.search.label = "search your itinerary";
config.macros.newTiddler.label = "New Note";
config.macros.newTiddler.prompt = "Add a new travel note";
config.macros.itineraryMaker={
	visitedurls: {}
	,mapString: "<<geoedit width:500 height:400 projection:googlestaticmap id:mytrip source:false>>"
	
	,visiturl: function(url, callback){
		
		if(!this.visitedurls[url]){
			this.visitedurls[url] = true;
			EasyFileUtils.loadRemoteFile(url,callback,null,null,null,null,null,null,true);
			
		}
	}
	,localiseImages: function(content){ /*looks for image tags */
		
		var imageRule =/<img src=\"http:\/\/([^\"]*)(\/[^\"]*)\"[^>]*>/;
		/*find something in form
		<img src="http://______/_____">
		*/
		var temp = content;
		var x= temp.match(imageRule);
		while(x){
			
			EasyFileUtils.saveImageLocally("http://"+x[1],x[1]+x[2])
			
			temp =temp.replace(imageRule,"<img src='$1$2'>");
			x= temp.match(imageRule);
			
		}
		return temp;
	}
	,pullFromRSS: function(url,tags, color){	
		var that = this;	
		if(!color) {
			var color =this.getRandomColour();
		}
		var callback = function(status,params,responseText,url,xhr){
			var xml = EasyFileUtils._getXML(responseText);
			var gmls = xml.getElementsByTagName("item");
		
			for(var i=0; i <gmls.length;i++){
				var title,link,description,la,lo;
				la = getElementChild(gmls[i],'geo:lat').firstChild.nodeValue;
				lo = getElementChild(gmls[i],'geo:long').firstChild.nodeValue;
				if(getElementChild(gmls[i],'title').firstChild)title = getElementChild(gmls[i],'title').firstChild.nodeValue;
				if(getElementChild(gmls[i],'link').firstChild)link = getElementChild(gmls[i],'link').firstChild.nodeValue;
				if(getElementChild(gmls[i],'description').firstChild)description = getElementChild(gmls[i],'description').firstChild.nodeValue;
		
		
				var text = "<html><a href='" + link +"'>"+title +"</a><br>"+description+"</html>";
				var fields = {};
				fields.longitude = parseFloat(lo);
				fields.latitude = parseFloat(la);
				fields.fill = color;
				
				var newtext =text;
				
				//that.localiseImages(text);

				that.saveGeoTiddler(title,title,newtext,null,null,tags,fields)
				
			}	
			refreshDisplay();
		};
		this.visiturl(url,callback);
	
	}
	,getRandomColour: function(){
		var r = parseInt(Math.random() * 255);
		var g = parseInt(Math.random() * 255);
		var b = parseInt(Math.random() * 255);
		var rgb= "rgb("+r+","+g+","+b+")";
	
		return rgb;
	}
	,parseMediaWikiPageLinks: function(text){
		
		var temp = text;
		var urlRule =/<a href=\"([^\"]*)\"[^>]*>([^<]*)<\/a>/;
		var x= temp.match(urlRule);
		
		
		var urls = [];
		while(x){
			var link = {};
			link.url = x[1];
			link.title = this.getFriendlyTitle(x[2]);
			
			if(link.url.indexOf(":") == -1 && link.url.indexOf("php") == -1 && link.url.indexOf("#") == -1 && link.url.indexOf("http") == -1 && link.title.indexOf("[") == -1){ 
				//ignore external link
				urls.push(link);
			}
			
			
			temp =temp.replace(urlRule,"$1");
			x = temp.match(urlRule);
			
			
		}
		var result ={};
		result.urls = urls;
		result.text = temp;
		return result;
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
	,getFriendlyTitle: function(title){
		var titleRule =/\/[^\/]*\//;
		var title = title.replace(titleRule,""); //get rid of language
		title.replace(",","");
		title = title.replace(",","");
		
		return title;	
	}
	,createTravelTiddlerFromMediaWikiPage: function(baseurl,relativeurl,currentDepth,usefeelinglucky){	

		if(currentDepth <= -1) return;
		var title = this.getFriendlyTitle(relativeurl);	

		
		var that = this;
		

		var callback = function(status,params,responseText,url,xhr){
			var depth = currentDepth;
			
			var text = that.getMediaWikiPageContent(responseText);
			if(currentDepth > 0){
				currentDepth -= 1;
				
				var res =that.parseMediaWikiPageLinks(text);
				var links = res.urls;
				var newtext = res.text;
				for(var j=0; j <links.length;j++){
					that.createTravelTiddlerFromMediaWikiPage(baseurl,links[j].url,currentDepth);
				}
			}
			
			
			var fields = {};
			fields.fill = that.getRandomColour();
			var tags = [];
			

			that.saveGeoTiddler(title,title,"<html>"+text+"</html>",null,null,[tags],fields);		
			
		};
		var url;
		if(usefeelinglucky){
			url ="http://www.google.com/search?hl=en&btnI=Google+Search&q=site%3A" + baseurl+ " " + relativeurl;
		}	
		else{
			url= baseurl + relativeurl;
		}
		this.visiturl(url,callback);

	}
	
	,saveGeoTiddler: function(title,title,text,u,v,tags,fields){
		var callback= function(results){
			if(!results || !results[0]) return;
			fields.longitude= results[0].lng;
			fields.latitude= results[0].lat;
			store.saveTiddler(title,title,text,null,null,tags,fields);
			refreshDisplay();
		}
		
		if(!fields.longitude){
			var query = title.replace("/"," ");
			EasyMapUtils.getLocationsFromQuery(query,callback);
		}
		else{
			store.saveTiddler(title,title,text,null,null,tags,fields);
			refreshDisplay();
		}
		
	}
	,handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var that = this;
		var days,dayLinks = "";
		
		var handler = function(results){
			if(!days || typeof parseInt(days) != "number"){
				alert("Please enter a valid number of days!")
				return;
			}
			if(results){
				console.log("have result!",results);
				var topresult = results[0];
				var title = topresult.titleNoFormatting;
				var friendlytitle = that.getFriendlyTitle(title);	
				var lo = topresult.lng;
				var la = topresult.lat;
			
				/*var georange = {};
				georange.longitudeMax = lo + 10;
				georange.longitudeMin = lo - 10; 
			*/
				var travelwikibaseurl ="http://wikitravel.org";
				var relativeurl ="/en/"+friendlytitle;
			
				that.createTravelTiddlerFromMediaWikiPage(travelwikibaseurl,relativeurl,1,true);
				that.pullFromRSS("http://api.flickr.com/services/feeds/geo/?lang=en-us&format=rss_200&tags="+friendlytitle,['flickr',friendlytitle]);
				
				var countrycode = topresult.country;
				that.pullFromRSS("http://www.dopplr.com/place/"+countrycode + "/", ['dopplr'])
				

				//sort out map
				var mapString ="<<geoedit width:500 height:400 projection:googlestaticmap id:mytrip source:false>>";
				var wikiText = mapString +"<<geogoto latitude:"+ la + " longitude:" +lo + " zoom:256 id:mytrip>><<geosearchandgoto id:mytrip>>";
				store.saveTiddler("The Map","The Map",wikiText,null,null,['excludeSearch', 'excludeLists'],{});
			}
			for(var i =1; i <= days.value; i++){
				var title ="Day " + i;
				if(!store.tiddlerExists(title)){
					store.saveTiddler(title,title, "So what are you going to do today?",null,null, ['day']);
				}
			}
			
			var dateText = "<<list filter [tag[day]]>>";
			store.saveTiddler("timeline","timeline", dateText,null,null, ['when']);

		}
		
		wikify("''how many days?''",place);
		//from =config.macros.calendarPopup.handler(place,null,['from date']);
		//to =config.macros.calendarPopup.handler(place,null,['until date']);
		days = createTiddlyElement(place,"input");	
		days.value = 1;
		config.macros.googlelocalsearcher.setup(place,handler,false,"''where are you going?''");
	}	
};


config.macros.addRssToItinerary = {
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var urlprefix = "",tags;
		if(params[0]){
			urlprefix = params[0]
		}
		if(params[1]){
			tags = params[1];
		}
		else{
			tags = ['rss'];
		}
		
		//config.macros.itineraryMaker.pullFromRSS()
		var searchterm = createTiddlyElement(place,"input");
		var puller = createTiddlyElement(place,"button",null,null,"add");
		puller.onclick = function(){
			var url =urlprefix + searchterm.value;
			tags.push("[["+searchterm.value+"]]")
			
			config.macros.itineraryMaker.pullFromRSS(url,tags);
		};
	}
	
};