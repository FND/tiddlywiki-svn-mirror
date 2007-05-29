/***
|''Name:''|ReminderPlugin|
|''Version:''|2.3.8a (Oct 4, 2006)|
|''Source:''|http://www.geocities.com/allredfaq/reminderMacros.html|
|''Author:''|Jeremy Sheeley(pop1280 [at] excite [dot] com)|
|''Licence:''|[[BSD open source license]]|
|''Macros:''|reminder, showreminders, displayTiddlersWithReminders, newReminder|
|''TiddlyWiki:''|2.0+|
|''Browser:''|Firefox 1.0.4+; InternetExplorer 6.0|

!Description
This plugin provides macros for tagging a date with a reminder.  Use the {{{reminder}}} macro to do this.  The {{{showReminders}}} and {{{displayTiddlersWithReminder}}} macros automatically search through all available tiddlers looking for upcoming reminders.

!Installation
* Create a new tiddler in your tiddlywiki titled ReminderPlugin and give it the {{{systemConfig}}} tag.  The tag is important because it tells TW that this is executable code.
* Double click this tiddler, and copy all the text from the tiddler's body.
* Paste the text into the body of the new tiddler in your TW.
* Save and reload your TW.
* You can copy some examples into your TW as well.  See [[Simple examples]], [[Holidays]], [[showReminders]] and [[Personal Reminders]]

!Syntax:
|>|See [[ReminderSyntax]] and [[showRemindersSyntax]]|

!Revision history
* v2.3.8a (Oct 4, 2006)
** change split to readBracketedList so can use tags with spaces. Thanks Robin Summerhill.
* v2.3.8 (Mar 9, 2006)
**Bug fix: A global variable had snuck in, which was killing FF 1.5.0.1
**Feature: You can now use TIDDLER and TIDDLERNAME in a regular reminder format
* v2.3.6 (Mar 1, 2006)
**Bug fix: Reminders for today weren't being matched sometimes.
**Feature:  Solidified integration with DatePlugin and CalendarPlugin
**Feature:  Recurring reminders will now return multiple hits in showReminders and the calendar.
**Feature:  Added TIDDLERNAME to the replacements for showReminders format, for plugins that need the title without brackets.
* v2.3.5 (Feb 8, 2006)
**Bug fix: Sped up reminders lots.  Added a caching mechanism for reminders that have already been matched.
* v2.3.4 (Feb 7, 2006)
**Bug fix: Cleaned up code to hopefully prevent the Firefox 1.5.0.1 crash that was causing lots of plugins 
to crash Firefox.  Thanks to http://www.jslint.com
* v2.3.3 (Feb 2, 2006)
**Feature: newReminder now has drop down lists instead of text boxes.
**Bug fix:  A trailing space in a title would trigger an infinite loop.
**Bug fix:  using tag:"birthday !reminder" would filter differently than tag:"!reminder birthday"
* v2.3.2 (Jan 21, 2006)
**Feature: newReminder macro, which will let you easily add a reminder to a tiddler. Thanks to Eric Shulman (http://www.elsdesign.com) for the code to do this.
** Bug fix: offsetday was not working sometimes
** Bug fix: when upgrading to 2.0, I included a bit to exclude tiddlers tagged with excludeSearch.  I've reverted back to searching through all tiddlers
* v2.3.1 (Jan 7, 2006)
**Feature: 2.0 compatibility
**Feature AlanH sent some code to make sure that showReminders prints a message if no reminders are found.
* v2.3.0 (Jan 3, 2006)
** Bug Fix:  Using "Last Sunday (-0)" as a offsetdayofweek wasn't working.
** Bug Fix:  Daylight Savings time broke offset based reminders (for example year:2005 month:8 day:23 recurdays:7 would match Monday instead of Tuesday during DST.

!Code
***/
//{{{

//============================================================================
//============================================================================
//           ReminderPlugin
//============================================================================
//============================================================================

version.extensions.ReminderPlugin = {major: 2, minor: 3, revision: 8, date: new Date(2006,3,9), source: "http://www.geocities.com/allredfaq/reminderMacros.html"};

