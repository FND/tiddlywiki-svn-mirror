(function() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://comments.boz:8080/comments/static/js/injection.js";
  document.body.appendChild(script);
  var loadTimer = setInterval(function() {
    if (window.openScrumptiousComments) {
      window.openScrumptiousComments();
      clearTimeout(loadTimer);
    }
  }, 100);
})();
