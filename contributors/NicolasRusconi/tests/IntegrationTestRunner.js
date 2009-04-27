/***
|''Name:''|IntegrationTestRunner|
|''Description:''|Macro to run integration tests|
|''Author:''|Nicolas Rusconi (nicolas.rusconi (at) globant (dot) com)|
|''Version:''|1.0.0|
|''Date:''|Feb 13, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Type''|plugin|
***/
/*{{{*/
TestRunner = {};
TestRunner.registeredTests = [];
TestRunner.add = function(testDefinition) {
	TestRunner.registeredTests.push(Test.buildTests(testDefinition));
};

TestRunner.statusMessage = 'Runing test %0/%1  Failures:%2 Pass:%3';
TestRunner.runSummary = '%0 test(s) run. Failures: %1 Pass:%2 ';
TestRunner.allPassedMessage = ' All Passed.';
TestRunner.failedMessage = ' See errors below';
TestRunner.notRunCountMessage = 'Not run:%0';
TestRunner.notRunMessage = ' not run.';
TestRunner.inconsistentTestCountMessage = ' Error running test total test count is %0 and there are %1 tests to run ';
TestRunner.testDurationMessage = ' Finished after %0 seconds.(%1)';
TestRunner.testDescriptionMessage = ' (%0 sec) ';
TestRunner.testAbortedMessage = 'Test run aborted. ';
TestRunner.saveTestStatusErrorMessage = 'Error running %0 : %1, try running this test alone.';
TestRunner.cookieLimitAbortMessage = 'Cookie used for test tracking has reached it\'s limit.';

TestRunner.passedBackground = "#00FF00";
TestRunner.failedBackground = "#FF0000";
TestRunner.notRunBackground = "#EEEEEE"
TestRunner.passedCountOptionName = 'txtPassedTestsCount';
TestRunner.failedCountOptionName = 'txtFailedTestsCount';
TestRunner.totalCountOptionName = 'txtTotalTestsCount';
TestRunner.testIndexCookieName = 'txtTestIndex';
TestRunner.testsStatusCookieName = 'txtTests';
TestRunner.testsStartTimeOption = 'txtTestsStartTime';
TestRunner.testExitMessageOption = 'txtTestsExitMessage';
TestRunner.noPendingTest = -2;
TestRunner.cookieSizeLimit = 4096;
TestRunner.fieldDelimiter = '/';
TestRunner.testDelimiter = '*';
TestRunner.keyMapReverse = ['index','status','startTime','runningTime','failureMessage'];

TestRunner.status = {};
TestRunner.status.notRun = '0';
TestRunner.status.passed = '1';
TestRunner.status.failed = '2';
TestRunner.status.error = '3';

TestRunner.count = function(optionName, value)
{
	if (value == null) {
		value = parseInt(config.options[optionName]) + 1;
	}
	config.options[optionName] = value;
	saveOptionCookie(optionName);
};

TestRunner.countPassed = function (value)
{
	TestRunner.count(this.passedCountOptionName, value);
};

TestRunner.countFailed = function (value)
{
	TestRunner.count(this.failedCountOptionName, value);
};

TestRunner.countTotal = function (value)
{
	TestRunner.count(this.totalCountOptionName, value);
};

TestRunner.getCount = function(optionName)
{
	return parseInt(config.options[optionName]);
};

TestRunner.getPassedTestsCount = function ()
{
	return this.getCount(this.passedCountOptionName);
};

TestRunner.getFailedTestsCount = function ()
{
	return this.getCount(this.failedCountOptionName);	
};

TestRunner.getTotalTestsCount = function ()
{
	return this.getCount(this.totalCountOptionName);	
};

TestRunner.getNextTestIndex = function ()
{
	var value = parseInt(config.options.txtTestIndex);
	if (isNaN(value)) {
		return null;
	}
	return value;
};

TestRunner.updateNextTestIndex = function(index)
{
	config.options.txtTestIndex = index;
	saveOptionCookie(this.testIndexCookieName);
};