//============================================================================
// Configuration
// Modify this section to change the defaults for 
// leadtime and display strings
//============================================================================

config.macros.reminders = {};
config.macros["reminder"] = {};
config.macros["newReminder"] = {};
config.macros["showReminders"] = {};
config.macros["displayTiddlersWithReminders"] = {};

config.macros.reminders["defaultLeadTime"] = [0,6000];
config.macros.reminders["defaultReminderMessage"] = "DIFF: TITLE on DATE ANNIVERSARY";
config.macros.reminders["defaultShowReminderMessage"] = "DIFF: TITLE on DATE ANNIVERSARY -- TIDDLER";
config.macros.reminders["defaultAnniversaryMessage"] = "(DIFF)";
config.macros.reminders["untitledReminder"] = "Untitled Reminder";
config.macros.reminders["noReminderFound"] = "Couldn't find a match for TITLE in the next LEADTIMEUPPER days."
config.macros.reminders["todayString"] = "Today";
config.macros.reminders["tomorrowString"] = "Tomorrow";
config.macros.reminders["ndaysString"] = "DIFF days";
config.macros.reminders["emtpyShowRemindersString"] = "There are no upcoming events";


//============================================================================
//  Code
// You should not need to edit anything 
// below this.  Make sure to edit this tiddler and copy 
// the code from the text box, to make sure that 
// tiddler rendering doesn't interfere with the copy 
// and paste.
//============================================================================

// This line is to preserve 1.2 compatibility
 if (!story) var story=window; 
//this object will hold the cache of reminders, so that we don't
//recompute the same reminder over again.
var reminderCache = {};

config.macros.showReminders.handler = function showReminders(place,macroName,params)
{
   var now = new Date().getMidnight();
   var paramHash = {};
   var leadtime = [0,14];
   paramHash = getParamsForReminder(params);
   var bProvidedDate = (paramHash["year"] != null) || 
			(paramHash["month"] != null) || 
			(paramHash["day"] != null) || 
			(paramHash["dayofweek"] != null);
   if (paramHash["leadtime"] != null)
   {
      leadtime = paramHash["leadtime"];
      if (bProvidedDate)
      {
         //If they've entered a day, we need to make 
         //sure to find it.  We'll reset the 
         //leadtime a few lines down.
         paramHash["leadtime"] = [-10000, 10000];
      }
   }
   var matchedDate = now;
   if (bProvidedDate)
   {
      var leadTimeLowerBound = new Date().getMidnight().addDays(paramHash["leadtime"][0]);
      var leadTimeUpperBound = new Date().getMidnight().addDays(paramHash["leadtime"][1]);
      matchedDate = findDateForReminder(paramHash, new Date().getMidnight(), leadTimeLowerBound, leadTimeUpperBound); 
   }

   var arr = findTiddlersWithReminders(matchedDate, leadtime, paramHash["tag"], paramHash["limit"]);
   var elem = createTiddlyElement(place,"span",null,null, null);
   var mess = "";
   if (arr.length == 0)
   {
      mess += config.macros.reminders.emtpyShowRemindersString; 
   }
   for (var j = 0; j < arr.length; j++)
   {
      if (paramHash["format"] != null)
      {
         arr[j]["params"]["format"] = paramHash["format"];
      }
      else
      {
         arr[j]["params"]["format"] = config.macros.reminders["defaultShowReminderMessage"];
      }
      mess += getReminderMessageForDisplay(arr[j]["diff"], arr[j]["params"], arr[j]["matchedDate"], arr[j]["tiddler"]);
      mess += "\n";
   }
   wikify(mess, elem, null, null);
};


