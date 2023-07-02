const container = document.querySelector(".container");
const search = document.querySelector(".search-box button");
const weatherBox = document.querySelector(".weather-box");
const weatherDetails = document.querySelector(".weather-details");
const error404 = document.querySelector(".not-found");

search.addEventListener("click", () => {
  const APIKey = "07ab8bbd34797a34e35b3fd1d99b493e";
  const city = document.querySelector(".search-box input").value;

  if (city === "") return;

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APIKey}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.cod === "404") {
        const error = document.querySelector(".error");
        container.style.height = "fit-content";
        weatherBox.style.display = "none";
        weatherDetails.style.display = "none";
        error404.style.display = "block";
        error404.classList.add("fadeIn");
        error.innerHTML = data.message;
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
      let options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      country.innerHTML = data.name;
      region.innerHTML = data.sys.country;
      temperature.innerHTML = `${data.main.temp}<span>°C</span>`;
      icon.setAttribute("src", `https:${data.weather[0].icon}`);
      text.innerHTML = data.weather[0].description;
      lastUpdate.innerHTML = new Date().toLocaleDateString("en-US", options);
      humidity.innerHTML = `${data.main.humidity}`;
      wind.innerHTML = `${data.wind.speed}<span>kph</span>`;

      weatherBox.style.display = "";
      weatherDetails.style.display = "";
      weatherBox.classList.add("fadeIn");
      weatherDetails.classList.add("fadeIn");
      container.style.height = "fit-content";
    });
});
