// <![CDATA[
 
describe('TTReportBuilder : Results limit', {

	'it should return no more results than specified' : function() {
		var results;
		var limit = 2;
		value_of(results).should_have_at_most(limit, "items");
	},
	
	'it should not limit results if no value is specified' : function() {
		var resultsBefore;
		var resultsAfter;
		var limit = undefined;
		value_of(resultsBefore.length).should_be(resultsAfter.length);
	}

});

describe('TTReportBuilder : Add column button', {

	'it should create a new column when clicked' : function() {
		var columnsBefore = [];
		var columnsAfter = [];
		// do stuff
		value_of(columnsAfter.length).should_be(columnsBefore.length + 1);
	},
	
	'it should create a new column in edit mode' : function() {
		var editMode = false;
		value_of(editMode).should_be_true();
	},
	
	'it should display a message instructing the user to add a column if there are no columns displayed' : function() {
		var columns = [];
		var NoColumnsMessage;
		value_of(NoColumnsMessage.style.display).should_not_be('none');
	}

});

describe('TTReportBuilder : Delete column button', {

	'it should prompt the user with a confirm box' : function() {
		var calledConfirm = false;
		value_of(calledConfirm).should_be_true();
	},

	'it should remove the column if the confirmation is given' : function() {
		var columnsBefore = [];
		var columnsAfter = [];
		// do stuff
		value_of(columnsAfter.length).should_be(columnsBefore.length - 1);
	}
	
});

describe('TTReportBuilder : Column headers', {

	'it should display the edit and delete buttons when it is moused-over' : function() {
		var columnHeader;
		value_of(columnHeader.className).should_be('hover');
	},

	'it should change to edit mode when the edit button is clicked' : function() {
		var editMode = false;
		value_of(editMode).should_be_true();
	},
	
	'it should leave edit mode if a click event occurs elsewhere' : function() {
		var editMode = true;
		value_of(editMode).should_be_false();
	},
	
	'it should leave edit mode when a value is chosen from the dropdown' : function() {
		var editMode = true;
		value_of(editMode).should_be_false();		
	}

});

describe('TTReportBuilder : Column header edit mode', {

	'it should display a dropdown' : function() {
		var columnHeaderEditor;
		value_of(columnHeaderEditor.nodeType).should_be('select');
	},
	
	'it should be populated with the values of the taskDefinitions ' : function() {
		var options; // = [];
		var taskDefinitions = [];
		value_of(options).should_be(taskDefinitions);
	},
	
	'it should set the field for display to the selected option when a different option is selected' : function() {
		var displayField = "";
		var selectedOption;
		value_of(displayField).should_be(selectedOption);
	},

	'it should exit edit mode when a different option is selected' : function() {
		var editMode = true;
		value_of(editMode).should_be_false();
	}
	
});

describe('TTReportBuilder : The Done checkbox', {

	'it should be checked if the task is done' : function() {
		var doneCheckbox;
		var taskDone = true;
		value_of(doneCheckbox.checked).should_be(taskDone);
	},

	'it should not be checked if the task is not done' : function() {
		var doneCheckbox;
		var taskDone = false;
		value_of(doneCheckbox.checked).should_be(taskDone);
	},

	'it should mark the task as done when checked' : function() {
		var doneCheckbox;
		doneCheckbox.checked = true;
		var taskDone;
		value_of(taskDone).should_be(true);		
	},
	
	'it should mark the task as not done when unchecked' : function() {
		var doneCheckbox;
		doneCheckbox.checked = false;
		var taskDone;
		value_of(taskDone).should_be(false);	
	}

});




// ]]>