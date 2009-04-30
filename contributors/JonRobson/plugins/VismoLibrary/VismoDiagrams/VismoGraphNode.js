var VismoGraphNode = function(json){
	/*recognised/reserved properties are:
	fill, label, position,shape,width,height
	*/

	var id = json.id;
	var properties = json.properties;
	this.id = id;		
	properties = this.completeProperties(properties);
	this.properties = properties;
	this.setPosition(false);
	this.positionDefined = false;
	return false;
};

VismoGraphNode.prototype = {
        getID: function(){
                return this.id;
        }

	,burntojson: function(){
		var json = {};
		json.id = this.id;
		json.properties = this.properties;
		var i;
		for(i in json.properties){
			if(i.indexOf("_") == 0){
				delete json.properties[i];
			}
		}
		return json;
	}
	,completeProperties: function(properties){
		if(!properties){
			properties = {};
		}
		
		if(!properties.id) properties.id= this.id;
		if(!properties.fill) properties.fill = "#ff0000";
		if(!properties.position) properties.position = false;
		
		return properties;
	}
	,getVismoShape: function(){
		return this.vismoShape;
	}
	,getProperty: function(name){
		return this.properties[name];
	}
	,getProperties: function(){
	        return this.properties;
	}
	,setProperty: function(name,value){
		this.properties[name] =value;
	}
	,setProperties: function(properties){
	        var i;
	        for(i in properties){
	                this.setProperty(i,properties[i]);
	        }
	}
	,getPosition: function(){
		return this.getProperty("position");
	}
	,setPosition: function(x,y){
	        this.positionDefined = true;
	        //console.log("Setting",this.id,"to",x,y);
	        if(x=== false) this.setProperty("position",false);
	        else this.setProperty("position",{"x":x,"y":y});
	}
};
