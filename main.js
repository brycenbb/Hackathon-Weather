const WEATHER_API_KEY = '43a4fc1d57ca43ffdcb19646a9f234c4';
const GEO_API_KEY = 'a98bae49701c2502e5e98960101729cc';
const celcius = '\u2103';
const faren = '\u2109';
let metric = true;

Number.prototype.round = function (places) {
  return +(Math.round(this + 'e+' + places) + 'e-' + places);
};
//PLAN: Display todays weather + 5 day forecast. Enter a location and it shows that <=. Option to change between C and F.
document.getElementById('convert').onclick = convertCF;

//Form submission, getting search info, reset form for next search.
document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  let searchInput = document.getElementById('input').value;
  document.getElementById('form').reset();
  //Get LAT/LON
  getInfo(searchInput);
});
//Defaults to metric units, need to add conversion to imperial later.
async function getInfo(search) {
  let geoCall = await fetch(
    `http://api.positionstack.com/v1/forward?access_key=a98bae49701c2502e5e98960101729cc&query=${search}&limit=1`,
    {
      mode: 'cors',
    }
  );
  let geojson = await geoCall.json();
  let lat = geojson.data[0].latitude;
  let lon = geojson.data[0].longitude;
  let fullLocation = geojson.data[0].label;
  let weatherCall = await fetch(
    `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&&units=metric&appid=43a4fc1d57ca43ffdcb19646a9f234c4`
  );
  console.log('starting second json call');
  let weatherjson = await weatherCall.json();
  console.log(fullLocation, weatherjson);
  populateCards(fullLocation, weatherjson);
}

function populateCards(name, inputObj) {
  //populates current date info before doing the forecast
  let objectCurr = inputObj.current;
  console.log('inputObj', inputObj);
  let unixTime = objectCurr.dt;
  let date = new Date(unixTime * 1000).toLocaleDateString('en-GB');
  let time = new Date(unixTime * 1000).toLocaleTimeString('en-GB');
  let cardArr = document.querySelectorAll('.card');
  console.log(date, time);
  console.log(cardArr);
  //Populating first card (current, sunset,type of weather(ie:cloudy))
  let currCard = cardArr[0];
  let tempDiv = document.createElement('div');
  tempDiv.classList.add('temperature');
  let sunsetDiv = document.createElement('div');
  let typeDiv = document.createElement('div');
  tempDiv.textContent = objectCurr.feels_like + celcius;
  sunsetDiv.textContent = `Sunset at: ${new Date(
    objectCurr.sunset * 1000
  ).toLocaleTimeString('en-GB')}`;
  typeDiv.textContent = objectCurr.weather[0].main;
  currCard.appendChild(tempDiv);
  currCard.appendChild(sunsetDiv);
  currCard.appendChild(typeDiv);

  changeBackground(objectCurr);

  //Populating the rest of the cards
  populateForcast(cardArr, inputObj);

  //test to see what daily array really is,why are there 8 days??? Answer: it gives Mon-Mon, which is 8 days.
  // for (let i = 0; i < inputObj.daily.length; i++) {
  //   let date2 = new Date(inputObj.daily[i].dt * 1000).toLocaleString('en-GB');
  //   console.log(i, date2);
  // }
}
function changeBackground(objectCurr) {
  if (objectCurr.weather[0].main.toLowerCase().includes('cloud')) {
    console.log('c1');
    document.body.style.backgroundImage = 'url(cloudy.gif)';
  } else if (objectCurr.weather[0].main.toLowerCase().includes('rain')) {
    console.log('c2');

    document.body.style.backgroundImage = 'url(rainy.gif)';
  } else if (objectCurr.weather[0].main.toLowerCase().includes('storm')) {
    document.body.style.backgroundImage = 'url(stormy.gif)';
    console.log('c3');
  } else {
    console.log('c4');

    document.body.style.backgroundImage = 'url(`sunny.gif`)';
  }
}
function populateForcast(cardArr, inputObj) {
  console.log(cardArr);

  for (let i = 1; i < cardArr.length; i++) {
    console.log('in loop', i);
    let currDay = inputObj.daily[i - 1];
    let currCard = cardArr[i];
    let tempDiv1 = document.createElement('div');
    let tempDiv2 = document.createElement('div');
    let tempDivH = document.createElement('div');
    let tempDivHtemp = document.createElement('div');
    let tempDivL = document.createElement('div');
    let tempDivLtemp = document.createElement('div');
    tempDivHtemp.textContent = 'High: ';
    tempDivLtemp.textContent = 'Low: ';
    tempDiv1.style.display = 'flex';
    tempDiv2.style.display = 'flex';
    tempDivH.classList.add('temperature');
    tempDivL.classList.add('temperature');
    tempDiv1.appendChild(tempDivHtemp);
    tempDiv1.appendChild(tempDivH);
    tempDiv2.appendChild(tempDivLtemp);
    tempDiv2.appendChild(tempDivL);
    let sunsetDiv = document.createElement('div');
    let typeDiv = document.createElement('div');
    tempDivH.textContent = currDay.temp.max + celcius;
    tempDivL.textContent = currDay.temp.min + celcius;
    sunsetDiv.textContent = `Sunset at: ${new Date(
      currDay.sunset * 1000
    ).toLocaleTimeString('en-GB')}`;
    typeDiv.textContent = currDay.weather[0].main;
    currCard.appendChild(tempDiv1);
    currCard.appendChild(tempDiv2);
    currCard.appendChild(sunsetDiv);
    currCard.appendChild(typeDiv);
  }
}

function convertCF() {
  //converting to F
  //get every element that has a temperature attached and change it
  let temperatureElements = document.querySelectorAll('.temperature');
  temperatureElements.forEach((element) => {
    console.log(element, element.textContent);
    //This doesnt work for the High: and Low: bits because of the extra text, could put it aroudn divs.
    let temp = Number(element.textContent.slice(0, -1));
    // console.log(temp);
    if (metric) {
      temp = temp * 1.8 + 32;
      temp = temp.round(2);

      element.textContent = temp + faren;
    } else {
      temp = (temp - 32) * 0.5556;
      temp = temp.round(2);

      element.textContent = temp + celcius;
    }
    console.log(element.textContent);
  });

  //conerting to C

  metric = !metric;
}
