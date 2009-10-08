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

  version.extensions.QuizPlugin = {installed:true};

  (function() {

    var $ = jQuery;
    jQuery.fn.attach = function(html) { return this.append(html).children(":last"); };

    config.macros.quiz = {

      init: function() {
        var stylesheet = store.getTiddlerText(tiddler.title + "##StyleSheet");
        config.shadowTiddlers["StyleSheetQuizPlugin"] = stylesheet;
        store.addNotification("StyleSheetQuizPlugin", refreshStyles);
      },

      handler: function(place,macroName,params,wikifier,paramString,tiddler) {
        var quizEl = $(createTiddlyElement(place, "div", null, "quiz"));
        $.each(shuffle(store.getTaggedTiddlers("question")), function(i, questionTiddler) {
          quizEl.append(buildQuestionEl(parseQuestion(questionTiddler.text)));
        });
        quizEl
          .append($("<button>check</button>").click(function() { checkQuiz(quizEl); }))
          .append($("<div class='quizStatus finale' />"));
      }

    };

    function parseQuestion(questionText) {
      var question = {
        challenge: wikifyStatic(trim(questionText.replace(/^\*.*/mg, ""))),
        wrongOptions: questionText.match(/^\* .*$/mg),
        rightOptions: questionText.match(/^\*\* .*$/mg),
      };
      for (i=0; i<question.wrongOptions.length; i++) {
        question.wrongOptions[i] = question.wrongOptions[i].replace(/^\*+ /,"");
      }
      for (i=0; i<question.rightOptions.length; i++) {
        question.rightOptions[i] = question.rightOptions[i].replace(/^\*+ /,"");
      }
      question.options = shuffle(question.wrongOptions.concat(question.rightOptions));
      return question;
    }

    function buildQuestionEl(question) {
      var questionEl = $("<div class='question'/>")
        // .append("<div class='challenge'>"+question.challenge+"</div>")
        // .append("<div class='choose'>Choose " + question.rightOptions.length + "</div>");
        .append("<div class='challenge'>"+question.challenge + " " +
                "<span class='choose'>(choose " + question.rightOptions.length + ")</span></div>");
      for (i=0; i<question.options.length; i++) {
        var isRight = (question.rightOptions.indexOf(question.options[i])!=-1);
        $("<div class='option'/>")
        .attach("<input type='checkbox' />")
          /*
          .click(function() {
            // console.log($(this).parent().siblings(".option"));
            if (! $(this).is(":checked")) return;
            var checksRemaining = question.rightOptions.length-1;
            $(this).parent().siblings(".option").find(":checkbox").each(function() {
              console.log(this);
              if ($(this).is(":checked")) {
                if (checksRemaining-- <= 0) $(this).attr("checked", false);
              }
            });
          })
          */
        .end()
        .addClass(isRight ? "right" : "wrong")
        .attach("<span>"+question.options[i]+"</span>")
          .click(function() { $(this).prev().click(); })
        .end()
        .appendTo(questionEl);
      }
      questionEl.append("<div class='status'></div>");
      return questionEl;
    }

    function checkQuiz(quizEl) {
      console.log("check");
      var tally = 0;
      quizEl.find(".question").each(function() {
        var isCorrect = true;
        var $question = $(this);
        $question.find(".option").each(function() {
          var optionIsRight = $(this).hasClass("right");
          var userSaysItsRight = $(this).find(":checkbox").is(":checked");
          if (optionIsRight!=userSaysItsRight) isCorrect = false;
        });
        if (isCorrect) tally++;
        $question.find(".status")
          .html(isCorrect ? "<span class='correct finale'>Correct</span>" :
                            "<span class='incorrect finale'>Incorrect</span>");
      });
      var total = quizEl.find(".question").length;
      quizEl.find(".quizStatus")
        .empty()
        .append(tally + " of " +  total + " correct. ")
        .append((tally==total) ? " Well done!" : "")
        .attach("<span class='pseudolink'>Reset</span>")
          .click(function() {
            $(quizEl).find(".finale").fadeOut(function() { $(this).empty(); });
            $(quizEl).find(":checkbox").attr("checked", false);
          })
        .end();
      console.log("*** reveal finale");
      revealFinale();
    }

    function revealFinale() {
      console.log("reveal finale");
      $(".right span").addClass("rightFinale");
      $(".finale").fadeIn();
    }

    function clearFinale() {
      $(".right span").removeClass("rightFinale");
      $(".finale").hide();
    }

    // adapted fro mhttp://jsfromhell.com/array/shuffle
    function shuffle(o) {
      for (var j, x, i = o.length; i;
           j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
      ;
      return o;
    }

    config.macros.quiz.init();

    function trim(s) { return s.replace(/^[ \n\t]*/, "").replace(/[ \n\t]*$/, ""); }

  })();

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################

/***
!StyleSheet

.quiz .finale { display: none; }
.quiz .pseudolink { text-decoration: underline; color:[[ColorPalette::SecondaryDark]]; cursor: pointer; }
.quizStatus { margin: 1em 0; font-weight: bold; }

.question { margin: 1em 0; }
.question .choose { font-style: italic; }
.question .correct { color: #080; }
.question .incorrect { color: #b00; }

.option .rightness { margin-left: 0.5em; }
.option span { cursor: pointer; }

.rightFinale { font-weight: bold; text-decoration: underline; }

!(end of StyleSheet)

***/

} // end of 'install only once'
/*}}}*/
