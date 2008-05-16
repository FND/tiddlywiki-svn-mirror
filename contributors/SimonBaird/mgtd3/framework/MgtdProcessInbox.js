merge(config.macros,{
	processInbox: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var shortHand = {
				'W': 'Waiting For',
				'N': 'Next',
				'F': 'Future',
				'S': 'Starred'
			};

			wikify("Quick add projects and actions (See [[About Quick Add]] for more info):\n",place);
			var pi = createTiddlyElement(place,"textarea",null,"piBox");
			
			wikify("\n",place);

			var a1 = createTiddlyCheckbox(place,"Open created projects",true,null);
			a1.id = 'piShowProjects';

			var a2 = createTiddlyCheckbox(place,"Open created actions",true,null);
			a2.id = 'piShowActions';

			wikify("\n",place);

			var btn = createTiddlyButton(place,"quick add now","create these items",function(e) {
				var lines = pi.value.split("\n");
				var currentProject = "";
				var displayThese = [];

				for (var i=0;i<lines.length;i++) {
					//alert(lines[i]);
					var fields = lines[i].split(/[|;]/);

					if (!fields[0] || fields[0].trim() == "") {
						currentProject = "";
					}
					else {

						var title = fields.shift();
						//alert(title);

						// add the realm
						fields.push(config.macros.mgtdList.getRealm());

						if (title[0] != '.') {
							//alert("project "+title);
							currentProject = title;

							if (document.getElementById('piShowProjects').checked)
								displayThese.push(title);

							fields.push("Project"); // make it a project
							fields.push("Active"); // make it active
							if (store.tiddlerExists(title))
								alert("Warning: '"+title+"' already exists, did not create");
							else
								store.saveTiddler(
									title,title,
									"", // content
									config.options.txtUserName,
									new Date(),
									fields, // tags
									null // extra fields
								);
						}
						else {

							// default to next actions
							if (!fields.containsAny(['N','F','W']))
								fields.push('N');

							fields = fields.map(function(f) {
								if (shortHand[f] && shortHand[f] != '')
									return shortHand[f];
								else
									return f;
							});

							//alert("action "+title);
							title = title.trim();
							title = title.replace(/^\.+/,'');

							if (document.getElementById('piShowActions').checked)
								displayThese.push(title);

							fields.push("GTD"); // make it a GTD item
							fields.push("Action"); // make it an action 
							if (currentProject.trim() != "")
								fields.push(currentProject); // make it in this project

							if (store.tiddlerExists(title))
								alert("Warning: '"+title+" already exists, did not create");
							else
								store.saveTiddler(
									title,title,
									"", // content
									config.options.txtUserName,
									new Date(),
									fields, // tags
									null // extra fields
								);
						}
					}
				}

				for (var ii=0;ii<displayThese.length;ii++)
					story.displayTiddler("bottom",displayThese[ii]);

				alert("Done creating items");
				return false;
			}); // end of createTiddlyButton

		}
	}
});



