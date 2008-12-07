config.extensions.discussionsTab = {
	
	disableEditTemplates : ["DiscussionTabTemplate","EditTemplate","DiscussionTopicTemplate"],
	
	getTopicsForTiddler : function(tiddler){
		if(tiddler instanceof Tiddler)
			tiddler = tiddler.title;
		var allTopics = store.getTaggedTiddlers("topic","modified");
		var topics = [];
		for (var f=0; f<allTopics.length; f++){
				if(allTopics[f].fields["discussions.parenttiddler"] == tiddler)
						topics.push(allTopics[f]);
		}
		return topics.reverse();
	},
	
	getMessagesForTopic : function(tiddler,topic){
		if(tiddler instanceof Tiddler)
			tiddler = tiddler.title;		
		var allMessages = store.getTaggedTiddlers("message","modified");
		var messages = [];
		for (var f=0; f<allMessages.length; f++){
			if(allMessages[f].fields["discussions.parenttiddler"] == tiddler)
				if(allMessages[f].fields["discussions.topictiddler"] == topic)
					messages.push(allMessages[f]);
		}
		return messages;
	}
	
}

config.commands.discussion = {
		text : "discussion",
		
		tooltip: "view the discussion items for this page",
		
		template : "DiscussionTabTemplate",
		
		handler : function(event,src,title){
				story.refreshTiddler(title,this.template,true);
				return false;
		},
		
		hideShadow : true,
		
		isEnabled : function(tiddler){
				return !(!store.getTiddler(tiddler.title)||tiddler.tags.containsAny(["excludeLists"]));
		}
}

config.commands.page = {
		text : "page",
		
		tooltip: "view the content for this page",
		
		template : "ViewTemplate",
		
		handler : function(event,src,title){
				story.refreshTiddler(title,this.template,true);
				return false;
		},
		
		hideShadow : true,
		
		isEnabled : function(tiddler){
				return !(!store.getTiddler(tiddler.title)||tiddler.tags.containsAny(["excludeLists"]));
		}
		
}

config.commands.editTiddler.isEnabled = function (tiddler){
		var t = story.getTiddler(tiddler.title);
		var template = t.getAttribute("template");
		return !config.extensions.discussionsTab.disableEditTemplates.contains(template);
}

config.shadowTiddlers.DiscussionTabTemplate = store.getTiddlerText("ViewTemplate")
											.replace("view text wikified","discussionTab")
											.replace("+editTiddler","editTiddler")
											.replace("class='toolbar'","class='toolbar discussionTabTemplate'");;

config.macros.discussionTab = {
			
	onClickTopic : function(e,topicvar){
		if (topicvar)
			var topic = topicvar;
		else
			var topic = this.getAttribute("topic");	
		var tiddlerDiv = story.getTiddler(store.getTiddler(topic).fields["discussions.parenttiddler"]);
		tiddlerDiv.setAttribute("topic",topic);
		title = tiddlerDiv.getAttribute("tiddler");
		story.refreshTiddler(title,"DiscussionTopicTemplate",true);
		return false;
	},
	
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		var topics = config.extensions.discussionsTab.getTopicsForTiddler(tiddler);
		var ul = createTiddlyElement(createTiddlyElement(place,"div",null,"discussionsTopicListContainer"),"UL",null,"discussionsTopicList");
		createTiddlyElement(ul,"li",null,"listTitle","Discussion Topics")
		for(var f=0; f<topics.length; f++){
				//use List view
				var btn = createTiddlyButton(createTiddlyElement(ul,"li"),topics[f].fields["discussions.subject"],topics[f].fields["discussions.subject"],config.macros.discussionTab.onClickTopic,"tiddlyLink"); // cannot use server.subject. Newly created topic wont have that field. Use discussions.topic.subject or similar
				btn.setAttribute("topic",topics[f].title);
				//createTiddlyElement(place,"br");
		}
		createTiddlyElement(place,"h1",null,"discussionsh1","Post Message");
		wikify("<<_discussionsPost>>",place,null,tiddler);
	}
}

config.shadowTiddlers.DiscussionTopicTemplate = store.getTiddlerText("ViewTemplate")
												.replace("view text wikified","showThread")
												.replace("+editTiddler","editTiddler")
												.replace("class='toolbar'","class='toolbar discussionTopicTemplate'");