TestRunner.removeCookies = function()
{
	removeCookie(this.passedCountOptionName);
	removeCookie(this.failedCountOptionName);
	removeCookie(this.totalCountOptionName);
	removeCookie(this.testsStatusCookieName);
	removeCookie(this.testsStartTimeOption);
	removeCookie(this.testExitMessageOption);
}

TestRunner.checkPendingTests = function() {
	var nextTestIndex = TestRunner.getNextTestIndex();
	if (nextTestIndex == null || nextTestIndex == this.noPendingTest) {
		return;
	}
	nextTestIndex++;
	var testStatus = TestRunner.getTestStatus(nextTestIndex);
	if (testStatus != null) {
		this.updateNextTestIndex(nextTestIndex);
		this.hijackSave();
		this.hijackHttpReq();
		TestRunner.run(TestRunner.registeredTests[testStatus.index],
		    testStatus, nextTestIndex);
	} else {
		httpReq = this.hijackedHttpReq;
		saveChanges = this.hijackedSave;
		this.updateNextTestIndex(-2);
		this.displayTestsResults();
		this.removeCookies();
	}
};

TestRunner.getTestName = function(index)
{
	return TestRunner.registeredTests[index].name;
}

TestRunner.getCountByStatus = function(testsStatus, status) {
	var testsInStatus = [];
	for (var i=0; i<testsStatus.length; i++) {
		if (testsStatus[i].status == status) {
			testsInStatus.push(testsStatus[i]);
		}
	};
	return testsInStatus.length;	
}

TestRunner.run = function(test, testStatus, testIndex)
{
	test.onFinish = function() {
		if (this.failure) {
			testStatus.failureMessage = this.failure;
			testStatus.status = TestRunner.status.failed;
			TestRunner.countFailed();
		} else {
			testStatus.status = TestRunner.status.passed;
			TestRunner.countPassed();
		}
		testStatus.runningTime = (new Date().getTime() - testStatus.startTime) / 1000;
		testStatus.startTime = '';
		store.setDirty(false);
		try {
			TestRunner.saveTestStatus(testStatus, testIndex);
		} catch (saveException) {
			TestRunner.abortTestRun(TestRunner.saveTestStatusErrorMessage.format(
			    [this.name, saveException.toString()]));
		}
		window.location.reload();
	};
	this.saved = false;
	try {
		this.displayTestsStatus(test, testIndex);
		testStatus.startTime = new Date().getTime();
		test.run();
	} catch (ex) {
		test.failure = ex.toString();
		test.onFinish();
	}
};

TestRunner.displayTestsStatus = function(test, testIndex) {
	displayMessage(TestRunner.statusMessage.format([testIndex + 1,
		this.getTotalTestsCount(),
		this.getFailedTestsCount(),
		this.getPassedTestsCount()]));
	displayMessage(test.name);
}

