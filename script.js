const apiKey = '62a9d80824d4d167625895ff6be6269d';

function getWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) return alert("Enter a city name!");
  fetchWeather(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
  getForecast(city);
}

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeather(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
    }, () => {
      alert("Unable to get your location.");
    });
  } else {
    alert("Geolocation not supported.");
  }
}

function fetchWeather(url) {
  const resultDiv = document.getElementById('weatherResult');
  resultDiv.innerHTML = "<p>Loading...</p>";
  fetch(url)
    .then(response => response.json())
    .then(data => {
      showWeather(data);
      speakWeather(`In ${data.name}, it is ${data.main.temp} degrees Celsius with ${data.weather[0].description}.`);
      updateBackground(data.weather[0].main.toLowerCase());
      showTip(data.weather[0].main.toLowerCase());
    })
    .catch(() => resultDiv.innerHTML = "<p>Error fetching weather.</p>");
}

function showWeather(data) {
  if (data.cod !== 200) {
    document.getElementById('weatherResult').innerHTML = `<p>City not found.</p>`;
    return;
  }

  const localTime = new Date((data.dt + data.timezone) * 1000).toUTCString();
  document.getElementById('weatherResult').innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img class="weather-icon" src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon" />
    <p><strong>${data.weather[0].main}:</strong> ${data.weather[0].description}</p>
    <p>🌡 Temp: ${data.main.temp} °C</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬 Wind: ${data.wind.speed} m/s</p>
    <p>🕓 Local Time: ${localTime}</p>
  `;
}

function getForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      showForecast(data);
    })
    .catch(error => {
      document.getElementById("forecastCards").innerHTML = "<p>Error loading forecast.</p>";
      console.error("Forecast error:", error);
    });
}

function showForecast(data) {
  const forecastDiv = document.getElementById("forecastCards");
  forecastDiv.innerHTML = "";

  const dailyData = data.list.filter((_, index) => index % 8 === 0);

  dailyData.forEach(item => {
    const date = new Date(item.dt_txt).toDateString().split(" ").slice(0, 3).join(" ");
    const icon = item.weather[0].icon;
    const temp = item.main.temp;
    const condition = item.weather[0].main.toLowerCase();

    let bgColor;
    if (condition.includes("rain")) bgColor = "#457fca";
    else if (condition.includes("cloud")) bgColor = "#6a11cb";
    else if (condition.includes("clear")) bgColor = "#f7971e";
    else if (condition.includes("snow")) bgColor = "#83a4d4";
    else bgColor = "#333";

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.style.background = bgColor;
    card.innerHTML = `
      <h4>${date}</h4>
      <img src="http://openweathermap.org/img/wn/${icon}.png" />
      <p>${temp}°C</p>
    `;
    forecastDiv.appendChild(card);
  });
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  document.querySelector(".weather-card").classList.toggle("dark");
}

function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();
  recognition.onresult = function (event) {
    const city = event.results[0][0].transcript;
    document.getElementById('cityInput').value = city;
    getWeather();
  };
  recognition.onerror = function () {
    alert("Could not recognize your voice.");
  };
}

function speakWeather(text) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  synth.speak(utterance);
}

function updateBackground(condition) {
  if (condition.includes("cloud")) {
    document.body.style.background = "url('cloudy.gif') center/cover no-repeat fixed";
  } else if (condition.includes("rain")) {
    document.body.style.background = "url('rain.gif') center/cover no-repeat fixed";
  } else if (condition.includes("clear")) {
    document.body.style.background = "url('sunny.gif') center/cover no-repeat fixed";
  } else if (condition.includes("snow")) {
    document.body.style.background = "url('snow.gif') center/cover no-repeat fixed";
  } else {
    document.body.style.background = "linear-gradient(-45deg, #4facfe, #00f2fe, #43e97b, #38f9d7)";
  }
}

function showTip(condition) {
  const tips = {
    rain: "☔ Don't forget your umbrella!",
    clear: "😎 Wear sunglasses and stay hydrated!",
    snow: "🧤 Bundle up, it's snowing!",
    clouds: "🌥 Might be a gloomy day, keep smiling!"
  };
  for (const key in tips) {
    if (condition.includes(key)) {
      document.getElementById('weatherResult').innerHTML += `<p>${tips[key]}</p>`;
      break;
    }
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then(() => {
    console.log("✅ Service Worker Registered");
  });
}
