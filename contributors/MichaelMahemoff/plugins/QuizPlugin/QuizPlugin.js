/*
  QuizPlugin

*/

/***
|Name|QuizPlugin|
|Description|A macro to generate an interactive quiz|
|Source||
|Documentation||
|Version|0.1|
|Author|Michael Mahemoff, Osmosoft|
|''License:''|[[BSD open source license]]|
|~CoreVersion|2.2|

Usage:
<<quiz>>
The macro will look for all tiddlers tagged "Question". It will generate a question for each of them. The example question tiddlers in the demo self-document how to author question tiddlers.

Of course, anyone can cheat by viewing source. But then, they'd be cheaters with their pants on fire.

More options in the future and a reset quiz button. Maybe even a secure tiddlyweb based server-side to save cheaters from themselves.
***/

/*{{{*/
if(!version.extensions.QuizPlugin) {

  jQuery.fn.create = function(html) { return this.append(html).children(":last"); };

  version.extensions.QuizPlugin = {installed:true};

  config.macros.quiz = {

    init: function() {
      var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
      config.shadowTiddlers["StyleSheetQuizPlugin"] = stylesheet;
      store.addNotification("StyleSheetQuizPlugin", refreshStyles);
    },

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
      $ = jQuery;
      console.log(store.getTaggedTiddlers("question"));
      var quizEl = $(createTiddlyElement(place, "div", null, "quiz"));
      $.each(shuffle(store.getTaggedTiddlers("question")), function(i, question) {
        var questionEl = buildQuestionEl(question);
        quizEl.append(questionEl);
      });
      quizEl.append($("<button>check</button>").click(function() { checkQuiz(quizEl); }));
      quizEl.append($("<div class='quizStatus' />"));
    }

  }

  function buildQuestionEl(question) {
    var $ = jQuery;
    var questionText = question.text.replace(/^\*.*/mg, "");
    var questionEl = $("<div/>").
      addClass("question")
      .html(questionText)
    // var wikitext = question.text.replace(/^\*\*/m,"*");
    var wrongOptions = question.text.match(/^\* .*$/mg);
    var rightOptions = question.text.match(/^\*\* .*$/mg);
    var options = shuffle(wrongOptions.concat(rightOptions)); // todo randomise
    for (i=0; i<options.length; i++) {
      var isRight = (rightOptions.indexOf(options[i])!=-1);
      var optionText = options[i].replace(/^\*+ /, "");
      $("<div class='option'/>")
      .append("<input type='checkbox' />")
      .create("<span>"+optionText+"</span>")
        .click(function() { $(this).prev().click() })
      .end()
      .create("<span class='rightness'>"+(isRight? "&#10004" : "")+"</span>")
        .css("visibility", "hidden")
      .end()
      .data("right", isRight)
      .appendTo(questionEl);
    }
    questionEl.append("<div class='status'>&nbsp;</div>");
    return questionEl;
    // return $("<div/>")
      // .html(wikifyStatic(wikitext));
  }

  function checkQuiz(quizEl) {
    var tally = 0;
    quizEl.find(".question").each(function() {
      var isCorrect = true;
      var $question = $(this);
      $question.find(".option").each(function() {
        var optionIsRight = $(this).data("right");
        var userSaysItsRight = $(this).find(":checkbox").is(":checked");
        if (optionIsRight!=userSaysItsRight) isCorrect = false;
        $(this).find(".rightness").hide().fadeIn().css("visibility", "visible");
      });
      if (isCorrect) tally++;
      $question.find(".status")
        .hide()
        .fadeIn()
        .html(isCorrect ? "<span class='correct'>Correct</span>" :
                          "<span class='incorrect'>Incorrect</span>");
    });
    var total = quizEl.find(".question").length;
    quizEl.find(".quizStatus").hide().fadeIn()
      .empty()
      .append(tally + " of " +  total + " correct. ")
      .append((tally==total) ? " Well done!" : "");
  }

// http://jsfromhell.com/array/shuffle [v1.0]
  var shuffle = function(o){ //v1.0
  for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  };

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!StyleSheet

.quizStatus { margin: 1em 0; font-weight: bold; }

.question { margin: 1em 0; }
.question .correct { color: #080; }
.question .incorrect { color: #b00; }

.option .rightness { margin-left: 0.5em; }
.option span { cursor: pointer; }

!(end of StyleSheet)

***/

  config.macros.quiz.init();

  // var $ = jQuery;
  // $.fn.push = function(html) { return this.append(html).children(":last"); };

} // end of 'install only once'
/*}}}*/