config.macros.displayTiddlersWithReminders.handler = function displayTiddlersWithReminders(place,macroName,params)
{
   var now = new Date().getMidnight();
   var paramHash = {};
   var leadtime = [0,14];
   paramHash = getParamsForReminder(params);
   var bProvidedDate = (paramHash["year"] != null) || 
			(paramHash["month"] != null) || 
			(paramHash["day"] != null) || 
			(paramHash["dayofweek"] != null);
   if (paramHash["leadtime"] != null)
   {
      leadtime = paramHash["leadtime"];
      if (bProvidedDate)
      {
         //If they've entered a day, we need to make 
         //sure to find it.  We'll reset the leadtime 
         //a few lines down.
         paramHash["leadtime"] = [-10000,10000];
      }
   }
   var matchedDate = now;
   if (bProvidedDate)
   {
      var leadTimeLowerBound = new Date().getMidnight().addDays(paramHash["leadtime"][0]);
      var leadTimeUpperBound = new Date().getMidnight().addDays(paramHash["leadtime"][1]);
      matchedDate = findDateForReminder(paramHash, new Date().getMidnight(), leadTimeLowerBound, leadTimeUpperBound); 
   }
   var arr = findTiddlersWithReminders(matchedDate, leadtime, paramHash["tag"], paramHash["limit"]);
   for (var j = 0; j < arr.length; j++)
   {
      displayTiddler(null, arr[j]["tiddler"], 0, null, false, false, false);
   }
};

config.macros.reminder.handler = function reminder(place,macroName,params)
{
   var dateHash = getParamsForReminder(params);
   if (dateHash["hidden"] != null)
   {
      return;
   }
   var leadTime = dateHash["leadtime"];
   if (leadTime == null)
   {
      leadTime = config.macros.reminders["defaultLeadTime"]; 
   }
   var leadTimeLowerBound = new Date().getMidnight().addDays(leadTime[0]);
   var leadTimeUpperBound = new Date().getMidnight().addDays(leadTime[1]);
   var matchedDate = findDateForReminder(dateHash, new Date().getMidnight(), leadTimeLowerBound, leadTimeUpperBound);
   if (!window.story) 
   {
      window.story=window; 
   }
   if (!store.getTiddler) 
   {
      store.getTiddler=function(title) {return this.tiddlers[title];};
   }
   var title = window.story.findContainingTiddler(place).id.substr(7);
   if (matchedDate != null)
   {
      var diff = matchedDate.getDifferenceInDays(new Date().getMidnight());
      var elem = createTiddlyElement(place,"span",null,null, null);
      var mess = getReminderMessageForDisplay(diff, dateHash, matchedDate, title);
      wikify(mess, elem, null, null);
   }
   else
   {
      createTiddlyElement(place,"span",null,null, config.macros.reminders["noReminderFound"].replace("TITLE", dateHash["title"]).replace("LEADTIMEUPPER", leadTime[1]).replace("LEADTIMELOWER", leadTime[0]).replace("TIDDLERNAME", title).replace("TIDDLER", "[[" + title + "]]") );
   }
};

config.macros.newReminder.handler = function newReminder(place,macroName,params)
{
  var today=new Date().getMidnight();
  var formstring = '<html><form>Year: <select name="year"><option value="">Every year</option>';
  for (var i = 0; i < 5; i++)
  {
    formstring += '<option' + ((i == 0) ? ' selected' : '') + ' value="' + (today.getFullYear() +i) + '">' + (today.getFullYear() + i) + '</option>';
  }
  formstring += '</select>&nbsp;&nbsp;Month:<select name="month"><option value="">Every month</option>';
  for (i = 0; i < 12; i++)
  {
    formstring += '<option' + ((i == today.getMonth()) ? ' selected' : '') + ' value="' + (i+1) + '">' + config.messages.dates.months[i] + '</option>';
  }
  formstring += '</select>&nbsp;&nbsp;Day:<select name="day"><option value="">Every day</option>';
  for (i = 1; i < 32; i++)
  {
    formstring += '<option' + ((i == (today.getDate() )) ? ' selected' : '') + ' value="' + i + '">' + i + '</option>';
  }

formstring += '</select>&nbsp;&nbsp;Reminder Title:<input type="text" size="40" name="title" value="please enter a title" onfocus="this.select();"><input type="button" value="ok" onclick="addReminderToTiddler(this.form)"></form></html>';

  var panel = config.macros.slider.createSlider(place,null,"New Reminder","Open a form to add a new reminder to this tiddler");
  wikify(formstring ,panel,null,store.getTiddler(params[1]));
};

