
/***

An under construction replacement for toggleTag

<<tTag mode:text text:D tag:Done>>
<<tTag mode:text text:N tag:Next>>
***/
//{{{

merge(config.macros,{

	tTag: {

		createIfRequired: true,
		shortLabel: "[[%0]]",
		longLabel: "[[%0]] [[%1]]",

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var parsedParams = paramString.parseParams("tags",null,true);
			
			if (!tiddler)
				tiddler = store.getTiddler(getParam(parsedParams,"title"));
			
			var tag = getParam(parsedParams,"tag","checked");
			var title = getParam(parsedParams,"title",tiddler.title);

			var refreshAll = getParam(parsedParams,"refreshAll",false);

			var defaultLabel = (title == tiddler.title ? this.shortLabel : this.longLabel);
			var label = getParam(parsedParams,"label",defaultLabel);

			var theTiddler =  title == tiddler.title ? tiddler : store.getTiddler(title);

			var mode = getParam(parsedParams,"mode","checkbox");

			var theClass = getParam(parsedParams,"class",tag+"Button");


			var currentValue = theTiddler && 
				(macroName == "tTag" ? theTiddler.isTagged(tag) : store.getValue(theTiddler,tag)=="true");

			if (mode == "checkbox") {
				// create the checkbox

				var cb = createTiddlyCheckbox(place, label.format([tag,title]), currentValue, function(e) {
					if (!store.tiddlerExists(title)) {
						if (config.macros.tTag.createIfRequired) {
							var content = store.getTiddlerText(title); // just in case it's a shadow
							store.saveTiddler(title,title,content?content:"",config.options.txtUserName,new Date(),null);
						}
						else 
							return false;
					}
					//store.suspendNotifications(); 
					if (macroName == "tTag")
						store.setTiddlerTag(title,this.checked,tag);
					else // it must be tField
						store.setValue(title,tag,this.checked?"true":null);

					if (refreshAll) {
						 story.forEachTiddler(function(title,element) {
						   if (element.getAttribute("dirty") != "true") 
						     story.refreshTiddler(title,false,true);
						 });
					}

					//store.resumeNotifications();
					return true;
				});
			}
			else if (mode == "text") {
				var text = getParam(parsedParams,"text","X");

				var cl = createTiddlyButton(place, text, "Toggle "+text, function(e) {
					if(!e) var e = window.event;

					if (!store.tiddlerExists(title)) {
						if (config.macros.tTag.createIfRequired) {
							var content = store.getTiddlerText(title); // just in case it's a shadow
							store.saveTiddler(title,title,content?content:"",config.options.txtUserName,new Date(),null);
						}
						else 
							return false;
					}
					//store.suspendNotifications(); 
					var currentState = this.getAttribute("state")=="true";
					var newState = !currentState;

					store.setTiddlerTag(title,newState,tag);
					if (macroName == "tTag")
						store.setTiddlerTag(title,newState,tag);
					else // it must be tField
						store.setValue(title,tag,newState?"true":null);

					// this is terrible please refactor
					if (currentState) {
						cl.setAttribute("state","false");
						removeClass(cl,"on");
						addClass(cl,"off");
					}
					else {
						cl.setAttribute("state","true");
						removeClass(cl,"off");
						addClass(cl,"on");
					}

					//refreshDisplay(); 
					if (refreshAll) {
						 story.forEachTiddler(function(title,element) {
						   if (element.getAttribute("dirty") != "true") 
						     story.refreshTiddler(title,false,true);
						 });
					}
					//store.resumeNotifications();

					e.cancelBubble = true;
					if(e.stopPropagation) e.stopPropagation();

					return false;
				});

				addClass(cl,theClass.replace(/ /g,''));

				if (currentValue) {
					cl.setAttribute("state","true");
					removeClass(cl,"off");
					addClass(cl,"on");
				}
				else {
					cl.setAttribute("state","false");
					removeClass(cl,"on");
					addClass(cl,"off");
				}
				
			}
			else if (mode == "popup") {
				var cl = createTiddlyButton(place, "zzz", "Toggle "+text, function(e) {
					// props to Saq
					if(!e) var e = window.event;
					var popup = Popup.create(this);
					createTiddlyButton(createTiddlyElement(popup,"li"),"foo","bar",function(e) {
						// under contruction
						alert(this.getAttribute("tag"));
					});
					Popup.show(popup,false);
					e.cancelBubble = true;
					if(e.stopPropagation) e.stopPropagation();
					return false ;
				});
			}

		}
	}

});

config.macros.tField = config.macros.tTag;

setStylesheet(["",
".button.off {border-style:none;background:#fff;color:#ccc;}",
".button.on {border-style:none;background:#ddd;color:#000;}",
// TODO move this css elsewhere
"#realmSelector .button.off {margin:0 0.5em;padding:0 1em;border:2px solid #aaa;background:#eee;color:#333;}", // actually reversed, ie off is "on"
"#realmSelector .button.on {margin:0 0.5em;padding:0 1em;border:2px solid #999;background:#999;color:#ccc;}", // actually reversed, ie off is "on"
""].join("\n"),"tTag");

//}}}




