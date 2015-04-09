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
  });
  c.putAsync(mvchan,{evt:undefined,el:undefined});
  var blurchan = c.chan(c.buffers.sliding(1));
  window.addEventListener('blur',function(e){
    console.log('blur');
    c.putAsync(blurchan,{evt:e,el:el});
  });
  c.putAsync(blurchan,{evt:undefined,el:undefined});
  var upchan = c.chan(c.buffers.sliding(1));
  window.addEventListener('mouseup',function(e){
    console.log('up');
    c.putAsync(upchan,{evt:e,el:el});
  });
  c.putAsync(upchan,{evt:undefined,el:undefined});



  var xform = xd.drop(1);

  function listen(el, type) {
    var ch = c.chan(c.buffers.sliding(0));
    el.addEventListener(type, function(e) {
      c.putAsync(ch, {evt:e, el:el});
    });
    return ch;
  }
  /*
  Need better listen function that will return
  a removeEventListener function so we can clean
  up the event listeners and delete channels.
  */

  c.go(function*() {

    var el = document.getElementById('el1');
    var clickch = listen(el,'mousedown');


    //var mousePos = [0,0];
    xnorm = 0;
    ynorm = 0;
    var clickPos = [0,0];
    // el.innerHTML = (xnorm + ', ' + ynorm + ' - ' +
    //   clickPos[0] + ', ' + clickPos[1]);
    el.style.backgroundColor = 'rgba(128,128,0,0.6)';
    while ((val = yield c.take(clickch)) !== c.CLOSED) {
      // clickPos = [val.evt.clientX, val.evt.clientY];
      // el.innerHTML = (xnorm + ', ' + ynorm + ' - ' +
      //   clickPos[0] + ', ' + clickPos[1]);

      /*
      Create an alts loop:

        If take of drop(1) of mousemove:
          update the inner html

        If take of mouseup:
          return control to parent loop
      */

      dropfirst = c.chan(c.buffers.sliding(1),xform);
      c.operations.pipe(mvchan,dropfirst);
      blurch = c.chan(c.buffers.sliding(1),xform);
      c.operations.pipe(blurchan,blurch);
      upch = c.chan(c.buffers.sliding(1),xform);
      c.operations.pipe(upchan,upch);

      // Also add a timeout of X seconds that will end this subroutine


      while ((v = yield c.alts([dropfirst,upch,blurch,clickch])) !== c.CLOSED){
        if (v.channel === dropfirst) {
          evt = v.value.evt;
          el = v.value.el;
          xnorm = (evt.clientX - el.offsetLeft)/el.clientWidth;
          ynorm = (evt.clientY - el.offsetTop)/el.clientHeight;
          // Bound values between 0 and 1
          xnorm = Math.max(0,Math.min(xnorm,1));
          ynorm = Math.max(0,Math.min(ynorm,1));
          // normalize click coords
          el.style.backgroundColor = 'rgba('+Math.round(255*xnorm)+','+Math.round(255*ynorm)+',0,0.6)';
          // el.innerHTML = (xnorm + ', ' + ynorm + ' - ' +
          //   clickPos[0] + ', ' + clickPos[1]);
        }
        else {
          dropfirst.close();
          blurch.close();
          upch.close();
          // callRemoveEventListener functions to clean up
          break;
        }
      }
      // yield c.take(subroutineFinished);
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
