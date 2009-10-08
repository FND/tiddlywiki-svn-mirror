TiddlyWiki.prototype.familytree_saveTiddler = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created)
{
    
    //clean up children    
    if(newTitle &&newTitle != title){
        var tiddlers = store.getTiddlers();
        for(var i=0; i < tiddlers.length; i++){
            var tid = tiddlers[i];
            if(tid.fields.mother ==title){
                tid.fields.mother = newTitle;
            }
            if(tid.fields.father ==title){
                tid.fields.father = newTitle;
            }
            
        }
        //do spouses
    }
    this.familytree_saveTiddler(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created);

};
config.macros.familytreelist = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler){
        var param = paramString.parseParams();
    	var sex= getParam(param,"sex");
    	
    	var print ="";
    	var tiddlers = store.getTiddlers();
    	for(var i=0; i < tiddlers.length;i++){
    	    var tid = tiddlers[i];
    	    var good = false;
    	    if(tid.fields.sex && tid.fields.sex == sex){
    	        good = true;
    	    }
    	    if("excludeTree" in tiddler.tags){
    	        good = false;
    	    }
    	    if(good){
    	        print += tid.title+"\n";
    	    }
    	}
    	wikify(print,place);
    }
};
config.macros.makeRootLink = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler){
        jQuery(place).html("<a class='makeRoot' href=\"#[["+tiddler.title+"]]\" name=\""+escape(tiddler.title)+"\">make root</a>");
        jQuery(".makeRoot",place).click(function(e){
            config.activeTree.compute(unescape(jQuery(this).attr("name")));
        })
    }
    
};
config.macros.listchildren ={
  handler: function(place, macroName, params, wikifier, paramString, tiddler){
    var parent = tiddler.title;
    var children = [];
    var t= store.getTiddlers();
    for(var i=0; i < t.length; i++){
       var person = t[i];
       if(person.fields.father == parent){children.push(person);}
       else if(person.fields.mother == parent){children.push(person);}
    }

    if(children.length ==0){
      var div = document.createElement("div");
      div.innerHTML = "No children.";
      place.appendChild(div);
    }
    else{
    var ul = document.createElement("ul");
    place.appendChild(ul);
    for(var i=0; i < children.length; i++){
       var child = document.createElement("a");
       child.className="child";
       var name =children[i].title;
       child.innerHTML = name;
       child.title = name;
       var li = document.createElement("li");
       li.appendChild(child);
       ul.appendChild(li);
       
       jQuery(child).click(function(e){story.displayTiddler(e,this.title);});
    }
    }
  }

};
config.macros.tiddlerGender ={
  handler: function(place, macroName, params, wikifier, paramString, tiddler){
      var jqplace = jQuery(place);
      if(tiddler.fields["sex"] == 'M'){
          jqplace.addClass("sexMale");
      }
      else if(tiddler.fields["sex"] == 'F'){
          jqplace.addClass("sexFemale");
      }
      
  }

};

config.macros.ftview = {
    handler: function(place, macroName, params, wikifier, paramString, tiddler){
        var field = params[0];
        if(!tiddler.fields[field]) return;
        if(field == 'spouse'){
            var sp = tiddler.fields["spouse"].split(",");
            var str = "";
            for(var i=0; i < sp.length;i++){
                str += "[["+sp[i] + "]]";
                if(i < sp.length) str += " and ";
            }
            wikify(str,place);
        }

    }
    
};

config.commands.addMother = {
        text: "Add Mother",
        tooltip: "add a mother",
        
        handler:function(event,src,title){
                var motherName = prompt("Who is their mother?");
                if(motherName){
                        var tiddler = store.getTiddler(title);
                        tiddler.fields.mother = motherName;
                        if(!store.getTiddler(motherName))story.displayTiddler(null,motherName,DEFAULT_EDIT_TEMPLATE);        
                }
             
        }
};
config.commands.addSpouse = {
        text: "Add Spouse",
        tooltip: "add a spouse",
        
        handler:function(event,src,title){
                var spouse = prompt("What is the name of the spouse?");
                if(spouse){
                        var tiddler = store.getTiddler(title);
                        tiddler.fields.spouse = spouse;
                        
                        
                        var tiddler = store.getTiddler(spouse);
                        if(tiddler){
                                 tiddler.fields.spouse = title;
                                 store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
                               
                        }
                        else{
                                store.saveTiddler(spouse,spouse,"","",new Date(),[],{spouse: title},true,new Date());
		                story.displayTiddler(null,spouse,DEFAULT_EDIT_TEMPLATE);
		        }
		        
                }
             
        }
};

config.commands.addChild = {
        text: "Add Child",
        tooltip: "add a child",
        
        handler: function(event,src,title){
                
                var parent = store.getTiddler(title);
                var sex = false;
                var spouse = "";
                if(parent && parent.fields.spouse)spouse = parent.fields.spouse;
                if(!parent) {
                        //try and work out the sex..
                        var tiddlers = store.getTiddlers();
                        
                        for(var i=0; i < tiddlers.length; i++){
                                if(!sex && tiddlers[i].fields.mother == title) sex = "F";
                                if(!sex && tiddlers[i].fields.father == title) sex = "M";
                        }
                }
                else{
                        if(parent.fields.sex) sex =parent.fields.sex;
                }
                if(sex){

                        var childName = prompt("What is the name of the child?");
                        if(childName){
                                

                                
                               
                               var tiddler = store.getTiddler(childName);
                               if(!tiddler){
                                       
                                       var fields = {};
                                       if(sex == "F") {
                                               fields.mother = title;
                                                fields.father = spouse;
                                       }
                                       else if(sex == "M") {
                                               fields.father = title;
                                                fields.mother = spouse;
                                        }
                                       store.saveTiddler(childName,childName,"",false,new Date(),[],fields,true,new Date());
                                       //childName,childName,"",false,false,[],fields,true,new Date());
                                    
                                }
                                else{
                                        
                                                                    if(sex == "F") {
                                                                               tiddler.fields.mother = title;
                                                                                tiddler.fields.father = spouse;
                                                                       }
                                                                       else if(sex == "M") {
                                                                               tiddler.fields.father = title;
                                                                                tiddler.fields.mother = spouse;
                                                                        }
                                }
   
                        }
           
                       if(childName) story.displayTiddler(null,childName,DEFAULT_EDIT_TEMPLATE);
                }
                else{
                        alert("I can't do this until I know the sex of this person..");
                }
                
        }
};
config.commands.addFather = {
        text: "Add Father",
        tooltip: "add a father",
        
        handler: function(event,src,title){
                var fatherName = prompt("Who is their father?");
                if(fatherName){
                        var tiddler = store.getTiddler(title);
                        tiddler.fields.father = fatherName;
                        if(!store.getTiddler(fatherName))story.displayTiddler(null,fatherName,DEFAULT_EDIT_TEMPLATE);        
                }
        }
};
