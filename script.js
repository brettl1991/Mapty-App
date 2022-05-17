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

class Workout {
  //date when the obj was created
  date = new Date();
  //unique id to use later
  id = (Date.now() + '').slice(-10); //converting into number
  constructor(coords, distance, duration) {
    // this.date=...
    // this.id=...
    this.coords = coords; //[lat, lng]
    this.distance = distance; //for later this should be in km
    this.duration = duration; //for later this should be in minutes
  }
}

//child classes

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

//Implementing classes based on architecture-part-1
class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();

    //When we submitting the form, display marker exactly on the coordinates where we clicked before
    form.addEventListener('submit', this._newWorkout.bind(this)); //when you working with eventlisteners in a class need to use binding with this all the time

    //When we change the type should change the lable from Candence to Elev Gain
    inputType.addEventListener('change', this._toggleElevationField);
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
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE; //we did this because we dont need this mapEvenet right here in this function, so copiing to a global variable so we can have access to it later
    //Rendering workout input form
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    //because this func did not use this keyword we do not need to bind up there
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    //Helper functions(validInputs, allPositive)
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp)); //looping through the array and check if the input is a number or not

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    //Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; //convert to number
    const duration = +inputDuration.value;
    //destructure objects from mapEvent
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //If workout is running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        //or
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers'); //if distance is not a number

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    //If workout is cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      console.log('elevation', elevation);
      //Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    //Add new object to the workout array
    this.#workouts.push(workout);
    console.log(workout); //Running {date: Tue May 17 2022 13:30:01 GMT+0100 (British Summer Time), id: '2790601559', coords: Array(2), distance: 2, duration: 22, …}

    //Render workout on map as a marker
    this.renderWorkoutMarker(workout);

    //Render workout on list

    //Hide form and Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }
  renderWorkoutMarker(workout) {
    L.marker(workout.coords) //L.marker creates the marker, .addTo add the marker to the map, ..bindPopup will create a popup and binded to the marker
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent('workout')
      .openPopup();
  }
}

const app = new App();
