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
			var fn = document.getElementById('newUserFname');
			var ln = document.getElementById('newUserLname');
			
			// stop if we are missing anything mandatory
			var missingValues = false;
 			missingValues = config.macros.newUserWizard.checkMandatory([fn,ln]);
			if(missingValues) return false;
		
			//build a properly formatted username
			var f = fn.value.toLowerCase().substring(0,1).toUpperCase() + fn.value.substring(1);
			var l = ln.value.toLowerCase().substring(0,1).toUpperCase() + ln.value.substring(1);
			var user = f + l;
			
			//Check for dupes
			var existingTiddler = store.getTiddler(user);
			if(existingTiddler != null) {
				displayMessage('A user called '+ user +' already exists');
				return false;
			}
			
			//add user to UserDefinitions
			var body = store.getTiddlerText('UserDefinitions') + '\n' + user;
			store.saveTiddler('UserDefinitions','UserDefinitions',body,config.options.txtUserName);
			
			//create a tiddler for the user
			var tag = "people";
			//make an hCard for the contact details
			var body = '<html><div class="vcard"><a class="url fn n" href="http://tantek.com/"><span class="given-name">'+ f +'</span><span class="family-name">'+ l +'</span></a><div class="org"><span class="organization-name">Osmosoft</span></div></div></html>\n';
			store.saveTiddler(user,user,body,config.options.txtUserName);
			
			//open the new user tiddler
			story.displayTiddlers(this,[user]);
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