// onclick: process input and insert reminder at 'marker'
window.addReminderToTiddler = function(form) {
   if (!window.story) 
   {
      window.story=window; 
   }
   if (!store.getTiddler) 
   {
      store.getTiddler=function(title) {return this.tiddlers[title];};
   }
   var title = window.story.findContainingTiddler(form).id.substr(7);
   var tiddler=store.getTiddler(title);
  var txt='\n<<reminder ';
  if (form.year.value != "")
    txt += 'year:'+form.year.value + ' ';
  if (form.month.value != "")
    txt += 'month:'+form.month.value + ' ';
  if (form.day.value != "")
    txt += 'day:'+form.day.value + ' ';
  txt += 'title:"'+form.title.value+'" ';
  txt +='>>';
   tiddler.set(null,tiddler.text + txt);
   window.story.refreshTiddler(title,1,true);
   store.setDirty(true);
};

function hasTag(tiddlerTags, tagFilters)
{
  //Make sure we respond well to empty tiddlerTaglists or tagFilterlists
  if (tagFilters.length==0 || tiddlerTags.length==0)
  {
    return true;
  }

  var bHasTag = false;
  
  /*bNoPos says: "'till now there has been no check using a positive filter"
     Imagine a filterlist consisting of 1 negative filter:
         If the filter isn't matched, we want hasTag to be true.
         Yet bHasTag is still false ('cause only positive filters cause bHasTag to change)
         
     If no positive filters are present bNoPos is true, and no negative filters are matched so we have not returned false
         Thus: hasTag returns true.
      
      If at any time a positive filter is encountered, we want at least one of the tags to match it, so we turn bNoPos to false, which
      means bHasTag must be true for hasTag to return true*/
  var bNoPos=true;
  
for (var t3 = 0; t3 < tagFilters.length; t3++)
  {
      for(var t2=0; t2<tiddlerTags.length; t2++)
      {
           if (tagFilters[t3].length > 1 && tagFilters[t3].charAt(0) == '!') 
           {
              if (tiddlerTags[t2] == tagFilters[t3].substring(1))
              {
                 //If at any time a negative filter is matched, we return false
                  return false;
              }
           }
           else 
           {
              if (bNoPos)
              {
                 //We encountered the first positive filter
                 bNoPos=false;
              }
              if (tiddlerTags[t2] == tagFilters[t3])
              {
                  //A positive filter is matched. As long as no negative filter is matched, hasTag will return true
                  bHasTag=true;
              }
           }
        }
    }
    return (bNoPos || bHasTag);
};

//This function searches all tiddlers for the reminder  //macro.  It is intended that other plugins (like //calendar) will use this function to query for 
//upcoming reminders.
//The arguments to this function filter out reminders //based on when they will fire.
//
//ARGUMENTS:
//baseDate is the date that is used as "now".  
//leadtime is a two element int array, with leadtime[0] 
//         as the lower bound and leadtime[1] as the
//         upper bound.  A reasonable default is [0,14]
//tags is a space-separated list of tags to use to filter 
//         tiddlers.  If a tag name begins with an !, then 
//         only tiddlers which do not have that tag will 
//         be considered.  For example "examples holidays"  
//         will search for reminders in any tiddlers that  
//         are tagged with examples or holidays and 
//         "!examples !holidays" will search for reminders 
//         in any tiddlers that are not tagged with 
//         examples or holidays.  Pass in null to search 
//         all tiddlers.
//limit.  If limit is null, individual reminders can 
//        override the leadtime specified earlier.  
//        Pass in 1 in order to override that behavior.

