const container = document.querySelector(".container");
const search = document.querySelector(".search-box button");
const weatherBox = document.querySelector(".weather-box");
const weatherDetails = document.querySelector(".weather-details");
const error404 = document.querySelector(".not-found");

search.addEventListener("click", () => {
  const APIKey = "bdbf12ffb35e452681e170138233006";
  const city = document.querySelector(".search-box input").value;

  if (city === "") return;

  fetch(
    `http://api.weatherapi.com/v1/current.json?key=${APIKey}&q=${city}&aqi=no`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.error) {
        const error = document.querySelector(".error");
        container.style.height = "fit-content";
        weatherBox.style.display = "none";
        weatherDetails.style.display = "none";
        error404.style.display = "block";
        error404.classList.add("fadeIn");
        error.innerHTML = data.error.message;
        return;
      }

      error404.style.display = "none";
      error404.classList.remove("fadeIn");

      const temperature = document.querySelector(".temperature");
      const icon = document.querySelector(".icon");
      const text = document.querySelector(".text");
      const country = document.querySelector(".country");
      const region = document.querySelector(".region");
      const lastUpdate = document.querySelector(".lastUpdate");
      const humidity = document.querySelector(".humidity .text span");
      const wind = document.querySelector(".wind .text span");

      country.innerHTML = data.location.country;
      region.innerHTML = data.location.region;
      temperature.innerHTML = `${data.current.temp_c}<span>°C</span>`;
      icon.setAttribute("src", `https:${data.current.condition.icon}`);
      text.innerHTML = data.current.condition.text;
      lastUpdate.innerHTML = data.current.last_updated;
      humidity.innerHTML = `${data.current.humidity}`;
      wind.innerHTML = `${data.current.wind_kph}<span>kph</span>`;

      weatherBox.style.display = "";
      weatherDetails.style.display = "";
      weatherBox.classList.add("fadeIn");
      weatherDetails.classList.add("fadeIn");
      container.style.height = "fit-content";
    });
});
