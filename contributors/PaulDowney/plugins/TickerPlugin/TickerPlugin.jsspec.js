// <![CDATA[

function __main() {
	store = new TiddlyWiki();
	loadShadowTiddlers();
	store.loadFromDiv("storeArea","store",true);
	loadPlugins();
}


describe('TickerPlugin Initialisation', {

        before_each : function() {
		__main();
        },
	'plugin is present' : function() {
		value_of(version.extensions.TickerPlugin.installed).should_be(true);
	},
	'config.options.txtTickerInterval defaults to one minute' : function() {
		value_of(config.options.txtTickerInterval).should_be(60);
	},
	'config.optionsDesc.txtTickerInterval text' : function() {
		value_of(config.optionsDesc.txtTickerInterval).should_match(/in seconds/);
	},
	'config.macros.Ticker is enabled by default' : function() {
		value_of(config.macros.Ticker.enabled).should_be(true);
	}
});

describe('TickerPlugin getInterval', {

        before_each : function() {
		__main();
        },
	'config.macros.Ticker.getInterval is a function' : function() {
		value_of(typeof config.macros.Ticker.getInterval).should_be("function");
	},
	'config.macros.Ticker.getInterval returns config.options.txtTickerInterval in milliseconds' : function() {
		value_of(config.macros.Ticker.getInterval()).should_be(config.options.txtTickerInterval*1000);
	},
	'config.macros.Ticker.getInterval by default returns one minute in milliseconds' : function() {
		value_of(config.macros.Ticker.getInterval()).should_be(60000);
	},
	'config.macros.Ticker.getInterval with a config.options.txtTickerInterval value of 10 returns 10000 milliseconds' : function() {
		tests_mock.save("config.options.txtTickerInterval");
		config.options.txtTickerInterval = 10;
		value_of(config.macros.Ticker.getInterval()).should_be(10000);
		tests_mock.restore();
	},
	'config.macros.Ticker.getInterval with a config.options.txtTickerInterval value of "foo" returns 60000 milliseconds' : function() {
		tests_mock.save("config.options.txtTickerInterval");
		config.options.txtTickerInterval = "foo";
		value_of(config.macros.Ticker.getInterval()).should_be(60000);
		tests_mock.restore();
	},
	'config.macros.Ticker.getInterval parameter "bar" returns one minute in milliseconds' : function() {
		value_of(config.macros.Ticker.getInterval("bar")).should_be(60000);
	},
	'config.macros.Ticker.getInterval parameter "bar" returns one minute in milliseconds' : function() {
		value_of(config.macros.Ticker.getInterval("bar")).should_be(60000);
	}
});

describe('TickerPlugin checkTiddler', {

        before_each : function() {
		__main();
		store.create
		tests_mock.before('config.macros.Ticker.invokeTiddler');
		tiddler = store.createTiddler("tickerTest");
        },
        after_each : function() {
		tests_mock.after('config.macros.Ticker.invokeTiddler');
	},
	'config.macros.Ticker.checkTiddler is a function' : function() {
		value_of(typeof config.macros.Ticker.checkTiddler).should_be("function");
	},
});