window.findTiddlersWithReminders = function findTiddlersWithReminders(baseDate, leadtime, tags, limit)
{
//function(searchRegExp,sortField,excludeTag)
//   var macroPattern = "<<([^>\\]+)(?:\\*)([^>]*)>>";
   var macroPattern = "<<(reminder)(.*)>>";
   var macroRegExp = new RegExp(macroPattern,"mg");
   var matches = store.search(macroRegExp,"title","");
   var arr = [];
   var tagsArray = null;
   if (tags != null)
   {
      // tagsArray = tags.split(" ");
      tagsArray = tags.readBracketedList(); // allows tags with spaces. fix by Robin Summerhill, 4-Oct-06.
   }
   for(var t=matches.length-1; t>=0; t--)
   {
      if (tagsArray != null)
      {
         //If they specified tags to filter on, and this tiddler doesn't 
	 //match, skip it entirely.
         if ( ! hasTag(matches[t].tags, tagsArray))
         {
            continue;
         }
      }

      var targetText = matches[t].text;
      do {
         // Get the next formatting match
         var formatMatch = macroRegExp.exec(targetText);
         if(formatMatch && formatMatch[1] != null && formatMatch[1].toLowerCase() == "reminder")
         {
            //Find the matching date.
            
            var params = formatMatch[2] != null ? formatMatch[2].readMacroParams() : {};
            var dateHash = getParamsForReminder(params);
            if (limit != null || dateHash["leadtime"] == null)
            {
               if (leadtime == null)
                   dateHash["leadtime"] = leadtime;
               else
               {
                  dateHash["leadtime"] = [];
                  dateHash["leadtime"][0] = leadtime[0];
                  dateHash["leadtime"][1] = leadtime[1];
               }
            }
	    if (dateHash["leadtime"] == null)
               dateHash["leadtime"] = config.macros.reminders["defaultLeadTime"]; 
            var leadTimeLowerBound = baseDate.addDays(dateHash["leadtime"][0]);
            var leadTimeUpperBound = baseDate.addDays(dateHash["leadtime"][1]);
            var matchedDate = findDateForReminder(dateHash, baseDate, leadTimeLowerBound, leadTimeUpperBound);
            while (matchedDate != null)
            {
               var hash = {};
               hash["diff"] = matchedDate.getDifferenceInDays(baseDate);
               hash["matchedDate"] = new Date(matchedDate.getFullYear(), matchedDate.getMonth(), matchedDate.getDate(), 0, 0);
               hash["params"] = cloneParams(dateHash);
               hash["tiddler"] = matches[t].title;
               hash["tags"] = matches[t].tags;
               arr.pushUnique(hash);
	       if (dateHash["recurdays"] != null || (dateHash["year"] == null))
	       {
	         leadTimeLowerBound = leadTimeLowerBound.addDays(matchedDate.getDifferenceInDays(leadTimeLowerBound)+ 1);
                 matchedDate = findDateForReminder(dateHash, baseDate, leadTimeLowerBound, leadTimeUpperBound);
	       }
	       else matchedDate = null;
            }
         }
      }while(formatMatch);
   }
   if(arr.length > 1)  //Sort the array by number of days remaining.
   {
      arr.sort(function (a,b) {if(a["diff"] == b["diff"]) {return(0);} else {return (a["diff"] < b["diff"]) ? -1 : +1; } });
   }
   return arr;
};

