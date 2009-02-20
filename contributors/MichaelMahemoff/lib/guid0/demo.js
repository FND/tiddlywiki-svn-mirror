/*
  TODO:
   - Interactive demo to tweak params
*/

window.onload = function() {
  var guid = new Guid({chars: Guid.constants.alphas, epoch: Guid.constants.epoch(2008)});
  for (var i=1; i<=20; i++) {
    document.getElementById("guids").innerHTML += "<tr><td class='count'>" + i + "</td><td>" + guid.generate() + "</td></tr>";
  }
}
