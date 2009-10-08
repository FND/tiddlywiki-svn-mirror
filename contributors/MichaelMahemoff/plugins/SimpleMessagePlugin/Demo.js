var $=jQuery;
var timer = setInterval(function() {
    if (getMessageDiv()) {
        clearTimeout(timer);
        runDemo();
    }
  }, 100);

function runDemo() {
  scheduleMessage(0);
  scheduleMessage(2000);
  scheduleMessage(4000);
  scheduleMessage(4500);
  scheduleMessage(4450);
}

var counter=0;
function scheduleMessage(delay) {
  setTimeout(function() {
    displayMessage("Message " + (++counter) + " (" + delay + "ms)");
  }, delay);
}