TestRunner.displayTestsResults = function() {
	var testsStatus = TestRunner.getAllTestsStatus();
	var failuresCount = TestRunner.getCountByStatus(testsStatus, TestRunner.status.failed);
	var successCount = TestRunner.getCountByStatus(testsStatus, TestRunner.status.passed);
	var testCount = testsStatus.length;
	var runTestCount = failuresCount + successCount;

	var message = TestRunner.runSummary.format([runTestCount ,failuresCount, successCount]);

	var backgroundColor;
	if (failuresCount > 0) {
		message += TestRunner.failedMessage;
		backgroundColor = TestRunner.failedBackground;
	} else if (successCount == testCount){
		message += TestRunner.allPassedMessage;
		backgroundColor = TestRunner.passedBackground
	} else if (testCount > runTestCount) {
		message += TestRunner.notRunCountMessage.format([(testCount - runTestCount)]);
		backgroundColor = TestRunner.notRunBackground;
	} else if (testCount < runTestCount) {
		message += inconsistentTestCountMessage.format([runTestCount, testCount]);
		backgroundColor = TestRunner.notRunBackground;
	}

	var startTime = TestRunner.getTestsStartTime();
	var endTime = new Date();
	var runningTime = (endTime.getTime() - startTime.getTime()) / 1000;
	message += TestRunner.testDurationMessage.format([runningTime, endTime]);

	var panel = createTiddlyElement(story.getContainer(),'div','testsResults','tiddler');
	var topCloseLink = createTiddlyElement(panel,'a','topCloseTestResults','button', 'close');
	topCloseLink.onclick = function() {
		panel.style.visibility = 'hidden';
	};
	insertSpacer(panel);

	var rerunLink = createTiddlyElement(panel,'a','rerunTests','button', 'rerun');
	rerunLink.onclick = function() {
		var testsNames = [];
		for (var i=0; i<testsStatus.length; i++) {
			testsNames.push(TestRunner.getTestName(testsStatus[i].index));
		};
		TestRunner.runTests(testsNames);
	}
	insertSpacer(panel);

	var messagePanel = createTiddlyElement(panel,'div','message','viewer', message);
	panel.style.background  = backgroundColor;
	createTiddlyElement(panel,'div','exitMessage','viewer', config.options[TestRunner.testExitMessageOption]);
	var el = createTiddlyElement(panel,'div','exitMessage','viewer');
	el.innerHTML = '<hr>';
	
	for (var i=0; i<testsStatus.length; i++) {
		var name = TestRunner.getTestName(testsStatus[i].index);
		var testsResult = createTiddlyElement(panel,'div',name+ 'Result');
		var testDescription = name;
		if (testsStatus[i].status == TestRunner.status.failed) {
			testDescription += TestRunner.testDescriptionMessage.format([testsStatus[i].runningTime]);
			testDescription += testsStatus[i].failureMessage;
			testsResult.style.background = TestRunner.failedBackground;
		} else if (testsStatus[i].status == TestRunner.status.passed) {
			testDescription += TestRunner.testDescriptionMessage.format([testsStatus[i].runningTime]);
			testsResult.style.background = TestRunner.passedBackground;
		} else if (testsStatus[i].status == TestRunner.status.notRun) {
			testDescription += TestRunner.notRunMessage;
			testsResult.style.background = TestRunner.notRunBackground;
		}
		testsResult.innerHTML = testDescription;
	};
};

TestRunner.setTestsStartTime = function(date)
{
	config.options[TestRunner.testsStartTimeOption] = date.getTime();
	saveOptionCookie(TestRunner.testsStartTimeOption);	
};

TestRunner.getTestsStartTime = function()
{
	var time  = parseInt(config.options[TestRunner.testsStartTimeOption]);
	return new Date(time);
};

TestRunner.saveTestStatus = function (testStatus, testStatusIndex)
{
	optionName = TestRunner.testsStatusCookieName;
	var items = TestRunner.getListFromCookie(optionName);
	if (testStatusIndex < 0 || testStatusIndex >= items.lenght) {
		throw 'Unable to save test status with testStatusIndex:' + testStatusIndex
	}
	items[testStatusIndex] = TestRunner.encodeItem(testStatus);
	TestRunner.saveListToCookie(optionName, items);
};

TestRunner.saveAllTestsStatus = function(testsStatusList)
{
	var items = [];
	for (var i=0; i<testsStatusList.length; i++) {
		items[i] = TestRunner.encodeItem(testsStatusList[i]);
	};
	TestRunner.saveListToCookie(TestRunner.testsStatusCookieName, items);
};

TestRunner.getTestStatus = function(testStatusIndex)
{
	if (testStatusIndex < 0) {
		return null;
	}
	var items = TestRunner.getListFromCookie(TestRunner.testsStatusCookieName);
	if (testStatusIndex >= items.length) {
		return null;
	}
	return TestRunner.parseItem(items[testStatusIndex]);
};

TestRunner.getAllTestsStatus = function()
{
	var items = TestRunner.getListFromCookie(TestRunner.testsStatusCookieName);
	var resultList = [];
	for (var i=0; i<items.length; i++) {
		resultList.push(TestRunner.parseItem(items[i]));
    };
	return resultList;
};

