 c = require('js-csp');
var xd = require('transducers.js')

window.onload = function() {
  init();
};

init = function() {

  var mvchan = c.chan(c.buffers.sliding(1));
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

  c.go(function*() {

    var el = document.getElementById('el1');
    var clickch = listen(el,'mousedown');
    var upch = listen(el,'mouseup');
    var mousePos = [0,0];
    var clickPos = [0,0];
    el.innerHTML = (mousePos[0] + ', ' + mousePos[1] + ' - ' +
      clickPos[0] + ', ' + clickPos[1]);
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


      dropfirst = c.chan(1,xform);
      c.operations.pipe(mvchan,dropfirst);

      while ((v = yield c.alts([dropfirst,upch])) !== c.CLOSED){
        if (v.channel === dropfirst) {
          mousePos = [v.value.evt.clientX,v.value.evt.clientY];
          // normalize click coords
          // el.style.backgroundColor = rgba (x,y,0,0.5)
          el.innerHTML = (mousePos[0] + ', ' + mousePos[1] + ' - ' +
            clickPos[0] + ', ' + clickPos[1]);
        }
        else {
          break;
        }
      };


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