//This function takes the reminder macro parameters and
//generates the string that is used for display.
//This function is not intended to be called by 
//other plugins.
 window.getReminderMessageForDisplay= function getReminderMessageForDisplay(diff, params, matchedDate, tiddlerTitle)
{
   var anniversaryString = "";
   var reminderTitle = params["title"];
   if (reminderTitle == null)
   {
      reminderTitle = config.macros.reminders["untitledReminder"];
   }
   if (params["firstyear"] != null)
   {
      anniversaryString = config.macros.reminders["defaultAnniversaryMessage"].replace("DIFF", (matchedDate.getFullYear() - params["firstyear"]));
   }
   var mess = "";
   var diffString = "";
   if (diff == 0)
   {
      diffString = config.macros.reminders["todayString"];
   }
   else if (diff == 1)
   {
      diffString = config.macros.reminders["tomorrowString"];
   }
   else
   {
      diffString = config.macros.reminders["ndaysString"].replace("DIFF", diff);
   }
   var format = config.macros.reminders["defaultReminderMessage"];
   if (params["format"] != null)
   {
      format = params["format"];
   }
   mess = format;
//HACK!  -- Avoid replacing DD in TIDDLER with the date
   mess = mess.replace(/TIDDLER/g, "TIDELER");
   mess = matchedDate.formatStringDateOnly(mess);
   mess = mess.replace(/TIDELER/g, "TIDDLER");
   if (tiddlerTitle != null)
   {
      mess = mess.replace(/TIDDLERNAME/g, tiddlerTitle);
      mess = mess.replace(/TIDDLER/g, "[[" + tiddlerTitle + "]]");
   }
   
   mess = mess.replace("DIFF", diffString).replace("TITLE", reminderTitle).replace("DATE", matchedDate.formatString("DDD MMM DD, YYYY")).replace("ANNIVERSARY", anniversaryString);
   return mess;
};

// Parse out the macro parameters into a hashtable.  This
// handles the arguments for reminder, showReminders and 
// displayTiddlersWithReminders.
window.getParamsForReminder = function getParamsForReminder(params)
{
   var dateHash = {};
   var type = "";
   var num = 0;
   var title = "";
   for(var t=0; t<params.length; t++)
   {
      var split = params[t].split(":");
      type = split[0].toLowerCase();
      var value = split[1];
      for (var i=2; i < split.length; i++)
      {
         value += ":" + split[i];
      }
      if (type == "nolinks" || type == "limit" || type == "hidden")
      {
         num = 1;
      }
      else if (type == "leadtime")
      {
         var leads = value.split("...");
         if (leads.length == 1)
         {
            leads[1]= leads[0];
            leads[0] = 0;
         }
         leads[0] = parseInt(leads[0], 10);
         leads[1] = parseInt(leads[1], 10);
         num = leads;
      }
      else if (type == "offsetdayofweek")
      {
          if (value.substr(0,1) == "-")
          {
             dateHash["negativeOffsetDayOfWeek"] = 1;
	     value = value.substr(1);
          }
          num = parseInt(value, 10);
      }
      else if (type != "title" && type != "tag" && type != "format")
      {
         num = parseInt(value, 10);
      }
      else
      {
         title = value;
         t++;
         while (title.substr(0,1) == '"' && title.substr(title.length - 1,1) != '"' && params[t] != undefined)
         {
            title += " " + params[t++];
         }
         //Trim off the leading and trailing quotes
         if (title.substr(0,1) == "\"" && title.substr(title.length - 1,1)== "\"")
         {
            title = title.substr(1, title.length - 2);
            t--;
         }
         num = title;
      }
      dateHash[type] = num;
   }
   //date is synonymous with day
   if (dateHash["day"] == null)
   {
      dateHash["day"] = dateHash["date"];
   }
   return dateHash;
};

