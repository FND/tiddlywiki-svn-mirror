var library = {examples:{},rules:{},geojsons:{},data:{}};
library.rules = {
	createColorFromValue: function(value){
		if(value == -1){
			r = 125; g=125;b =125;
		}
		else {
			var lower = 400;
			var upper = 1600;
			var rel = (value-lower)/(upper -lower);
			r = parseInt((rel * 255));
			b = parseInt(((1-rel) * 255));
			g = 0;		
		}
		rgb = "rgb("+r+","+g+"," + b+")";
		return rgb;
	}
	,councilRule: function(p,params){
		var r=0,g=0,b=0,rgb;
		var data =library.data.councilTax[p.name];
		var year = params[0];
		var price;
		if(data && data[year] && data[year].length > 0){
			price = data[year][1];

		}
		else{
			price = -1;
		}
		return library.rules.createColorFromValue(price);		
	}
	,random: function(p,params){
		var rgb,r,g,b;
		r =parseInt(Math.random() * 255);
		g =parseInt(Math.random() * 255);
		b =parseInt(Math.random() * 255);	
		rgb = "rgb("+r+","+g+"," + b+")";
		return rgb;

	}
	,mono: function(p,params){
		return params;

	}
	,fieldenumerator: function(properties,params){
		var param = eval("("+params+")");
		var select = param.color;
		if(properties[select]){
			var value = properties[select];
			var choices = param.enumerator;
			
			if(choices[value]){
				return choices[value];
			}
		}
		return false;
	}
};