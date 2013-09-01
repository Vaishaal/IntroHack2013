var drawTimeout = null;
document.addEventListener('DOMContentLoaded', function(){
  var v = document.getElementById('v');
  var canvas = document.getElementById('c');
  var context = canvas.getContext('2d');
  var back = document.createElement('canvas');
  var backcontext = back.getContext('2d');
  var cw,ch;

  v.addEventListener('play', function(){
    cw = v.clientWidth;
    ch = v.clientHeight;
    canvas.width = cw;
    canvas.height = ch;
    back.width = cw;
    back.height = ch;
    draw(v,context,backcontext,cw,ch,1);
  },false);

},false);

function draw(v,c,bc,w,h,value) {
  if(v.paused || v.ended) return false;
  // First, draw it into the backing canvas
  try {
    /*
     * Firefox seems to screw up sometimes; even after `play`, `playing`
     * and `canplay` events have been fired on the <video>, it throws
     * an error on drawImage. If that happens, just wait it out.
     * https://bugzilla.mozilla.org/show_bug.cgi?id=771833
     */
    bc.drawImage(v,0,0,w,h);
  } catch (e) {
    drawTimeout = setTimeout(function(){ draw(v,c,bc,w,h,value); }, 0);
    return;
  }
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