//This function finds the date specified in the reminder 
//parameters.  It will return null if no match can be
//found.  This function is not intended to be used by
//other plugins.
window.findDateForReminder= function findDateForReminder( dateHash, baseDate, leadTimeLowerBound, leadTimeUpperBound)
{
   if (baseDate == null)
   {
     baseDate = new Date().getMidnight();
   }
   var hashKey = baseDate.convertToYYYYMMDDHHMM();
   for (var k in dateHash)
   {
      hashKey += "," + k + "|" + dateHash[k];
   }
   hashKey += "," + leadTimeLowerBound.convertToYYYYMMDDHHMM();
   hashKey += "," + leadTimeUpperBound.convertToYYYYMMDDHHMM();
   if (reminderCache[hashKey] == null)
   {
      //If we don't find a match in this run, then we will
      //cache that the reminder can't be matched.
      reminderCache[hashKey] = false;
   }
   else if (reminderCache[hashKey] == false)
   {
      //We've already tried this date and failed
      return null;
   }
   else
   {
      return reminderCache[hashKey];
   }
   
   var bOffsetSpecified = dateHash["offsetyear"] != null || 
				dateHash["offsetmonth"] != null || 
				dateHash["offsetday"] != null || 
				dateHash["offsetdayofweek"] != null || 
				dateHash["recurdays"] != null;
   
   // If we are matching the base date for a dayofweek offset, look for the base date a 
   //little further back.
   var tmp1leadTimeLowerBound = leadTimeLowerBound;  
   if ( dateHash["offsetdayofweek"] != null)
   {
      tmp1leadTimeLowerBound = leadTimeLowerBound.addDays(-6);  
   }
   var matchedDate = baseDate.findMatch(dateHash, tmp1leadTimeLowerBound, leadTimeUpperBound);
   if (matchedDate != null)
   {
      var newMatchedDate = matchedDate;
      if (dateHash["recurdays"] != null)
      {
         while (newMatchedDate.getTime() < leadTimeLowerBound.getTime())
         {
            newMatchedDate = newMatchedDate.addDays(dateHash["recurdays"]);
         }
      }
      else if (dateHash["offsetyear"] != null || 
		dateHash["offsetmonth"] != null || 
		dateHash["offsetday"] != null || 
		dateHash["offsetdayofweek"] != null)
      {
         var tmpdateHash = cloneParams(dateHash);
         tmpdateHash["year"] = dateHash["offsetyear"];
         tmpdateHash["month"] = dateHash["offsetmonth"];
         tmpdateHash["day"] = dateHash["offsetday"];
         tmpdateHash["dayofweek"] = dateHash["offsetdayofweek"];
	 var tmpleadTimeLowerBound = leadTimeLowerBound;
	 var tmpleadTimeUpperBound = leadTimeUpperBound;
	 if (tmpdateHash["offsetdayofweek"] != null)
	 {
	 	if (tmpdateHash["negativeOffsetDayOfWeek"] == 1)
		{
		   tmpleadTimeLowerBound = matchedDate.addDays(-6);
		   tmpleadTimeUpperBound = matchedDate;

		}
		else
		{
		   tmpleadTimeLowerBound = matchedDate;
		   tmpleadTimeUpperBound = matchedDate.addDays(6);
		}

	 }
	 newMatchedDate = matchedDate.findMatch(tmpdateHash, tmpleadTimeLowerBound, tmpleadTimeUpperBound);
         //The offset couldn't be matched.  return null.
         if (newMatchedDate == null)
         {
            return null;
         }
      }
      if (newMatchedDate.isBetween(leadTimeLowerBound, leadTimeUpperBound))
      {
         reminderCache[hashKey] = newMatchedDate;
         return newMatchedDate;
      }
   }
   return null;
};

//This does much the same job as findDateForReminder, but
//this one doesn't deal with offsets or recurring 
//reminders.
Date.prototype.findMatch = function findMatch(dateHash, leadTimeLowerBound, leadTimeUpperBound)
{

   var bSpecifiedYear =     (dateHash["year"] != null);
   var bSpecifiedMonth =     (dateHash["month"] != null);
   var bSpecifiedDay =     (dateHash["day"] != null);
   var bSpecifiedDayOfWeek =     (dateHash["dayofweek"] != null);
   if (bSpecifiedYear && bSpecifiedMonth && bSpecifiedDay)
   {
      return new Date(dateHash["year"], dateHash["month"]-1, dateHash["day"], 0, 0);
   }
   var bMatchedYear = !bSpecifiedYear;
   var bMatchedMonth = !bSpecifiedMonth;
   var bMatchedDay = !bSpecifiedDay;
   var bMatchedDayOfWeek = !bSpecifiedDayOfWeek;
   if (bSpecifiedDay && bSpecifiedMonth && !bSpecifiedYear && !bSpecifiedDayOfWeek)
   {

      //Shortcut -- First try this year.  If it's too small, try next year.
      var tmpMidnight = this.getMidnight();
      var tmpDate = new Date(this.getFullYear(), dateHash["month"]-1, dateHash["day"], 0,0);
      if (tmpDate.getTime() < leadTimeLowerBound.getTime())
      {
         tmpDate = new Date((this.getFullYear() + 1), dateHash["month"]-1, dateHash["day"], 0,0);
      }
      if ( tmpDate.isBetween(leadTimeLowerBound, leadTimeUpperBound))
      {
         return tmpDate;
      }
      else
      {
         return null;
      }
   }

   var newDate = leadTimeLowerBound; 
   while (newDate.isBetween(leadTimeLowerBound, leadTimeUpperBound))
   {
      var tmp = testDate(newDate, dateHash, bSpecifiedYear, bSpecifiedMonth, bSpecifiedDay, bSpecifiedDayOfWeek);
      if (tmp != null)
        return tmp;
      newDate = newDate.addDays(1);
   }
};

