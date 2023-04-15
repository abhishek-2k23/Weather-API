const userTab = document.querySelector("[data-userTab]");
const userInfo = document.querySelector("[user-info-container]");
const grantAccessContainer = document.querySelector(".grant-location-container");
const grantAccessBtn = document.querySelector("[data-grantAccess]");
const searchInputBox = document.querySelector("[search-input]");
const searchInputBtn = document.querySelector("[search-weather-btn]");
const loadingContainerScreen = document.querySelector(".loading-container");
const searchForm = document.querySelector("#form-container");
const searchTab = document.querySelector("[data-searchTab]");
const searchinfo = document.querySelector(".search-location");
const weatherInfoUI = document.querySelector(".show-weather-info");

// initalVariables
const ApiKey = "6cc795a95761495f223bce5642271c87";
var currentTab = userTab;

grantAccessContainer.classList.add("active");
//For tab switching
function switchTab(clickedTab){
    if(clickedTab == currentTab) return;
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
    }
    if(!searchForm.classList.contains("active")){
        userInfo.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        
        weatherInfoUI.classList.remove("active");
        searchForm.classList.add("active");
        cityNotFound.classList.remove("active");
    }
    else{
        
        searchForm.classList.remove("active");
        searchinfo.classList.remove("active");
        getFromSessionStorage();
    }
}
currentTab.classList.add("current-tab");

//On user tab click
userTab.addEventListener("click",()=>{ 
    switchTab(userTab);
});

//on Search tab
searchTab.addEventListener("click",()=>{
    switchTab(searchTab);
});

//for user location 
function getFromSessionStorage(){
    const localCoordinates  = sessionStorage.getItem("user-cordinates");
    if(!localCoordinates)
    {
        userInfo.classList.add("active");
        grantAccessContainer.classList.add("active");
    }
    else{
        userInfo.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        const coordinates = JSON.parse(localCoordinates);
        //for user weather information
        fetchUserWeatherInfo(coordinates);
    }
}
async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    userInfo.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    loadingContainerScreen.classList.add("active");
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${ApiKey}`);
        const data = await response.json();

        loadingContainerScreen.classList.remove("active");

        weatherInfoUI.classList.add("active");
        //to show the fetched data into the UI
        renderWeatherInfo(data);

    }
    catch(err){
        loadingContainerScreen.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        // we have to write something here
    }
}

//to put data of fetched api to the ui
function renderWeatherInfo(data){

    //all elements
    const city = document.querySelector("[city-name]");
    const countryIcon = document.querySelector("[country-icon]");
    const desc = document.querySelector("[data-weather-description]");
    const Icon = document.querySelector("[weather-icon]");
    const temp = document.querySelector("[temperature]");
    const windSpeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloud = document.querySelector("[data-cloud]");

    //to implement the data in ui
    city.innerText = data?.name;
    countryIcon.src =  `https://flagcdn.com/144x108/${data?.sys?.country.toLowerCase()}.png`;
    desc.innerText = data?.weather?.[0].description;
    Icon.src = `https://openweathermap.org/img/w/${data?.weather?.[0].icon}.png`;
    temp.innerText = `${data?.main?.temp} °C`;
    windSpeed.innerText = `${data?.wind?.speed} m/s`;
    humidity.innerText = `${data?.main?.humidity} %`;
    cloud.innerText = `${data?.clouds?.all} %`;
}

//on Grant Access button click
grantAccessBtn.addEventListener("click",()=>getlocation());

//to get the user current location 
function getlocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showposition);
    }
    else
    {
        window.alert("Location coordinates not availabel");
    }
}

function showposition(position) {
    const usercoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }
    sessionStorage.setItem("user-cordinates",JSON.stringify(usercoordinates));
    fetchUserWeatherInfo(usercoordinates);
}


searchForm.addEventListener("submit",(e)=>
{
    e.preventDefault();
    const cityName = searchInputBox.value;
    if(cityName== ""){
        return;
    }
    else{
        cityNotFound.classList.remove("active");
        weatherInfoUI.classList.remove("active");
        searchWeatherInfo(cityName);
    }
})

const cityNotFound = document.querySelector("[cityError]");
async function searchWeatherInfo(cityName){
    try{
        //show loading screen & remove previous results
        loadingContainerScreen.classList.add("active");
        grantAccessContainer.classList.remove("active");
        userInfo.classList.remove("active");
        //call api for the city
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${ApiKey}`);
        //covert data to json format
        const data = await response.json();
        //remove loading screen & show the userinfo
        loadingContainerScreen.classList.remove("active");
        if(!data.sys)
        {
            throw new Error("Not found");
        }
        weatherInfoUI.classList.add("active");
        //send fetched data for UI representation
        renderWeatherInfo(data);
    }catch(error){
        console.log("Error Occured : ",error.message);
        cityNotFound.classList.add("active");
        console.log("check")
    }
}
