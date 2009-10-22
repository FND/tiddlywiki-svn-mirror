(function() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://trails.dev:8080/static/js/addResource.js";
  document.body.appendChild(script);
  var loadTimer = setInterval(function() {
    if (window.openScrumptiousComments) {
      window.openScrumptiousComments();
      clearTimeout(loadTimer);
    }
  }, 100);
})();