TestRunner.parseItem = function(encodedItem)
{
	var map = encodedItem.split(TestRunner.fieldDelimiter);
	var item = {};
	for (var j=0; j<map.length; j++) {
		var field = map[j];
		item[TestRunner.keyMapReverse[j]] = field;
	};
	return item;
};

TestRunner.encodeItem = function(item)
{
	var itemValue = '';
	for (key in item) {
		if (itemValue != '') {
			itemValue += TestRunner.fieldDelimiter;
		}
		itemValue += item[key];
	}
	return itemValue;
};

TestRunner.saveListToCookie = function (optionName, values)
{
	config.options[optionName] = '';
	for (var i=0; i<values.length; i++) {
		if (config.options[optionName] != '') {
			config.options[optionName] += TestRunner.testDelimiter;
		}
		config.options[optionName] += values[i];
	};
	if (config.options[optionName].length >= TestRunner.cookieSizeLimit) {
		throw TestRunner.cookieLimitAbortMessage;
	}else {
		saveOptionCookie(optionName);
	}
};

TestRunner.abortTestRun = function(exitMessage)
{
	TestRunner.updateNextTestIndex(TestRunner.getListFromCookie(TestRunner.testsStatusCookieName).length);
	config.options[TestRunner.testExitMessageOption] = TestRunner.testAbortedMessage + exitMessage;
	saveOptionCookie(TestRunner.testExitMessageOption);
}

TestRunner.runTests = function(testsNames)
{
	TestRunner.updateNextTestIndex(-1);
	var testsReport = [];
	for (var i=0; i<testsNames.length; i++) {
		var item = {
			index : TestRunner.registeredTests.findByField('name', testsNames[i]),
			status: TestRunner.status.notRun,
			startTime:0,
			runningTime:0,
			failureMessage:''
		}
		testsReport.push(item);
	};
	TestRunner.saveAllTestsStatus(testsReport);
	TestRunner.countPassed(0);
	TestRunner.countFailed(0);
	TestRunner.countTotal(testsReport.length);
	TestRunner.setTestsStartTime(new Date());
	window.location.reload();
	return;
};

TestRunner.getListFromCookie = function (optionName)
{
	if (!config.options[optionName]) {
		return [];
	}
	return config.options[optionName].split(TestRunner.testDelimiter);
};

TestRunner.hijackedSave = saveChanges;
TestRunner.savedTiddlers = {};

TestRunner.hijackSave = function(){
	saveChanges = function(onlyIfDirty, tiddlers){
		TestRunner.saved = true;
		for (var i = 0; tiddlers && i < tiddlers.length; i++) {
			TestRunner.savedTiddlers.push(tiddlers[i]);
		};
	};
}

TestRunner.assertTiddlyWikiSaved = function(saved)
{
	try {
		TestStep.prototype.assertEquals(saved, this.saved);
	} catch (ex) {
		throw "Assertion failed, the tiddlywiki was " + (!save ? "not" : "") + " saved";
	}
};

TestRunner.hijackedHttpReq = httpReq;
TestRunner.expectedHttpReqCalls = [];
TestRunner.hijackHttpReq = function(){
	httpReq = function(type, url, callback, params, headers, data, contentType, username, password, allowCache){
		var key = TestStep.prototype.getExpectedReqsKey(type,url,headers,data,contentType,username,password,allowCache);
		var responseText = TestRunner.expectedHttpReqCalls[key]? TestRunner.expectedHttpReqCalls[key].response : TestRunner.expectedHttpReqCalls[key];
		if (responseText != null) {
			var xhr = [];
			xhr.status = TestRunner.expectedHttpReqCalls[key].status;
			if (TestRunner.expectedHttpReqCalls[key].times > 1) {
				TestRunner.expectedHttpReqCalls[key].times = responseText.times - 1;
			} else {
				TestRunner.expectedHttpReqCalls[key] = null;
			}
			if (responseText == '') {
				params.status = false;
				callback(false, params, responseText, url, xhr);
			} else {
				params.status = true;
				callback(true, params, responseText, url, xhr);
			}
		} else {
			throw 'Unexpected httpReq call type:' + type + ' url:' + url;
		}
	};
}

