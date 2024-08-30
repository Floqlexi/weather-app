const API_KEY_PARAM = "APPID=5796abbde9106b7da4febfae8c44c232";
const API_DETAIL = "https://api.openweathermap.org/data/2.5/onecall?units=metric&";
const API_FOR_SEARCH = "https://api.openweathermap.org/data/2.5/find?q=";

const searchInput = document.getElementById("search-input");
searchInput.addEventListener("keyup", function (e) {
    let value = searchInput.value;

    if (value.length > 3) {
        let suggestionsContainer = document.getElementById("suggestions");
        suggestionsContainer.style.display = "block";
        fetch(`${API_FOR_SEARCH}${value}&${API_KEY_PARAM}`)
            .then((response) => response.json())
            .then((data) => {
                let list = data.list;
                suggestionsContainer.innerHTML = "";
                list.forEach((item) => {
                    let suggestion = document.createElement("li");
                    suggestion.classList.add("suggestion");
                    suggestion.innerHTML = item.name;
                    suggestion.addEventListener("click", function () {
                        GetLocationDetail(item);
                    });
                    suggestionsContainer.appendChild(suggestion);
                });
            });
    }
});
async function GetLocationMainDetail(item) {
    return await fetch(`${API_DETAIL}lat=${item.coord.lat}&lon=${item.coord.lon}&${API_KEY_PARAM}`).then((response) => response.json());
}

async function GetLocationDetail(item) {
    let suggestionsContainer = document.getElementById("suggestions");
    suggestionsContainer.style.display = "none";
    let detail = await GetLocationMainDetail(item);

    let mainLocationName = document.getElementById("main-location-name");
    let mainLocationDate = document.getElementById("main-location-date");
    let mainLocationDegree = document.getElementById("main-location-degree");
    let mainLocationWarm = document.getElementById("main-location-warm");
    let mainLocationMinMax = document.getElementById("main-location-min-max");

    mainLocationName.innerHTML = item.name;
    mainLocationDate.innerHTML = new Date(detail.current.dt * 1000).toLocaleDateString();
    mainLocationDegree.innerHTML = Math.round(detail.current.temp);
    mainLocationWarm.innerHTML = detail.current.weather[0].description;
    mainLocationMinMax.innerHTML = `${Math.round(detail.daily[0].temp.min)} / ${Math.round(detail.daily[0].temp.max)}`;

    let dailyContainer = document.getElementById("daily-container");
    dailyContainer.innerHTML = "";
    detail.daily.forEach((item, index) => {
        let hour = document.createElement("div");
        hour.classList.add("hour");
        let weather = item.weather[0].main;
        let imageSrc = "";
        switch (weather) {
            case "Clouds":
                imageSrc = "/assets/images/cloudy.png";
                break;
            case "Rain":
                imageSrc = "/assets/images/rainy.png";
                break;
            case "Clear":
                imageSrc = "/assets/images/sunny.png";
                break;
            default:
                imageSrc = "/assets/images/cloudy.png";
                break;
        }
        let dayName = new Date(item.dt * 1000).toLocaleDateString("en-US", {weekday: "short"});
        if (index === 0) {
            dayName = "Today";
        }

        hour.innerHTML = `
                    <p>${dayName}</p>
                    <img src="${imageSrc}" alt="${weather}" />
                    <p>${Math.round(item.temp.day)}°</p>
                `;
        dailyContainer.appendChild(hour);
    });

    SaveToLocalStorage(item);

    let detailContainer = document.getElementById("detail-container");
    detailContainer.style.display = "block";
}

function SaveToLocalStorage(item) {
    let localData = localStorage.getItem("locations");
    let locations = [];
    if (localData) {
        locations = JSON.parse(localData);
    }

    let isExist = locations.some((location) => location.name === item.name);
    if (!isExist) {
        locations.unshift(item);
    }

    if (locations.length > 3) {
        locations.pop();
    }

    localStorage.setItem("locations", JSON.stringify(locations));
}

async function GetFromLocalStorage() {
    let localData = localStorage.getItem("locations");
    let locations = [];
    if (localData) {
        locations = JSON.parse(localData);
    }

    let locationHistory = document.getElementById("location-history");

    locationHistory.innerHTML = "";
    locations.forEach(async (item) => {
        let cityCard = document.createElement("div");
        cityCard.classList.add("city-card");
        let detail = await GetLocationMainDetail(item);
        let weather = detail.current.weather[0].main;
        let imageSrc = "";
        switch (weather) {
            case "Clouds":
                imageSrc = "/assets/images/cloudy.png";
                break;
            case "Rain":
                imageSrc = "/assets/images/rainy.png";
                break;
            case "Clear":
                imageSrc = "/assets/images/sunny.png";
                break;
            default:
                imageSrc = "/assets/images/cloudy.png";
                break;
        }

        cityCard.innerHTML = `
            <h3>${item.name}</h3>
            <img src="${imageSrc}" alt="${weather}" />
            <p>${Math.round(detail.current.temp)}° ${weather}</p>
        `;
        locationHistory.appendChild(cityCard);
    });
    if (locations.length) {
        let firstItem = locations[0];
        if (firstItem) {
            GetLocationDetail(firstItem);
        }
    } else {
        let detailContainer = document.getElementById("detail-container");
        detailContainer.style.display = "none";
    }
}

GetFromLocalStorage();
