		
config.options.txtTheme = 'MonkeyGTDTheme';

if (!config.mGTD) config.mGTD = {};

config.mGTD.specialTags = [
		"Action",
		"Project",
		"Area",
		"Realm",
		"Context",
		"View",
        "Tickler",
		"Reference",
		"Contact"
]
config.mGTD.tagsToIndex = [
		"Project",
		"Area",
		"Realm",
		"Context",
		"ActionStatus",
		"TicklerStatus",
		"ProjectStatus",
		"GTDComponent",
		"Sidebar",
		"Contact"
];

config.mgtdVersion = "3.0 alpha r__REV__";

config.macros.mgtdVersion={handler:function(place){wikify(config.mgtdVersion,place);}};

config.toggleTagAlwaysTouchModDate = true; // see ToggleTagPlugin



config.shadowTiddlers.SiteTitle = 'MonkeyGTD';
config.shadowTiddlers.SiteSubtitle = 'a getting things done system powered by tiddlywiki';

config.mGTD.getOptChk = function(option) { return store.fetchTiddler('MgtdSettings').tags.contains(option); }
config.mGTD.getOptTxt = function(fieldName) { return store.fetchTiddler('MgtdSettings').fields[fieldName.toLowerCase()]; }
config.mGTD.setOptTxt = function(fieldName,fieldValue) { store.fetchTiddler('MgtdSettings').fields[fieldName.toLowerCase()] = fieldValue; }

