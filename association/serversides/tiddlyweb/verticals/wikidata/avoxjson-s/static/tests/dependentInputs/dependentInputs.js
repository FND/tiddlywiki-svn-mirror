jQuery(document).ready(function() {

	jqMock.addShortcut();

	module('DependentInputs', {
		setup: function() {
			$('body').append('<form id="test-form"></form>');
		},
		teardown: function() {
			$('#test-form').remove();
			DependentInputs.rows = [];
		}
	});
	

	test("when I add a field, all rows should check for dependencies, starting with the one I just added", function() {
		var mock = new jqMock.Mock(DependentInputs,"checkAll");
		mock.modify().args(0,"field");
		DependentInputs.createRow('#test-form');
		mock.verify();
		mock.restore();
	});

	test("when I change a field, all rows should check for dependencies, starting with the one I just added", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		var mock = new jqMock.Mock(DependentInputs,"checkRow");
		mock.modify().args(i,'field');
		$row.field.trigger("change");
		mock.verify();
		mock.restore();
	});

	test("when I change a value drop-down, all rows should check for dependencies, starting with the one I just added", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		var mock = new jqMock.Mock(DependentInputs,"checkRow");
		mock.modify().args(i,'value');
		$row.val.trigger("change");
		mock.verify();
		mock.restore();
	});

	// general stye: when a row finds it matches a dependency, it should update its values to the given list
	test("when a row finds its field is 'Operational Country', it should update its values to the countries list", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		same($row.val.find('option').length,DependentInputs.values.countries.length);
		same($row.find('input:visible').length,0);
	});

	test("when a row finds its field is 'Registered Country', it should update its values to the countries list", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Registered Country');
		$row.field.trigger("change");
		same($row.val.find('option').length,DependentInputs.values.countries.length);
		same($row.find('input:visible').length,0);
	});

	test("when a row finds its field is 'Operational State' and there is a row with field 'Operational Country' with a value of 'United States', it should update its values to the states of the United States", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		$row.val.val('United States');
		$row.val.trigger("change");
		var j = DependentInputs.createRow('#test-form');
		var $row2 = DependentInputs.rows[j];
		$row2.field.val('Operational State');
		$row2.field.trigger("change");
		same($row2.val.find('option').length,DependentInputs.values.us_states.length);
		same($row2.find('input:visible').length,0);
	});

	test("when a row finds its field is 'Operational State' and there is a row with field 'Operational Country' with a value of 'Australia', it should update its values to the states of Australia", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		$row.val.val('Australia');
		$row.val.trigger("change");
		var j = DependentInputs.createRow('#test-form');
		var $row2 = DependentInputs.rows[j];
		$row2.field.val('Operational State');
		$row2.field.trigger("change");
		same($row2.val.find('option').length,DependentInputs.values.aus_states.length);
		same($row2.find('input:visible').length,0);
	});

	test("when a row finds its field is 'Operational State' and there is a row with field 'Operational Country' with a value of 'Canada', it should update its values to the states of Canada", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		$row.val.val('Canada');
		$row.val.trigger("change");
		var j = DependentInputs.createRow('#test-form');
		var $row2 = DependentInputs.rows[j];
		$row2.field.val('Operational State');
		$row2.field.trigger("change");
		same($row2.val.find('option').length,DependentInputs.values.ca_states.length);
		same($row2.find('input:visible').length,0);
	});

	test("when a row changes its values to a drop-down, it should create an empty hidden input field after the values", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val('Operational Country');
		$row.field.trigger("change");
		same($row.find('input:hidden').length,1);
	});

	test("when a row changes its values to a drop-down and there was a pre-existing value, it should use that as the drop-down's value, if possible", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		var expected = "United States";
		var code = "USA";
		$row.val.val(code);
		$row.field.val('Operational Country');
		$row.field.trigger('change');
		same($row.val.val(),expected);
	});

	test("when a value drop-down changes, it should update the value of its hidden input field to the search API-compatible code of the new value", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		$row.val.val("United Kingdom");
		$row.val.trigger("change");
		same($row.find('input:hidden').val(),"GBR");
	});

	test("when I add a row, the field drop-down should get a name of adv_i_field, where i is the index of the row, starting at 0", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		same($row.field.attr("name"),"adv_"+i+"_field");
	});
	
	test("when I add a row, the value input should get a name of adv_i_value, where i is the index of the row, starting at 0", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		same($row.val.attr("name"),"adv_"+i+"_value");
	});

	test("when a row changes its values to a drop-down, the drop-down's name should have '_ignore_' prepended", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		var name = $row.find('input:hidden').attr('name');
		same($row.val.attr("name"),"_ignore_"+name);
	});
	
	test("dependencies should be triggered no matter which order two inter-dependent rows were added", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational State");
		$row.field.trigger("change");
		var j = DependentInputs.createRow('#test-form');
		var $row2 = DependentInputs.rows[j];
		$row2.field.val("Operational Country");
		$row2.field.trigger("change");
		$row2.val.val("Australia");
		$row2.val.trigger("change");
		same($row.val.find('option').length,DependentInputs.values.aus_states.length);
		same($row.find('input:visible').length,0);
	});

	test("when a field is changed and no dependencies are hit, the value should be changed back to an input if it is a drop-down", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		same($row.find('input:visible').length,0);
		$row.field.val("CABRE");
		$row.field.trigger("change");
		same($row.find('input:visible').length,1);
	});
	
	test("when a value is changed back to an input from a drop-down, the hidden input field should pass on its id, name and value to the new input", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		var $hid = $row.find('input:hidden');
		var expected = {
			'id': $hid.attr('id'),
			'name': $hid.attr('name'),
			'val': $hid.val()
		};
		$row.field.val("CABRE");
		$row.field.trigger("change");
		same($row.find('input:hidden').length,0);
		var $vis = $row.find('input:visible');
		var actual = {
			'id': $vis.attr('id'),
			'name': $vis.attr('name'),
			'val': $vis.val()
		};
		same(expected,actual);
	});
	
	test("when replacing values with a drop-down, if there's already a hidden input field, don't create another one", function() {
		var i = DependentInputs.createRow('#test-form');
		var $row = DependentInputs.rows[i];
		$row.field.val("Operational Country");
		$row.field.trigger("change");
		same($row.find('input:hidden').length,1);
		$row.field.val("Registered Country");
		$row.field.trigger("change");
		same($row.find('input:hidden').length,1);
	});
});
