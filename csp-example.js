 c = require('js-csp');
var xd = require('transducers.js')

window.onload = function() {
  init();
};

init = function() {

  var mvchan = c.chan(1);
  var el = document.getElementById('el1');
  el.addEventListener('mousemove',function(e){
    c.putAsync(mvchan,{evt:e,el:el});
  })

  var xform = xd.drop(1);

  function listen(el, type) {
    var ch = c.chan(1);
    var count = 0;
    el.addEventListener(type, function(e) {
      // count = count + 1;
      // console.log('put count = '+count+' x:'+e.clientX+',y:'+e.clientY);
      c.putAsync(ch, {evt:e, el:el});
    });
    return ch;
  }

  chan = c.chan();
  c.putAsync(chan,1);
  c.putAsync(chan,2);
  c.putAsync(chan,3);

  c.go(function*() {

    var el = document.getElementById('el1');
    var clickch = listen(el,'mousedown');
    var mousePos = [0,0];
    var clickPos = [0,0];
    while ((val = yield c.take(clickch)) !== c.CLOSED) {
      clickPos = [val.evt.clientX, val.evt.clientY];
      el.innerHTML = (mousePos[0] + ', ' + mousePos[1] + ' - ' +
        clickPos[0] + ', ' + clickPos[1]);

      /*
      Create an alts loop:

        If take of drop(1) of mousemove:
          update the inner html

        If take of mouseup:
          return control to parent loop

      */
      // console.log(mvchan);
      // var newchan = c.chan();
      // dropfirst = xd.into(newchan,xform,chan);

      dropfirst = c.chan(1,xform);
      c.operations.pipe(chan,dropfirst);

      // dropfirst = xd.seq(chan,xform);
      console.log(dropfirst);
      val = yield c.take(dropfirst);
      console.log(val);
      // v = yield c.take(dropfirst);
      // console.log(yield c.take(dropfirst));

    }
  });

  // c.go(function*() {
  //   var el = document.getElementById('el1');
  //   var mousech = listen(el,'mousemove');
  //   var clickch = listen(el,'mousedown');
  //   //clickch = c.operations.merge([mousech,clickch]);
  //   var mousePos = [0,0];
  //   var clickPos = [0,0];
  //   while (true) {
  //     var v = yield c.alts([mousech,clickch]);
  //     var e = v.value.evt;
  //     if (v.channel === mousech) {
  //       mousePos = [e.clientX, e.clientY];
  //     }
  //     else {
  //       clickPos = [e.clientX, e.clientY];
  //     }
  //     el.innerHTML = (mousePos[0] + ', ' + mousePos[1] + ' - ' +
  //       clickPos[0] + ', ' + clickPos[1]);
  //   }
  // });

};


// c.go(function*() {
//   var val;
//   while((val = yield c.take(ch)) !== c.CLOSED) {
//     console.log(val);
//   }
// });
//
// c.go(function*() {
//   yield c.put(ch, 1);
//   yield c.take(c.timeout(1000));
//   yield c.put(ch, 2);
//   ch.close();
// });
