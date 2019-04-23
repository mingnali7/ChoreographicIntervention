/*
Thomas Sanchez Lengeling
 http://codigogenerativo.com/
 
 How to use multiple Kinects v2 in the same sketch.
 Should work up n number of Kinects v2 connected to the USB 3.0 port.
 
 https://github.com/shiffman/OpenKinect-for-Processing
 http://shiffman.net/p5/kinect/
 */
// Kinect Library
import org.openkinect.processing.*;

// OpenCV Library
import gab.opencv.*;
import java.awt.Rectangle;

// OSC Communication Library
import oscP5.*;
import netP5.*;

// Kinect Stuff
final int NUM_CAMS = 2;
Kinect2 kinect2a, kinect2b;

//Distance parameters in mm
int MAX_D = 3800; //This should be distance to floor
int MIN_D = 500; //50cm

// Depth Map resolution
int RESOLUTION = 4;
int [][] shifts = { {35, 70}, {20, 70} };

final int WIDTH = 1920;
final int HEIGHT = 1080;
// This needs to be calibrated
final int CAM_WIDTH = 512;
final int CAM_CENTERX = CAM_WIDTH / 2;
final int CAM_HEIGHT = 424;
final int CAM_CENTERY = CAM_HEIGHT / 2;

// Horizonal FOV of Kinect in degrees
final float HFOV = 70.6;

// Scale camera data (mm) to pixels
// tan(35.3deg)*MAX_D*2 = width of camera in mm (~5400 mm)
float mm2px = 0.15; //abs(CAM_WIDTH / ((tan(degrees(HFOV/2))*MAX_D*2))); // Probably ~0.08;

// Scale camera resolution to projection resolution
float cam2proj = 2.0; //WIDTH/(CAM_HEIGHT*2);

// OpenCV Stuff
OpenCV opencv;
// Resolution of contour (1 is highest, 10 is lower)
int polygonFactor = 1;
// Contrast tolerance for detecting foreground v. background
int threshold = 10;
// How big the contour needs to be
int numPoints = 200;
// Off-screen canvas to draw the depth map point cloud data to
PGraphics pg;
// Image to feed to openCV
PImage img;

// OSC Stuff
OscP5 oscP5;
NetAddress host;

// Messages for centers
OscMessage centers;

void setup() {
  size(848, 512);
  //size(1920, 1080);
  //fullScreen();

  // Set-up OSC
  oscP5 = new OscP5(this, 8000);
  host = new NetAddress("127.0.0.1", 12000);
  centers = new OscMessage("/centers");


  // Set-up image objects to feed to OpenCV
  pg = createGraphics(CAM_HEIGHT*2, CAM_WIDTH);
  img = createImage(pg.width, pg.height, GRAY);

  // Set-up OpenCV
  opencv = new OpenCV(this, pg.width, pg.height);

  // Set-up Kinects 
  kinect2a = new Kinect2(this);
  kinect2a.initDepth();
  kinect2a.initDevice(0);

  kinect2b = new Kinect2(this);
  kinect2b.initDepth();
  kinect2b.initDevice(1);

  // Draw the background
  background(0);

  frameRate(25);
}

void draw() {
  background(0);
  // Clear OSC messages
  centers = new OscMessage("/centers");

  // Fire up the PGraphic
  pg.beginDraw();
  pg.rectMode(CENTER);
  pg.background(0);
  // Get depth for each camera
  // Draw the point cloud to the PGraphic
  pg.pushMatrix();
  pg.translate(CAM_CENTERY, CAM_CENTERX);
  pg.translate(shifts[0][0], shifts[0][1]);
  pg.scale(mm2px, -mm2px);
  pg.rotate(PI/2);

  getDepth(kinect2a);
  pg.popMatrix();

  pg.pushMatrix();
  pg.translate(CAM_HEIGHT + CAM_CENTERY, CAM_CENTERX);
  pg.translate(shifts[1][0], shifts[1][1]);
  pg.scale(mm2px, -mm2px);
  pg.rotate(-PI/2);
  getDepth(kinect2b);

  pg.popMatrix();
  pg.endDraw();

  // Transfer PGraphic data over into an PImage
  // openCV won’t accept PGraphic objects and your can’t draw directly to PImage objects

  // Load the pixels for pg and img into memory so you can use them.
  pg.loadPixels();
  img.loadPixels();
  // Set img pixel data equal to pg pixel data
  img.pixels = pg.pixels;
  img.updatePixels();
  text(frameRate, width/2, height/2 - 100);
  text(brightness(img.pixels[int(random(img.pixels.length))]), width/2, height/2);
  
  // Show depth camera image
  //image(img, 0, 0);

  // Send the PImage into OpenCV
  opencv.loadImage(img);
  opencv.gray();
  opencv.threshold(threshold);

  // Get some contours
  ArrayList<Contour>contours = opencv.findContours(false, false);
  //println(contours.size());

  pushMatrix();
  //scale(2, 2);
  //scale(cam2proj, cam2proj);
  for (Contour contour : contours) {
    // Set resolution of contour
    contour.setPolygonApproximationFactor(polygonFactor);
    if (contour.numPoints() > numPoints) {
      // If the contour is big enough
      stroke(255);
      beginShape();
      // Get the contour's bounding box
      Rectangle bb = contour.getBoundingBox();
      stroke(0, 200, 200);
      noFill();
      rect(bb.x, bb.y, bb.width, bb.height);
      // Calculate the center of the bounding box
      PVector center = new PVector(bb.x + bb.width/2, bb.y + bb.height/2);
      // Add the center to the locations message
      centers.add(center.x*cam2proj + "," + center.y*cam2proj);
      ellipse(center.x, center.y, 10, 10);
    }
  }
  popMatrix();


  // Send messages
  oscP5.send(centers, host);
  //}
}

void keyPressed() {
  if (keyCode == TAB) {
    Kinect2 kinect3a = kinect2a;
    Kinect2 kinect3b = kinect2b;
    kinect2a = kinect3b;
    kinect2b = kinect3a;
  }
  else if(keyCode == UP) {
   cam2proj += 0.1; 
  }
    else if(keyCode == DOWN) {
   cam2proj -= 0.1; 
  }

  
}
