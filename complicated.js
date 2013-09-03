
var drawTimeout = null;	
// ideally, we wouldn't need `running` since the `play` event on the <video>
// would fire after the stream was setup, but this is not the case in Firefox.
var running = false;
document.addEventListener('DOMContentLoaded', function(){
  var v = document.getElementById('v');
  var canvas = document.getElementById('c');
  var context = canvas.getContext('2d');
  var back = document.createElement('canvas');
  var backcontext = back.getContext('2d');
  var cw,ch;

  v.addEventListener('play', function(){
    var dimensions = setDimensions(v, canvas, back);
    cw = dimensions.w, ch = dimensions.h;
    draw(v,context,backcontext,cw,ch,1);
  },false);

},false);

function setDimensions(v,canvas,back) {
  cw = v.clientWidth;
  ch = v.clientHeight;
  canvas.width = cw;
  canvas.height = ch;
  back.width = cw;
  back.height = ch;
  return { w : cw, h : ch };
}

function draw(v,c,bc,w,h,value) {
  if(v.paused || v.ended) { return false; }
  // First, draw it into the backing canvas
  try {
    bc.drawImage(v,0,0,w,h);
  } catch (e) {
    /*
     * Firefox seems to screw up sometimes; even after `play`, `playing`
     * and `canplay` events have been fired on the <video>, it throws
     * an error on drawImage. If that happens, just wait it out.
     */
    console.log(e);
    drawTimeout = setTimeout(function(){ draw(v,c,bc,w,h,value); }, 0);
    return;
  }
  if (!running) { // first time we succeeded in drawing video to canvas
    // in Firefox, video size sometimes changes
    var dimensions = setDimensions(v, c.canvas, bc.canvas);
    w = dimensions.w, h = dimensions.h;
  }
  running = true;

  // Grab the pixel data from the backing canvas
  var idata = bc.getImageData(0,0,w,h);
  var data = idata.data;
  // Loop through the pixels, turning them grayscale
  for(var i = 0; i < data.length; i+=4) {
    var r = data[i];
    var g = data[i+1];
    var b = data[i+2];
    var brightness = (3*r+4*g+b)>>>3;
    data[i] = r * vidData[0] * vidData[1];
    data[i+1] = g * vidData[0] * vidData[2];
    data[i+2] = b * vidData[0] * vidData[3];
  }
  idata.data = data;
  // Draw the pixels onto the visible canvas
  c.putImageData(idata,0,0);
  // Start over!
  drawTimeout = setTimeout(function(){ draw(v,c,bc,w,h,value); }, 0); 
}
function download() { 
    var canvas = document.getElementById("c");
    var img    = canvas.toDataURL("image/jpg");
    window.open(
      img,
      '_blank' // <- This is what makes it open in a new window.
    );
}