config.macros.showThread = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		var tiddlerDiv = story.getTiddler(tiddler.title);
		var topic = tiddlerDiv.getAttribute("topic");
		var messages = config.extensions.discussionsTab.getMessagesForTopic(tiddler,topic);
		this.renderMessages(place,messages,topic,tiddler);	
	},
	
	renderMessages : function(place,messages,topic,tiddler){
		messages.unshift(store.getTiddler(topic));
		var container = createTiddlyElement(place,"div",null,"discussionsThreadContainer");
		createTiddlyElement(container,"h1",null,"discussionsThreadH1",messages[0].fields["discussions.subject"]);
		for (var f=0; f<messages.length; f++){
			var reply = createTiddlyElement(container,"div",null,"discussionsMessageContainer");
			createTiddlyElement(reply,"div",null,"discussionsMessageTitle",messages[f].fields["discussions.subject"]);
			wikify(messages[f].text,createTiddlyElement(reply,"div"));
			createTiddlyElement(reply,"div",null,"discussionsMessagePosted","Posted: "+messages[f].modified.formatString("MMM DD, YYYY 0hh:0mm am"));
			createTiddlyElement(reply,"hr",null,"discussionsMessageDivider");
		}
		createTiddlyElement(place,"h1",null,"discussionsh1","Reply");
		wikify("<<_discussionsPost reply>>",place,null,tiddler);
	}
}

config.macros._discussionsPost = {   // template and innerHTML?
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		var reply = (params[0] && params[0] == 'reply')? true : false;
		var container = createTiddlyElement(place,"div",null,"discussionsPostContainer");
		var subjectText = createTiddlyElement(container,"div",null,"discussionsSubjectText","Subject:");
		var subjectInput = createTiddlyElement(container,"input",null,"discussionsSubjectInput");
		var messageText = createTiddlyElement(container,"div",null,"discussionsMessageText","Message");
		var message = createTiddlyElement(container,"textarea",null,"discussionsMessageArea",null,{"cols":70,"rows":15});
		createTiddlyElement(container,"br");
		createTiddlyElement(container,"br");
		var post = createTiddlyButton(container,"Post",null,"discussionsPostButton");
		post.onclick = function(){
			config.macros._discussionsPost.createMessage(subjectInput.value,message.value,tiddler.title,reply);
			return false;
		}
		createTiddlyElement(container,"br");
	},
	
	createMessage : function(subject, message, parentTiddler, reply){
		var prefix = reply? "_message:" : "_topic:";
		var title = prefix + subject + " parent:" + parentTiddler +  " created:" + (new Date()).convertToYYYYMMDDHHMMSSMMM();
		var tag = reply? "message" : "topic";
		var fields = {"discussions.parenttiddler":parentTiddler, "discussions.subject":subject};
		if(reply)
			fields["discussions.topictiddler"] = story.getTiddler(parentTiddler).getAttribute("topic");
		store.saveTiddler(title,title,message,null,null,tag,merge(fields,config.defaultCustomFields));
		if (!reply)
			config.macros.discussionTab.showTopic(null,title);
		else
			story.refreshTiddler(parentTiddler,"DiscussionTopicTemplate",true);
	}
}

setStylesheet(".discussionsTopicListContainer {\n"+
 "	padding:0.1em;\n"+
 "}\n"+
 "\n"+
 ".discussionsTopicList {\n"+
 "	padding:0.5em;\n"+
 "	background:#eee;\n"+
 "	border:1px solid #ccc;\n"+
 "}\n"+
 ".discussionsTopicList .listTitle  {\n"+
 "	font-weight:bold;\n"+
 "	margin-left:-1em;\n"+
 "}\n"+
 "\n"+
 ".discussionsPostContainer {\n"+
 "	background:#eee;\n"+
 "	border:1px solid #ccc;\n"+
 "	padding:0 0.5em 1em;\n"+
 "}\n"+
 "\n"+
 ".discussionsPostContainer .button {\n"+
 "	padding:0.2em 0.5em;\n"+
 "	font-weight:bold;\n"+
 "	background:#eee;\n"+
 "	border:1px solid #ccc;\n"+
 "	color:#000;\n"+
 "	margin: 0.4em 0;\n"+
 "}\n"+
 "\n"+
 ".discussionsMessageTitle{\n"+
 "	font-weight:bold;\n"+
 "}\n"+
 "\n"+
 ".discussionsMessagePosted{\n"+
 "	font-size: 80%;\n"+
 "	color: #bbb;\n"+
 "}\n"+
 "\n"+
 ".discussionsMessageContainer{\n"+
 "	padding:0.5em 0.5em 0.8em;\n"+
 "}\n"+
 "\n"+
 "\n"+
 ".discussionsMessageDivider{\n"+
 "\n"+
 "}","DiscussionsTabPluginStyles");
