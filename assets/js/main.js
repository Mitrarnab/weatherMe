const navSearch = document.querySelector('.navSearch');
const navSearchBtn = document.querySelector('.navSearchBtn');
const themeBox = document.querySelector('.themeBox');
const checkbox = document.querySelector('#checkbox');
const timeformatter = document.querySelector('.timeformatter');
const tempBoxToggler = document.querySelector('.toggle-switch');
const tempInp = document.querySelector('.tempInp');
const tempInpSpan = document.querySelector('.tempInpSpan');

// Initialize slick carousel
const slickFill = (startIndex = 0) => {
    $('.dailyfrcst').slick({
        infinite: true,
        slidesToShow: 7,
        slidesToScroll: 1,
        initialSlide: startIndex,
        arrows: false,
        responsive: [
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 5,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 4,
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 3,
                }
            },
            {
                breakpoint: 426,
                settings: {
                    slidesToShow: 2,
                }
            }
        ]
    });
};

// Load setup
window.onload = () => {
    document.body.classList.toggle('darkMode', localStorage.getItem("weatherMode") === 'dark');
    checkbox.checked = document.body.classList.contains('darkMode');

    const isCelsius = localStorage.getItem("celsius") === 'true';
    tempInp.checked = !isCelsius;
    tempInpSpan.textContent = isCelsius ? 'C' : 'F';
    searchData('kolkata');
};

// Search functionality
const searchData = (area) => {
    document.querySelector('.loader').style.display = 'flex';
    const key = 'ce2e576b68634d78985102848240811'
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${area}&aqi=yes&alerts=yes&days=2`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error.message);
            }
            dataFill(data);
        })
        .catch(error => {
            alert(error.message);
        })
        .finally(() => {
            setTimeout(() => document.querySelector('.loader').style.display = 'none', 500);
        });
};

// Handle theme toggle
themeBox.addEventListener('click', () => {
    document.body.classList.toggle('darkMode', checkbox.checked);
    localStorage.setItem("weatherMode", checkbox.checked ? "dark" : "light");
});

// Handle temperature toggle
tempBoxToggler.addEventListener('click', () => {
    const isCelsius = tempInp.checked;
    tempInpSpan.textContent = isCelsius ? 'F' : 'C';
    localStorage.setItem("celsius", !isCelsius);
    searchData(document.querySelector('.Locality').textContent);
});

// Handle search button visibility
navSearch.addEventListener('keyup', () => {
    navSearchBtn.classList.toggle('notHide', navSearch.value.length > 0);
});

// Handle search button click
navSearchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchData(navSearch.value.trim());
    navSearch.value = '';
});

// Fill data function
const dataFill = (data) => {
    const isCelsius = localStorage.getItem("celsius") === 'true';
    document.querySelector('.Locality').textContent = data.location.name;
    document.querySelector('.country').textContent = data.location.country;
    document.querySelector('.timeBox').textContent = formatTime(data.location.localtime);
    document.querySelector('.dateBox').textContent = formatDate(data.forecast.forecastday[0].date);
    document.querySelector('.temparatureNow').textContent = isCelsius ? data.current.temp_c : data.current.temp_f;
    document.querySelector('.tempIn').textContent = isCelsius ? 'C' : 'F';
    document.querySelector('.feelTemp').textContent = isCelsius ? data.current.feelslike_c : data.current.feelslike_f;
    document.querySelector('.feelTempIn').textContent = isCelsius ? 'C' : 'F';
    document.querySelector('.sunrise').textContent = data.forecast.forecastday[0].astro.sunrise;
    document.querySelector('.sunset').textContent = data.forecast.forecastday[0].astro.sunset;
    document.querySelector('.conditionImg').src = `assets/images/icon/${data.current.condition.code}${data.current.is_day}.png`;
    document.querySelector('.conditionText').textContent = data.current.condition.text;
    backgroundChanger(data.current.condition.text + data.current.is_day);
    document.querySelector('.humidity').textContent = data.current.humidity;
    document.querySelector('.wind_kph').textContent = data.current.wind_kph;
    document.querySelector('.pressure_mb').textContent = data.current.pressure_mb;
    document.querySelector('.pressure_mbTomorrow').textContent = data.current.pressure_mb;
    document.querySelector('.uv').textContent = data.current.uv;

    // fillHourlyForecast(data.forecast.forecastday[0].hour, isCelsius);
    const currentTime = new Date(data.location.localtime).getHours();

    // Find the index of the current hour in the forecast data
    const hourlyData = data.forecast.forecastday[0].hour;
    const currentHourIndex = hourlyData.findIndex(hour => new Date(hour.time).getHours() === currentTime);

    fillHourlyForecast(hourlyData, isCelsius);

    if ($('.dailyfrcst').hasClass('slick-initialized')) {
        $('.dailyfrcst').slick('unslick');
    }
    slickFill(currentHourIndex + 1);

    fillTomorrowForecast(data.forecast.forecastday[1], isCelsius);


    const dailyfrcst = $('.dailyfrcst');

    if (dailyfrcst.hasClass('slick-initialized')) {
        dailyfrcst.slick('refresh');
    } else {
        dailyfrcst.slick({
            infinite: true,
            slidesToShow: 3,
            slidesToScroll: 3
        });
    }

};

// Format time
const formatTime = (time) => {
    const [date, hour] = time.split(' ');
    return hour;
};

// Format date
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
    }).format(new Date(date));
};

// Fill hourly forecast
const fillHourlyForecast = (hourlyData, isCelsius) => {
    const dailyfrcst = document.querySelector('.dailyfrcst');
    dailyfrcst.innerHTML = hourlyData.map(hour => `
        <div class="forcastBox">
            <div class="card m-auto d-flex flex-column align-items-center justify-content-center ${hour.is_day ? 'hourDay' : 'hourNight'}">
                <div class="hrTime fw-bold text-center">${hour.time.split(' ')[1]}</div>
                <div class="hrlcondBox">
                    <img src="assets/images/icon/${hour.condition.code}${hour.is_day}.png" class="conditionImg">
                </div>
                <div class="hrtmpS text-center">${isCelsius ? hour.temp_c : hour.temp_f}°${isCelsius ? 'C' : 'F'}</div>
            </div>
        </div>
    `).join('');
};

// Fill tomorrow's forecast
const fillTomorrowForecast = (tomorrow, isCelsius) => {
    document.querySelector('.tomorrowTemp').textContent = `${isCelsius ? tomorrow.day.avgtemp_c : tomorrow.day.avgtemp_f}°${isCelsius ? 'C' : 'F'}`;
    document.querySelector('.tomorrowDay').textContent = tomorrow.day.condition.text;
    document.querySelector('.dateTomorrow').textContent = formatDate(tomorrow.date);
    document.querySelector('.conditionTom').src = `assets/images/icon/${tomorrow.day.condition.code}1.png`;
    document.querySelector('.sunriseTom').textContent = tomorrow.astro.sunrise;
    document.querySelector('.sunsetTom').textContent = tomorrow.astro.sunset;
    document.querySelector('.humidityTomorrow').textContent = tomorrow.day.avghumidity;
    document.querySelector('.wind_kphTomorrow').textContent = tomorrow.day.maxwind_kph;
    document.querySelector('.uvTomorrow').textContent = tomorrow.day.uv;
    // console.log(tomorrow.day.uv)
    console.log(tomorrow)
};

// AM/PM - 24 hours 
timeformatter.addEventListener('click', function () {
    const timeBox = document.querySelector('.timeBox');
    timeBox.textContent = timeformatter.textContent === "AM/PM"
        ? formatTo12Hour(timeBox.textContent)
        : formatTo24Hour(timeBox.textContent);
    timeformatter.textContent = timeformatter.textContent === "AM/PM" ? "24-HOUR" : "AM/PM";
});
function formatTo12Hour(time) {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function formatTo24Hour(time) {
    let [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${minutes}`;
}

