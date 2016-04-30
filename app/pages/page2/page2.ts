import {Page} from 'ionic-angular';
import {Geolocation} from 'ionic-native';

@Page({
  templateUrl: 'build/pages/page2/page2.html',
})
export class Page2 {
  pathName: string = "";
  baseUrl = 'https://n6bj40equrg.firebaseio-demo.com/';
  //  myDataRef = new Firebase('https://n6bj40equrg.firebaseio-demo.com/test/');
  myDataRef;
  minLat: number = 1000;
  minLon: number = 1000;
  maxLat: number = -1000;
  maxLon: number = -1000;
  canvasSize: number = 250;
  width: number;
  height: number;
  canvas;

  constructor() {
    //    this.canvas = document.getElementById("myCanvas");
  }

  openFirebase(): boolean {
    if(!this.pathName || this.pathName.trim() == ""){
      alert ("Please enter a path name.");
      return false;
    }
    this.myDataRef = new Firebase(this.baseUrl + this.pathName + "/");
    return true;
  }

  findLimits(readings: any[]) {
    for (let reading in readings) {
      let lat: number = readings[reading].lat;
      let lon: number = readings[reading].lon;
      if (lat < this.minLat) { this.minLat = lat; }
      if (lon < this.minLon) { this.minLon = lon; }
      if (lat > this.maxLat) { this.maxLat = lat; }
      if (lon > this.maxLon) { this.maxLon = lon; }
    }
    this.width = this.maxLat - this.minLat;
    this.height = this.maxLon - this.minLon;
    if(this.width < this.height){
      this.width = this.height;
    }else{
      this.height = this.width;
    }
  }

  getCoords(reading) {
    let x = reading.lat - this.minLat;
    let y = reading.lon - this.minLon;
    x = x / this.width * this.canvasSize;
    y = y / this.height * this.canvasSize;
    return { x, y };
  }

  drawIt(readings: any) {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var first = true;
    for (let reading in readings) {
      var loc = this.getCoords(readings[reading]);
      //      console.log(loc);
      if (first) {
        first = false;
        ctx.moveTo(loc.x, loc.y);
      } else {
        ctx.lineTo(loc.x, loc.y);
      }
      ctx.stroke();
    }
    ctx.stroke();
  }

  drawItSlowly(readings: any) {
    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var first = true;
    var i=1;
    var locs = [];
    var timer;
    for (let reading in readings) {
      locs.push(this.getCoords(readings[reading]));
    }
    ctx.moveTo(locs[0].x, locs[0].y);
    timer = setInterval(
      ()=>{
        console.log(i + " < " + locs.length)
        if(i < locs.length){
          ctx.lineTo(locs[i].x, locs[i].y);
          ctx.stroke();
          i++;
        }else{
        clearInterval(timer);
        }
      }, 300 
    )
  }

  onDraw() {
    if(!this.openFirebase()){
      return;
    }
    this.myDataRef.on("value", (snapshot) => {
      this.findLimits(snapshot.val())
      // console.log("minLat = " + this.minLat);
      // console.log("minLon = " + this.minLon);
      // console.log("maxLat = " + this.maxLat);
      // console.log("maxLon = " + this.maxLon);
      this.drawItSlowly(snapshot.val());
    }, function (errObject) {
      console.log("Failed: " + errObject.code);
    })

  }
}
