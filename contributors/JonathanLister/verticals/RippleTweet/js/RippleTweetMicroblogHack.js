/*** This hack is to make sure you can use unauthenticated feeds with PhilHawksworth's microblog plugin
You can include a field in a MicroblogConfig tiddler called "authenticated" and set it to "true" ***/
// gather the config data from the config tiddler for use when required.
	config.macros.Microblog.settings = function(platform){
		
		//Get the existing data object or create a new one.
		var mb = microblogs[platform] ? microblogs[platform] : {};
		
		//Gather the data from the tiddler.
		var configTiddlerTitle = "MicroblogConfig_" + platform;
		var slices = store.calcAllSlices(configTiddlerTitle);
		if (!mb['authenticated'])
			mb['authenticated'] = false;
		for(var s in slices) {
			mb[s] = store.getTiddlerSlice(configTiddlerTitle, s);
		}
		
		microblogs[platform] = mb;	
		
		/*
			TODO Remove debug logging.
		*/
		log("-----------------");
		var m = microblogs[platform];	
		for (var t in m) {
			log(t +" : "+ m[t]);
		};
		log("-----------------");
	};