function testDate(testMe, dateHash, bSpecifiedYear, bSpecifiedMonth, bSpecifiedDay, bSpecifiedDayOfWeek)
{
   var bMatchedYear = !bSpecifiedYear;
   var bMatchedMonth = !bSpecifiedMonth;
   var bMatchedDay = !bSpecifiedDay;
   var bMatchedDayOfWeek = !bSpecifiedDayOfWeek;
   if (bSpecifiedYear)
   {
      bMatchedYear = (dateHash["year"] == testMe.getFullYear());
   }
   if (bSpecifiedMonth)
   {
      bMatchedMonth = ((dateHash["month"] - 1)  == testMe.getMonth() );
   }
   if (bSpecifiedDay)
   {
      bMatchedDay = (dateHash["day"] == testMe.getDate());
   }
   if (bSpecifiedDayOfWeek)
   {
      bMatchedDayOfWeek = (dateHash["dayofweek"] == testMe.getDay());
   }

   if (bMatchedYear && bMatchedMonth && bMatchedDay && bMatchedDayOfWeek)
   {
      return testMe;
   }
};

//Returns true if the date is in between two given dates
Date.prototype.isBetween = function isBetween(lowerBound, upperBound)
{
  return (this.getTime() >= lowerBound.getTime() && this.getTime() <= upperBound.getTime());
}
//Return a new date, with the time set to midnight (0000)
Date.prototype.getMidnight = function getMidnight()
{
   return new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0);
};
// Add the specified number of days to a date.
Date.prototype.addDays = function addDays(numberOfDays)
{
   return new Date(this.getFullYear(), this.getMonth(), this.getDate() + numberOfDays, 0, 0);
};
//Return the number of days between two dates.
Date.prototype.getDifferenceInDays = function getDifferenceInDays(otherDate)
{
//I have to do it this way, because this way ignores daylight savings
   var tmpDate = this.addDays(0);
   if (this.getTime() > otherDate.getTime())
   {
      var i = 0;
      for (i = 0; tmpDate.getTime() > otherDate.getTime(); i++)
      {
         tmpDate = tmpDate.addDays(-1);
      }
      return i;
   }
   else
   {
      var i = 0;
      for (i = 0; tmpDate.getTime() < otherDate.getTime(); i++)
      {
         tmpDate = tmpDate.addDays(1);
      }
      return i * -1;
   }
   return 0;
};
function cloneParams(what) {
    var tmp = {};
    for (var i in what) {
        tmp[i] = what[i];
    }
    return tmp;
}
// Substitute date components into a string
Date.prototype.formatStringDateOnly = function formatStringDateOnly(template)
{
	template = template.replace("YYYY",this.getFullYear());
	template = template.replace("YY",String.zeroPad(this.getFullYear()-2000,2));
	template = template.replace("MMM",config.messages.dates.months[this.getMonth()]);
	template = template.replace("0MM",String.zeroPad(this.getMonth()+1,2));
	template = template.replace("MM",this.getMonth()+1);
	template = template.replace("DDD",config.messages.dates.days[this.getDay()]);
	template = template.replace("0DD",String.zeroPad(this.getDate(),2));
	template = template.replace("DD",this.getDate());
	return template;
};

//}}}