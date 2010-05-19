/***
|''Name:''|Confernece|
|''Description:''|In-tiddler conferencing app powered by Ribbit, to be used with verticals like TeamTasks to improve collaboration. Requires a Ribbit for Mobile account. CAUTION calls are charged per leg (caller) on the conference bridge, this can get expensive!|
|''Author:''|BenJam|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenJam/plugins/Conference/RibbitConference.js |
|''Version:''|0.1|
|''Date:''|May 20th 2010|
|''Comments:''|Please comment at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.3|

TODO
Poll the status of the call
Window-dressing
Learn Japanese

TOFIX
Can hangup the call on click

TOTHINK 
Running more than one conference in each TW, perhaps create a conference object with details inside?
Keeping a record of conferenced Tiddlers
Linking a hCard implementation to select collaborators from a dorp down meunu
Putting hCard into TeamTasks and doing above

Usage:
{{{
<<Conference>>

***/
//{{{

(function($) {
    
    var log = console.log;
	var conference = false;
	var callId = null;
	var legs = [];

    config.macros.Conference = {

        handler: function(place, macroName, params, wikifier, paramString, tiddler){

            var mParams = paramString.parseParams();
			init(place,mParams);
		}        
	};
	
	function init(place, mParams){
		
		conference = createTiddlyElement(place, "div", null, "conference", "");
		createTiddlyButton(conference, "Start Conference", null, function(){
			$('.conference').remove();
			var aConference = createTiddlyElement(place, "div", null, "conference", "Add Participants:");
			build(aConference,mParams);
			});		
	}
	
	function build(place, mParams){
		var f = createTiddlyElement(place, 'form', null);
		var t = createTiddlyElement(f,'ul',null);
		for(var i= 0; i<2; i++){
			var l = createTiddlyElement(t,'li',null);
			createTiddlyElement(l,'span',null,null,"Participant:");
			var input = createTiddlyElement(l,'input',null);
			input.setAttribute('name', "participant");
		}
		var add = createTiddlyButton(f,'Add', null, function(){
			var l = createTiddlyElement(t,'li',null);
			createTiddlyElement(l,'span',null,null,"Participant:");
			var input = createTiddlyElement(l,'input',null);
			input.setAttribute('name', "participant");
		});
		
		var start = createTiddlyButton(f,'Start', null,function(){
			var legs = f.getElementsByTagName('input');
			conferenceStart(legs, place.parentNode, mParams);
		});
	}
	
	// function addParticipant(place,macroParams){
	// 	var f = createTIdlyElement(place, "form", null);
	// 	createTiddlyElement(f,'span',null,null,"Add participant:")
	// 	var input = createTiddlyElement(f,'input',null);
	// 	input.setAttribute('name', "participant");
	// 	var add = craeteTiddlyButton(f,'Add',null,function(){
	// 		var leg = f.getElementsByTagName('input');
	// 		niceLeg = formatLegs(leg);
	// 		addLeg(niceLeg); //TODO carry a callId here for multiple conferences on one page
	// 	});
	// } 
	
	function formatLegs(legs){
		//TODO format an array of numbers into a properly formatted ribbit-ish string
		var niceLegs=[];
		for (var i=0; i<legs.length;i++){
			niceLegs[i] = "tel:"+legs[i].value;
		}
		alert(niceLegs);
		return niceLegs
	}
	
	function conferenceStart(legs, place, mParams){
		if(navigator.onLine==false){
			alert("Sorry you must be online to start a conference");
			return
		}
		if(!Ribbit.userId){
			story.displayTiddler(place,"Ribbit");
			return
		}
		var legStr = formatLegs(legs);
		var callId = Ribbit.Calls().createCall(callback, legStr);
		
		//call success
		if(conference){
			$('.conference').remove();
			var d = createTiddlyElement(place, "div", null, "conference", "Conference in progress ");
			createTiddlyButton(d,"End",null,function(){
				alert("Clicked end");
				Ribbit.Calls().hangupCall(function(result){
					if(result.hasError){
						alert("Bah! Couldn't hang up the call");
					}
				},callId);
				callId=null;
				endConference(place, mParams);
			});
			pollState(callId)
		}
	}
	
	function callback(result){
		if(result.hasError){
			alert("Bah! "+result.errorMessage);
			return null
		}
		alert(result);
		conference = true;
		return result
	}
	
	function endConference(place, mParams){
		alert("Ending conference");
		var t = place.parentNode;
		$('.conference').remove();
		init(t, mParams);
	}
	
	function pollState(result){
		setTimeout(function(){
			return
		},5000)//TODO poll the state of the conference (on/off, no. participants etc)
		
	}
	
	function addLeg(tel){
		//TODO add a leg to the existing conference
	}
	
})(jQuery);

//}}}