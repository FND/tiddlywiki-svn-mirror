#add this to your tiddlyweb config and create a bag with name 'stats'
'stats':{
	"tiddler":'CountrySurvey', #optional
	"increment":{
		"fields":[]
	},
	"average":{
		"fields":["rating"],
		"max": 10,
		"min": 1
	}
}