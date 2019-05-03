// Keep track of the position of all blobs
let positions = [];
// Keep track centers over time
let squares = [];
// Contact Distance Threshold, need to recalibrate to determin the actual value
let dThreshold = 500;

//--------------------visuals by Mingna------------------------------
//array of stars
let starArray = []
let stars = [];

// a toggle to check distance
let startMoving = false;

// number of stars
let starsNum = 100;
let counter = 0;

//space key to turn on/off drawing
let rippleSwitch = false;



function setup() {
  createCanvas(windowWidth, windowHeight);
  // Set-up OSC communication
  // 12000 is the port number for receiving data
  // 3334 is the port number for sending data
  setupOsc(12000, 3334);
  rectMode(CENTER);
  noCursor();

  background(0);
}

function draw() {
  // background(0);
  // noStroke();




  // Only average 120 frames worth of centers
  if (squares.length > 10) squares.shift();

  // Calculate center of all positions in this frame
  let center = getAvg(positions);
  squares.push(center);

  // Calculate average center over time
  let avgCenter = getAvg(squares);

  // Calculate the distance of each point to the center
  // And store them in an array
  let ds = [];
  for (let pos of positions) {
    let d = dist(pos.x, pos.y, avgCenter.x, avgCenter.y);
    ds.push(d);
  }
  // Sort distances in ascending order
  ds.sort(function (a, b) {
    return a < b;
  });

  //if the distance between the two blobs to their center is smaller than a threshold
  //then we think they have "contacted"
  //if (ds.length >= 2) {
  // console.log("two people!");
  // console.log(ds);
  //if (ds[0] <= dThreshold) {
  //draw ripple at center avgCenter.x, avgCenter.y
  //console.log("contacted!");
  if (positions.length == 1 && frameCount % 300 == 0) {
    console.log("contacted");
    if (rippleSwitch) {
      drawRipple(avgCenter.x, avgCenter.y);
    }
  }
  //}
  //}




  //----------------------draw ripples----------------
  background(0);

  //translate(width/2, height/2);
  for (let x = 0; x < starArray.length; x++) {
    stars = starArray[x];
    for (let i = 0; i < stars.length; i++) {
      // console.log("Hi")
      // stars show up
      stars[i].display();
      // if distance is shorter than the setting
      if (startMoving) {
        //reverse direction
        stars[i].moveFaster();
        // check if stars reach to center
        if (stars[i].reverseFinished()) {
          // stay at center
          stars[i].reverseReset()
        }
      } else {
        // if distance is longer than the setting, move outward
        // console.log("move")
        stars[i].move();


        stars[i].stop();



        // console.log(stars[1].x, stars[1].y)
        // if stars are trapped at center
        // if (stars[i].reverseFinished()) {
        //   // move outward
        //   stars[i].reset()
        // }
        // if stars reach to the edge of screen, reset from center
        // if (stars[i].finished()) {
        //   stars[i].reset();
        // }
      }

    }

  }

  // Draw all the blob positions for testing purposes
  // for (let pos of positions) {
  fill('red');
  //ellipse(avgCenter.x, avgCenter.y, 50, 50);
  // }

}

// Get data from Processing sketch
// Values will return an array of comma-delimited x,y values as strings.
// e.g. ['24, 356', '973, 12', '187, 44']
function receiveOsc(address, values) {
  // console.log("received OSC: " + address + "\t" + values.length);
  // Look for messages addressed to '/centers'
  if (address == '/centers') {
    // If there's data, empty out the positions array
    positions = [];
    // Forget it if there's nothing
    if (values[0] == undefined) return;
    // Iterate through values array
    for (let value of values) {
      // For each value: 'x, y'... create a 2-position array
      // to store x and y separately: [x, y]
      let xy = value.split(',');
      x = int(xy[0]);
      y = int(xy[1]);
      // Turn it into an object literal
      positions.push({
        x: x,
        y: y
      });
    }
  }
}

// Ability to send messages back to Processing
// We're not using this
function sendOsc(address, value) {
  socket.emit('message', [address].concat(value));
}

// Set-up the port number
function setupOsc(oscPortIn, oscPortOut) {
  var socket = io.connect('http://127.0.0.1:8081', {
    port: 8081,
    rememberTransport: false
  });
  socket.on('connect', function () {
    socket.emit('config', {
      server: {
        port: oscPortIn,
        host: '127.0.0.1'
      },
      client: {
        port: oscPortOut,
        host: '127.0.0.1'
      }
    });
  });
  socket.on('message', function (msg) {
    //console.log(msg);
    // msg is an array: ['/centers', '345, 56', '87, 19']
    // First item in msg array is going to be the address: '/centers'
    // Rest of message will be data values: 'x, y' positions
    receiveOsc(msg[0], msg.splice(1));
  });
}

function drawRipple(x, y) {
  //Mingna can add code here to draw ripples according to the x, y
  // create star objects and put them in an array
  //console.log("drawing!");
  newStarArray = []
  for (let i = 0; i <= starsNum; i++) {
    newStarArray[i] = new Star(x, y);
  }
  starArray.push(newStarArray)
  // console.log(starArray);

}


function keyPressed() {
  if (keyCode === 32) {
    rippleSwitch = !rippleSwitch;
    if (rippleSwitch) {
      console.log("switch on");
    } else {
      console.log("switch off");
    }
  }
}