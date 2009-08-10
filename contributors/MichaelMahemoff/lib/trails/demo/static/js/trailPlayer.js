// NOTE:
// indexes are rather confusing, because:
// (a) carousel confusingly starts counting at 1
// (b) the code here adds an invisible start element and end element
// The two things ~cancel each other out, if you see what I mean.

var MAX_NOTE_LENGTH=50;
var selectedSlot = 2;

function selectNewResource(na,na,index,action) {
  selectedSlot=index+1;
  var resource = $($("#resources a")[selectedSlot-1]); // element 1 is a dummy
  $('#resourceView').attr("src", resource.attr("href"));
  $('#resources a').removeClass("selected");
  resource.addClass("selected");
  renderNote(resource);
}

function selected() { return $("#resources a").eq(selectedSlot-1); }

function renderNote(resource) {
  var note = selected().attr("note");
  // var showFull = (note.length+9 < MAX_NOTE_LENGTH);
  $("#note")
    .empty()
/*
    .create("<span class='name' />")
      .html(resource.html())
    .end()
*/
    .create("<div class='more'/>")
      .text("(expand)")
      .click(showFullNote)
    .end()
    .create("<span class='text' />")
      .text(note)
    .end()
}

function showFullNote() {
  var message = selected().attr("note");
  $.nyroModalManual({
    bgColor: '#bbb',
    content: message
  });
}

$(function() {

  $('#resources a').each(function(i) { $(this).data("slot", i+1); });

  $('#resources').jcarousel({
     visible: 3,
     scroll: 1,
     offset: 1, 
     itemFirstInCallback: { 
       onBeforeAnimation: selectNewResource
     }
  });
  
  /* $('#resources a').click(function() { select($(this).data("slot")); }); */
  $('#resources a').click(function() { return false; });

  $("#closer").click(function() { document.location.href = $(".selected").attr("href"); });

});

function log() { if (console) console.log.apply(console, arguments); }
$.fn.create = function(html) { return this.append(html).children(":last"); };

/*!
 * iff - v0.2 - 6/3/2009
 * http://benalman.com/projects/jquery-iff-plugin/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Licensed under the MIT license
 * http://benalman.com/about/license/
 */

(function($){
  '$:nomunge'; // Used by YUI compressor.
  
  $.fn.iff = function( test ) {
    var elems = !test || $.isFunction( test )
      && !test.apply( this, Array.prototype.slice.call(arguments, 1) )
      ? []
      : this;
    return this.pushStack( elems, 'iff', test );
  };
  
})(jQuery);


