//{{{
	
//TODO lots

//TOFIX none

//TOTHINK running more than one conference in each TW, perhaps create a conference object with details inside.
(function($) {
    
    var log = console.log;
	var conference = false;
	var callId = null;
	var legs = [];

    config.macros.Conference = {

        handler: function(place, macroName, params, wikifier, paramString, tiddler){

            var mParams = paramString.parseParams();
			ui(place,mParams);
		}        
	};
	
	function ui(place, mParams){
		
		conference = createTiddlyElement(place, "div", null, "conference", "");
		createTiddlyButton(conference, "Start Conference", null, function(){
			$('.conference').remove();
			var aConference = createTiddlyElement(place, "div", null, "conference", "Add Participants:");
			build(aConference,mParams);
			});		
	}
	
	function build(place, mParams){
		var f = createTiddlyElement(place, "form", null);
		for(var i= 0; i<2; i++){
			createTiddlyElement(f,'span',null,null,"Participant:");
			var input = createTiddlyElement(f,'input',null);
			input.setAttribute('name', "Participant ");
		}
		var start = createTiddlyButton(f,'Start', null,function(){
			var legs = f.getElementsByTagName('input');
			conferenceStart(legs, place, mParams);
		});
	}
	
	function addParticipant(container,macrParams){
		
	} 
	
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
		var result = Ribbit.Calls().createCall(callback, legStr);
		
		//call success
		if(conference){
			$('.conference').remove();
			inProgressUI(place, mParams);
		}
	}
	
	function inProgressUI(place, mPrams){
		theConference = createTiddlyElement(place, "div", null, "conference", "Confernece in progress...");
	}
	
	function callback(result){
		if(result.hasError){
			alert("Bah! "+result.errorMessage);
			return
		}
		conference = true;
		return result
	}
	
	function conferenceEnd(){
		//TODO close down the conference
	}
	
	function pollState(result){
		//TODO poll the state of the conference (on/off, no. participants etc)
		
	}
	
	function addLeg(tel){
		//TODO add a leg to the existing conference
	}
	
})(jQuery);

//}}}