function Test(steps, name) {
	if (name) {
		this.name = name;
	}
	if (!steps || steps.length == 0) {
		throw 'Attemp to create a test with no steps (test name:' + name + ')';
	}
	this.steps = steps;
};

Test.prototype.steps = [];
Test.prototype.nextIndex = -1;
Test.prototype.name = "Unnamed Test";
Test.prototype.onFinish;
Test.prototype.failure;
Test.prototype.end = function() {
	Test.currentTest = this;
	this.onFinish();
};

Test.prototype.run = function()
{
	Test.currentTest = this;
	if (this.steps.length > this.nextIndex + 1) {
		this.nextIndex++;
		var step = this.steps[this.nextIndex];
		try {
			step.run.call(step);
			window.setTimeout(function(){Test.currentTest.run();}, step.delay);
		} catch (ex) {
			this.failure = 'step:' + (this.nextIndex + 1) 
			    + ' Error:' + ex.toString();
			this.end();
		}
	} else {
		this.end();
	}
};

Test.currentTest;
Test.setAutoSave = function (autosave)
{
	config.options.chkAutoSave = autosave;
}

Test.buildTests = function (testDefinition) {
	var testSteps = [];
	for (var i=1; testDefinition['step' + i] != null; i++) {
		var step = testDefinition['step' + i];
		if (step) {
			testSteps[i - 1] = new TestStep(step, testDefinition['step' + i + 'Delay']);
		}
	};
	return new Test(testSteps, testDefinition.name);
};

Test.createTemplateFrom = function(templateDefinition, testName)
{
	var newTemplate = {};
	merge(newTemplate, templateDefinition);
	if (testName) {
		newTemplate.name = testName;
	} else {
		newTemplate.name = 'Copy from ' + templateDefinition.name;
	}
	newTemplate.template = templateDefinition;
	merge(newTemplate, TestTemplate.prototype);
	return newTemplate;
};

Test.createFromTemplateWithAutosave = function(template,lastStep, name) {
	var template = Test.createTemplateFrom(template,name);
	template.addBeforeStep(function() {Test.setAutoSave(true);}, 1);
	template['step' + lastStep] = function() {
		TestRunner.assertTiddlyWikiSaved(true);
	}
	return template;
};

function TestTemplate(){};
TestTemplate.prototype.addBeforeStep= function(func, step){
	var originalStep = this.getStep(step);
	this['step' + step] = function() {
		func.call(this);
		originalStep.call(this);
	}
};

TestTemplate.prototype.getStep = function(step) {
	if (!this['step' + step]) {
		throw 'step ' + step + ' does not exist';
	}
	return this['step' + step];
};

TestTemplate.prototype.addAfterStep= function(func, step) {
	var originalStep = this.getStep(step);
	this['step' + step] = function() {
		originalStep.call(this);
		func.call(this);
	}
};

function TestStep(func, delay) {
	if (!func) {
		throw 'TestStep created with no function to run';
	}
	this.run = func;
	if (delay) {
		this.delay = delay;
	}
};
TestStep.prototype.run;
TestStep.prototype.delay = 1;

TestStep.prototype.getElementByName = function (name)
{
	return this.ensureUnique(document.getElementsByName(name), 'name: ' + name);
};

TestStep.prototype.getElementByClass = function (name)
{
	return this.ensureUnique(this.getElementByClassNotUnique(name), 'class: ' + name);
};

TestStep.prototype.getElementByClassNotUnique = function (name)
{
	if (!document.getElementsByClassName) {
		a = document.getElementsByTagName('div');
		for (var i=0; i<a.length; i++) {
			if (a[i].className == name) {
		  		return [a[i]];
  			}
		};
		return [];
	} else {
		return document.getElementsByClassName(name);
	}
};

TestStep.prototype.getElementByClassAndType = function (name, type)
{
	var a = document.getElementsByTagName(type);
	var result = [];
	for (var i=0; i<a.length; i++) {
		if (a[i].className == name) {
	  		result.push(a[i]);
 		}
	};
	return result;
};

