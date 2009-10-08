
config.macros.secretBackstage = {};
config.macros.secretBackstage.handler = function(place,macroName,params)
{
	createTiddlyButton(place,"****",null,function(e) {
		if(e.altKey && e.shiftKey) {
			backstage.show();
		}
		return false;
	}, 'secretBackstage');
};
