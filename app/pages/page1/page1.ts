import {Page} from 'ionic-angular';
import {Geolocation} from 'ionic-native';
import {Alert, NavController} from 'ionic-angular';

@Page({
  templateUrl: 'build/pages/page1/page1.html',
})
export class Page1 {

  msg: string = "Push the button";
  locations: number[] = [];
  locationStrings: string[] = [];
  counter = 0;
  pathName: string = "";
  watch = Geolocation.watchPosition();
  baseUrl = 'https://n6bj40equrg.firebaseio-demo.com/';
  //  myDataRef = new Firebase('https://n6bj40equrg.firebaseio-demo.com/test/');
  myDataRef;
  subscription;
  startPos;
  distance: number = 0;

  constructor(public nav: NavController) {

  }

  openFirebase() {
    this.myDataRef = new Firebase(this.baseUrl + this.pathName + "/");
  }

  onRemove() {

    let confirm = Alert.create({
      title: 'Are you sure?',
      message: 'Do you want to permanently delete this path?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            //console.log('Disagree clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.openFirebase();
            this.myDataRef.remove();
          }
        }
      ]
    });
    this.nav.present(confirm);
  }

  onClick() {
    Geolocation.getCurrentPosition().then(pos => {
      this.startPos = pos;
      this.openFirebase();
      this.msg = ('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
      this.locations.push(pos.coords.latitude);
      this.locations.push(pos.coords.longitude);
      this.locationStrings.push(this.msg)

      //myDataRef.set('User ' + name + ' says ' + text);
      //myDataRef.set({name: name, text: text});
      var d = new Date();
      this.myDataRef.push({ time: d.getTime(), lat: pos.coords.latitude, lon: pos.coords.longitude });
      //var message = snapshot.val();
      //displayChatMessage(message.name, message.text);
    });
  }

  onStart() {
    this.subscription = this.watch.subscribe(pos => {
      //console.log('lat: ' + pos.coords.latitude + ', lon: ' + pos.coords.longitude);
      this.openFirebase();
      var d = new Date();
      this.myDataRef.push({ counter: this.counter, time: d.getTime(), lat: pos.coords.latitude, lon: pos.coords.longitude });
      this.counter++;
      this.distance = this.calculateDistance(
        this.startPos.coords.latitude,
        this.startPos.coords.longitude,
        pos.coords.latitude,
        pos.coords.longitude
      )
    }, e => console.log('onError: %s', e));

  }

  onStop() {
  }
    calculateDistance(lat1, lon1, lat2, lon2) {
      var R = 6371; // km
      var dLat = (lat2 - lat1).toRad();
      var dLon = (lon2 - lon1).toRad();
      var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      var d = R * c;
      return d;
    }
  
}
	Number.prototype.toRad = function() {
		return this * Math.PI / 180;
	};