TestStep.prototype.ensureUnique = function (result, id)
{
	if (!result || result.length == 0) {
		throw('no element found for ' + id);
	}
	if (result.length > 1) {
		throw('more than 1 element found for ' + id);
	}
	return result[0];	
};

TestStep.prototype.assertTrue = function (value, message)
{
	if (value != true) {
		if (message) {
			throw message;
		} else {
			throw 'Assertion failed, true expected, obtained: ' + value;
		}
	}
};

TestStep.prototype.assertEquals = function (expected, obtained)
{
	if (expected != obtained) {
		throw 'Assertion failed, not equal. expected:' + expected + '- obtained:'+ obtained;
	}
};

TestStep.prototype.assertNull = function (value) {
	if (value != null) {
		throw 'Assertion failed, a null value was expected, obtained:' + value;
	}
};

TestStep.prototype.assertEmpty = function (collection) {
	if (!collection || collection.length != 0) {
		throw 'Assertion failed, collection not empty, size:' + collection.length;
	}
};

TestStep.prototype.getExpectedReqsKey = function(type,url,headers,data,contentType,username,password,allowCache) {
	return 'type:' + type + '|url:' + url + '|headers:' + headers + '|data:' + data + 
		'|contentType:' + contentType + '|username:' + username + '|password:' + password;
} 

TestStep.prototype.expectHttpReq = function(responseText,type,url,headers,data,contentType,username,password,allowCache,status) {
	var key = TestStep.prototype.getExpectedReqsKey(type,url,headers,data,contentType,username,password,allowCache);	
	var response = TestRunner.expectedHttpReqCalls[key]? TestRunner.expectedHttpReqCalls[key].response : TestRunner.expectedHttpReqCalls[key];
	if (response) {
		TestRunner.expectedHttpReqCalls[key].times = TestRunner.expectedHttpReqCalls[key].times + 1;
	} else {
		TestRunner.expectedHttpReqCalls[key] = {response:responseText,status:status,times:1};
	}
}

TestStep.prototype.expectGetReq = function(responseText,url,status,headers,data,contentType,username,password,allowCache) {
	this.expectHttpReq(responseText,'GET', url, headers, data, contentType, username, password, allowCache, status);
}

config.backstageTasks.push('tests');
merge(config.tasks,{
	tests: {text: 'tests', tooltip: 'run tests', content: '<<tests>>'}
});

config.macros.tests = {};
config.macros.tests.init = function() {
	hijackedInit = backstage.init;
	backstage.init = function() {
		TestRunner.checkPendingTests();
		backstage.init = hijackedInit;
		backstage.init();
	};
};

config.macros.tests.messages = {};
config.macros.tests.messages.title = 'Test to run';
config.macros.tests.messages.subTitle = 'Select the tests to run';
config.macros.tests.messages.content = '<input type="hidden" name="markList"></input>';
config.macros.tests.messages.run = 'run';
config.macros.tests.messages.runTooltip = 'run the selected tests';

config.macros.tests.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var listTemplate= {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
			{name: 'Test', field: 'name', title: "Test name", type: 'String'}
			],
		rowClasses: [
			]};
	var wizard = new Wizard();
	var messages = config.macros.tests.messages;
	wizard.createWizard(place,messages.title);
	wizard.addStep(messages.subTitle,messages.content);
	var markList = wizard.getElement('markList');
	var listWrapper = document.createElement('div');
	markList.parentNode.insertBefore(listWrapper,markList);
	listView = ListView.create(listWrapper,TestRunner.registeredTests,listTemplate,null,null,2);
	wizard.setValue('list', listView);
	wizard.setButtons([{caption: messages.run, tooltip: messages.runTooltip, onClick: config.macros.tests.restart}]);
};

config.macros.tests.restart = function(wizard)
{
	var wizard = new Wizard(this);
	var testsNames = ListView.getSelectedRows(wizard.getValue('list'));
	TestRunner.runTests(testsNames);
};

/*}}}*/