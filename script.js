'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let map, mapEvent;

//Implementing classes based on architecture-part-1
class App {
  #map;
  #mapEvent;
  constructor() {
    this._getPosition();
  }

  _getPosition() {
    //using geo location
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        //this func takes 2 callback funcs, 1 is the success callback: once the browser succesfully got the coordiantes of the current position of the user and the 2nd is the error func: when we get an error while getting the coordinates

        function () {
          alert('Could not get your position');
        }
      );
  }
  _loadMap(position) {
    // console.log(position);

    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/${latitude},${longitude}`);

    const coords = [latitude, longitude];

    //Displaying a map using leaflet library
    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      //L. is stands for leaflet namespace
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Display a marker on the map wherever we click
    //getting  different coords from where we click
    //this coming from leaflet as map above called from L.map(...), because addEventlistener not working here because of the library
    this.#map.on('click', function (mapE) {
      this.#mapEvent = mapE; //we did this because we dont need this mapEvenet right here in this function, so copiing to a global variable so we can have access to it later
      //Rendering workout input form
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  }

  _showForm() {}
  _toggleElevationField() {}
  _newWorkout() {}
}

const app = new App();

//When we submitting the form, display marker exactly on the coordinates where we clicked before
form.addEventListener('submit', function (e) {
  e.preventDefault();

  //Clear input fields
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';

  console.log(mapEvent);
  //destructure objects from mapEvent
  const { lat, lng } = mapEvent.latlng;
  L.marker([lat, lng]) //L.marker creates the marker, .addTo add the marker to the map, ..bindPopup will create a popup and binded to the marker
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});

//When we change the type should change the lable from Candence to Elev Gain
inputType.addEventListener('change', function () {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
