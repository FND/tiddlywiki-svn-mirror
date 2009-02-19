/***
|Name|FieldChecboxMacro|
|Description|Macro to edit a custom field, where the field is boolean|
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

example:
<<fieldCheckbox finished>>
  -> where "finished" is the name of a custom field
  Custom fields are always string type, so we test against "true" (case-insensitive)
  to set the checkbox from the value, and we set the field back to "true" or "false".
***/

if (!version.extensions.preferenceMacros) {
version.extensions.preferenceMacros = {installed:true};

(function(macro) {

  config.macros.checkbox = {
    handler: function(place,macroname,params,wikifier,paramstring,tiddler) {
      var field = params[0];
      var checkbox = createTiddlyElement(place, "input");
      checkbox.type = "checkbox";
      tiddler.fields[field] && tiddler.fields[field].toLowerCase()=="true" ?
        (checkbox.checked = true) : delete checkbox.checked;
      checkbox.onclick = checkbox.onchange = function() {
        tiddler.fields[field] = ""+(checkbox.checked);
        log(checkbox, "chck", checkbox.checked);
        store.saveTiddler(tiddler.title);
        autoSaveChanges(false);
      }
    }
  }

  /* You can specify options in three ways. In increasing complexity:
     (1) explicit comma-sep'd tiddler argument - e.g. <<dropdown luggage none,1 bag,2 bags>>
     (2) tiddler argument <<dropdown luggage luggageOptions>> , where luggageOptions looks like:
         none
         1 bag
         2 bags
         (the option value is the same as the display value)
     (3) tiddler argument <<dropdown luggage luggageOptions>> , where luggageOptions looks like:
         none: I will take no bags on-board
         1 bag: I will check in at the desk and take one bag
         2 bags: I will check in at the desk and take two bags
         (flexible display value, using TiddlyWiki slice mechanism)
  */
  config.macros.dropdown = {
    handler: function(place,macroname,params,wikifier,paramstring,tiddler) {

      var field = params[0], optionsSpec = params[1], options = [], optionNames = [];
      if (store.getTiddler(optionsSpec)) {
        var slices = store.calcAllSlices(optionsSpec);
        for (var key in slices) { options.push({name: key, caption: slices[key]}); }
        if (!options.length) optionNames = store.getTiddler(optionsSpec).text.split("\n");
      } else {
        optionNames = optionsSpec.split(",");
      }
      if (optionNames) {
        for (var i=0; i<optionNames.length; i++)
          options.push( {name: optionNames[i], caption: optionNames[i]} );
      }

      createTiddlyDropDown(place, function() {
        if (tiddler.fields[field] != options[this.selectedIndex].name) {
          tiddler.fields[field] = options[this.selectedIndex].name;
          store.saveTiddler(tiddler.title);
          autoSaveChanges(false);
        }
      }, options, tiddler.fields[field])

    }
  }

  function log() { if (console) console.log.apply(console, arguments); }

})(version.extensions.preferenceMacros);
}

/*}}}*/
