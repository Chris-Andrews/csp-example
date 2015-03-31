var csp = require('js-csp');

window.onload = function() {
  init();
};

init = function() {

  function listen(el, type) {
    var ch = csp.chan();
    el.addEventListener(type, function(e) {
      csp.putAsync(ch, {evt:e, el:el});
    });
    return ch;
  }

  csp.go(function*() {
    var el = document.getElementById('el1');
    var mousech = listen(el,'mousemove');
    var clickch = listen(el,'click');
    //clickch = csp.operations.merge([mousech,clickch]);
    var mousePos = [0,0];
    var clickPos = [0,0];
    while (true) {
      var v = yield csp.alts([mousech,clickch]);
      var e = v.value.evt;
      if (v.channel === mousech) {
        mousePos = [e.clientX, e.clientY];
      }
      else {
        clickPos = [e.clientX, e.clientY];
      }
      el.innerHTML = (mousePos[0] + ', ' + mousePos[1] + ' - ' +
        clickPos[0] + ', ' + clickPos[1]);
    }
  });

};


// csp.go(function*() {
//   var val;
//   while((val = yield csp.take(ch)) !== csp.CLOSED) {
//     console.log(val);
//   }
// });
//
// csp.go(function*() {
//   yield csp.put(ch, 1);
//   yield csp.take(csp.timeout(1000));
//   yield csp.put(ch, 2);
//   ch.close();
// });
