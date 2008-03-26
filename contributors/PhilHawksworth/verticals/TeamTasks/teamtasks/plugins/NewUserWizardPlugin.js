/***
|''Name:''|NewUserWizardPlugin|
|''Description:''|Create a new user for the TeamTasks system |
|''Version:''|0.1|
|''Date:''|22 Oct, 2007|
|''Source:''|http://www.hawksworx.com/playground/TeamTasks/#NewUserWizardPlugin|
|''Author:''|PhilHawksworth (phawksworth (at) gmail (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.2|
***/

//{{{
// Ensure that this Plugin is only installed once.
if(!version.extensions.newUserWizard) 
{
	version.extensions.newUserWizard = {installed:true};
	config.macros.newUserWizard = {
	
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			createTiddlyButton(place, 'Create user', false, this.onClickNewUser);
		},
		
		onClickNewUser : function(e) {
			
			//get data from the form
			var form = document.getElementById('createTeamTaskUserForm');
			var inputs = form.getElementsByTagName('input');
			var userData = [];
			var mandatoryFields = [];
			var f;
			for (var i=0; i < inputs.length; i++) {
				f = inputs[i];
				if(f.getAttribute('mandatory') && f.getAttribute('mandatory') =='true') mandatoryFields.push(f);
				if(f.value.length > 0) userData[f.name] = f.value;
			};
			
			// stop if we are missing anything mandatory
			var missingValues = false;
 			missingValues = config.macros.newUserWizard.checkMandatory(mandatoryFields);
			if(missingValues) return false;
		
			//build a properly formatted username
			userData['fname'] = userData['fname'].toLowerCase().substring(0,1).toUpperCase() + userData['fname'].substring(1);
			userData['lname'] = userData['lname'].toLowerCase().substring(0,1).toUpperCase() + userData['lname'].substring(1);
			userData['username'] = userData['fname'] + userData['lname'];
			
			//Check for dupes
			var existingTiddler = store.getTiddler(userData['username']);
			if(existingTiddler != null) {
				displayMessage('A user called '+ userData['username'] +' already exists');
				return false;
			}
			
			//add user to UserDefinitions
			var body = store.getTiddlerText('UserDefinitions') + '\n' + userData['username'];
			store.saveTiddler('UserDefinitions','UserDefinitions',body,config.options.txtUserName);
			
			//TODO: Replace the vCard creation from HTML insertion to nice TW DOM methods.
			//create a tiddler for the user with an hCard for the contact details.
			var homeTiddlerBody = [];
			homeTiddlerBody.push('<html>');
			homeTiddlerBody.push('<div class="vcard">');
			homeTiddlerBody.push('<a class="url fn n" href="'+ userData['blog'] +'"><span class="given-name">'+ userData['fname'] +'</span><span class="family-name">'+ userData['lname'] +'</span></a>');
			if(userData['company'])homeTiddlerBody.push('<div class="org"><span class="organization-name">'+ userData['company']  +'</span></div>');
			if(userData['email'])homeTiddlerBody.push('<div class="email"><span><a href="mailto:'+ userData['email']  +'">'+ userData['email']  +'</a></span></div>');
			if(userData['blog'])homeTiddlerBody.push('<div class="blog"><span><a href="'+ userData['blog']  +'">'+ userData['blog']  +'</a></span></div>');
			if(userData['photos'])homeTiddlerBody.push('<div class="photos"><span><a href="'+ userData['photos']  +'">'+ userData['photos']  +'</a></span></div>');
			if(userData['twitter'])homeTiddlerBody.push('<div class="twitter"><span><a href="'+ userData['twitter']  +'">'+ userData['twitter']  +'</a></span></div>');
			homeTiddlerBody.push('</div></html>');
			
			//Create some simple TaskListViews.
			//Task list index template.
			var body;
			body = store.getTiddlerText('SampleTaskListTemplate');
			homeTiddlerBody.push(body.replace(/UserName/g,userData['username']));
			
			store.saveTiddler(userData['username'],userData['username'],homeTiddlerBody.join('\n'),config.options.txtUserName);
			
			//TODO: automate the generation of these views from some templates and the index
			//create the task views
			var body_array = [];
			body_array.push('<<TaskViewBuilder UserDefinitions='+ userData['username'] +' PriorityDefinitions='+ userData['username'] +' !StatusDefinitions=Complete>>');
			store.saveTiddler(userData['username'] +'OpenTasks', userData['username'] +'OpenTasks',body_array.join('\n'),config.options.txtUserName);
			body = '<<TaskViewBuilder UserDefinitions='+ userData['username'] +' StatusDefinitions=InProgress>>';
			store.saveTiddler(userData['username'] +'InProgressTasks', userData['username'] +'InProgressTasks',body,config.options.txtUserName);
			body = '<<TaskViewBuilder UserDefinitions='+ userData['username'] +' StatusDefinitions=Next>>';
			store.saveTiddler(userData['username'] +'NextTasks', userData['username'] +'NextTasks',body,config.options.txtUserName);
			body = '<<TaskViewBuilder UserDefinitions='+ userData['username'] +' StatusDefinitions=Complete>>';
			store.saveTiddler(userData['username'] +'CompletedTasks', userData['username'] +'CompletedTasks',body,config.options.txtUserName);
			
			//open the new user tiddler
			story.displayTiddlers(this,[userData['username']]);
		},
		
		checkMandatory : function(things) {
			var flag = false;
			var v = "";
			var ele;
			for (var i=0; i < things.length; i++) {
				if(typeof(things[i])=='string') {
					ele = document.getElementById(things[i]);
				}
				else if(typeof(things[i]) == 'object') {
					ele = things[i];
				}
				else return false;
				v = ele.value;
				removeClass(ele, 'flaggedMandatory');
				if(v.length == 0){
					addClass(ele, 'flaggedMandatory');
					flag = true;
				}	
			};
			if(flag == true) return true;
			else return false;
		}
	};
}
//}}}