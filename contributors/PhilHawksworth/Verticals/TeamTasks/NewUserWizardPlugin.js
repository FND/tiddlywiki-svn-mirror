/***
|''Name:''|newUserWizardPlugin|
|''Description:''|Create a new user for the TeamTasks system |
|''Version:''|0.0.1|
|''Date:''|22 Oct, 2007|
|''Source:''|http://www.hawksworx.com/playground/TeamTasks/#newUserWizardPlugin|
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
			var body = [];
			body.push('<html>');
			body.push('<div class="vcard">');
			body.push('<a class="url fn n" href="'+ userData['blog'] +'"><span class="given-name">'+ userData['fname'] +'</span><span class="family-name">'+ userData['lname'] +'</span></a>');
			if(userData['company'])body.push('<div class="org"><span class="organization-name">'+ userData['company']  +'</span></div>');
			if(userData['email'])body.push('<div class="email"><span><a href="mailto:'+ userData['email']  +'">'+ userData['email']  +'</a></span></div>');
			if(userData['blog'])body.push('<div class="blog"><span><a href="'+ userData['blog']  +'">'+ userData['blog']  +'</a></span></div>');
			if(userData['photos'])body.push('<div class="photos"><span><a href="'+ userData['photos']  +'">'+ userData['photos']  +'</a></span></div>');
			if(userData['twitter'])body.push('<div class="twitter"><span><a href="'+ userData['twitter']  +'">'+ userData['twitter']  +'</a></span></div>');
			body.push('</div></html>\n');
			store.saveTiddler(userData['username'],userData['username'],body.join('\n'),config.options.txtUserName);
			
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