// background changer 
const backgroundMap = {
    "Sunny1": "sunny.jpg",
    "Clear0": "clear.jpg",
    "Mist1": "mist1.jpg",
    "Mist0": "mist0.jpg",
    "Fog1": "foggyday.jpg",
    "Freezing fog1": "foggyday.jpg",
    "Fog0": "foggynight.jpg",
    "Freezing fog0": "foggynight.jpg",
    "Cloudy1": "cloudyday.jpg",
    "Partly cloudy1": "cloudyday.jpg",
    "Cloudy0": "cloudyNight.jpg",
    "Partly cloudy0": "cloudyNight.jpg",
    "Overcast1": "overcastday.jpg",
    "Patchy rain possible1": "overcastday.jpg",
    "Patchy sleet possible1": "overcastday.jpg",
    "Light rain1": "overcastday.jpg",
    "Overcast0": "overcastnight.jpg",
    "Patchy rain possible0": "overcastnight.jpg",
    "Patchy sleet possible0": "overcastnight.jpg",
    "Light rain0": "overcastnight.jpg",
    "Patchy snow possible1": "snowday.jpg",
    "Patchy freezing drizzle possible1": "snowday.jpg",
    "Patchy light snow1": "snowday.jpg",
    "Light snow1": "snowday.jpg",
    "Patchy moderate snow1": "snowday.jpg",
    "Patchy snow possible0": "snownight.jpg",
    "Patchy freezing drizzle possible0": "snownight.jpg",
    "Patchy light snow0": "snownight.jpg",
    "Light snow0": "snownight.jpg",
    "Patchy moderate snow0": "snownight.jpg",
    "Thundery outbreaks possible1": "thunderday.jpg",
    "Patchy light rain with thunder1": "thunderday.jpg",
    "Moderate or heavy rain with thunder1": "thunderday.jpg",
    "Thundery outbreaks possible0": "thundernight.jpg",
    "Patchy light rain with thunder0": "thundernight.jpg",
    "Moderate or heavy rain with thunder0": "thundernight.jpg",
    "Blowing snow1": "snowfallDay.jpg",
    "Blizzard1": "snowfallDay.jpg",
    "Moderate snow1": "snowfallDay.jpg",
    "Patchy heavy snow1": "snowfallDay.jpg",
    "Heavy snow1": "snowfallDay.jpg",
    "Ice pellets1": "snowfallDay.jpg",
    "Patchy light snow with thunder1": "snowfallDay.jpg",
    "Blowing snow0": "snowfallNight.jpg",
    "Blizzard0": "snowfallNight.jpg",
    "Moderate snow0": "snowfallNight.jpg",
    "Patchy heavy snow0": "snowfallNight.jpg",
    "Heavy snow0": "snowfallNight.jpg",
    "Ice pellets0": "snowfallNight.jpg",
    "Patchy light snow with thunder0": "snowfallNight.jpg",
    "Patchy light drizzle1": "rainDay.jpg",
    "Light drizzle1": "rainDay.jpg",
    "Freezing drizzle1": "rainDay.jpg",
    "Heavy freezing drizzle1": "rainDay.jpg",
    "Patchy light rain1": "rainDay.jpg",
    "Patchy light drizzle0": "rainNight.jpg",
    "Light drizzle0": "rainNight.jpg",
    "Freezing drizzle0": "rainNight.jpg",
    "Heavy freezing drizzle0": "rainNight.jpg",
    "Patchy light rain0": "rainNight.jpg",
    "Moderate rain at times1": "rainyDay.jpg",
    "Moderate rain1": "rainyDay.jpg",
    "Heavy rain at times1": "rainyDay.jpg",
    "Heavy rain1": "rainyDay.jpg",
    "Light freezing rain1": "rainyDay.jpg",
    "Moderate or heavy freezing rain1": "rainyDay.jpg",
    "Light sleet1": "rainyDay.jpg",
    "Moderate or heavy sleet1": "rainyDay.jpg",
    "Moderate rain at times0": "rainyNight.jpg",
    "Moderate rain0": "rainyNight.jpg",
    "Heavy rain at times0": "rainyNight.jpg",
    "Heavy rain0": "rainyNight.jpg",
    "Light freezing rain0": "rainyNight.jpg",
    "Moderate or heavy freezing rain0": "rainyNight.jpg",
    "Light sleet0": "rainyNight.jpg",
    "Moderate or heavy sleet0": "rainyNight.jpg",
    "Light rain shower1": "rainshowerday.jpg",
    "Moderate or heavy rain shower1": "rainshowerday.jpg",
    "Torrential rain shower1": "rainshowerday.jpg",
    "Light sleet showers1": "rainshowerday.jpg",
    "Moderate or heavy sleet showers1": "rainshowerday.jpg",
    "Light rain shower0": "rainshowernight.jpg",
    "Moderate or heavy rain shower0": "rainshowernight.jpg",
    "Torrential rain shower0": "rainshowernight.jpg",
    "Light sleet showers0": "rainshowernight.jpg",
    "Moderate or heavy sleet showers0": "rainshowernight.jpg",
    "Light snow showers1": "snowsday.jpg",
    "Moderate or heavy snow showers1": "snowsday.jpg",
    "Light showers of ice pellets1": "snowsday.jpg",
    "Moderate or heavy showers of ice pellets1": "snowsday.jpg",
    "Moderate or heavy snow with thunder1": "snowsday.jpg",
    "Light snow showers0": "snowsnight.jpg",
    "Moderate or heavy snow showers0": "snowsnight.jpg",
    "Light showers of ice pellets0": "snowsnight.jpg",
    "Moderate or heavy showers of ice pellets0": "snowsnight.jpg",
    "Moderate or heavy snow with thunder0": "snowsnight.jpg"
};

function backgroundChanger(background) {
    if (backgroundMap[background]) {
        document.body.style.backgroundImage = `url(assets/images/background/${backgroundMap[background]})`;
    } else {
        console.log(`${background} not found in the mapping.`);
    }
}

// Function to check if a string exists in any of the arrays
function findStringInArrays(searchString, ...arrays) {
    const foundInArrays = arrays.map((array, index) => {
        if (array.includes(searchString)) {
            return `Array ${index + 1}`;
        }
        return null;
    }).filter(Boolean);

    return foundInArrays.length ? foundInArrays : null;
}