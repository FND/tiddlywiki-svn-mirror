// <![CDATA[

describe('ConfabbAgendaAdaptorPlugin', {

        before_each : function() {
		tests_mock.before('refreshDisplay');
		tests_mock.before('saveTest', function() { tests_mock.before('store.notifyAll'); });
		tests_mock.before('restart');
		tests_mock.before('backstage.init');
		main();
		tests_mock.after('store.notifyAll');
		tests_mock.after('backstage.init');
		tests_mock.after('saveTest');
		tests_mock.after('restart');
		tests_mock.after('refreshDisplay');
        },

	'Confabb Adaptor is present' : function() {
		value_of(version.extensions.ConfabbAgendaAdaptorPlugin.installed).should_be(true);
	}
	
});

// ]]>
