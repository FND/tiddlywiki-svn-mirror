		
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
		"Reference"
]
config.mGTD.tagsToIndex = [
		"Project",
		"Area",
		"Realm",
		"Context",
		"ActionStatus",
		"TicklerStatus",
		"ProjectStatus",
		"GTDComponent", // ??
		"Sidebar"
];

config.mgtdVersion = "3.0 alpha r__REV__";

config.macros.mgtdVersion={handler:function(place){wikify(config.mgtdVersion,place);}};

config.toggleTagAlwaysTouchModDate = true; // see ToggleTagPlugin

