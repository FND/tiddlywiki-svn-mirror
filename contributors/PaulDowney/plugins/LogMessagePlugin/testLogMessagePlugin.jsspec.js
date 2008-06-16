// <![CDATA[

function __mainLogMessage() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}


describe('LogMessagePlugin Initialisation', {

        before_each : function() {
		__mainLogMessage();
        },
	'plugin is present' : function() {
		value_of(version.extensions.LogMessagePlugin.installed).should_be(true);
	}
});


// ]]>
