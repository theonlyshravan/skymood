// OpenWeatherMap API key - Replace with your own API key from https://openweathermap.org/api
const apiKey = 'a616633de762e48fbb8e24957ac750c1';

// DOM element references used to handle input, output, and updates
const searchInput = document.getElementById('search');
const submitButton = document.getElementById('submit');
const weatherData = document.getElementById('weather-data');
const currentWeather = document.getElementById('current-weather');
const forecast = document.getElementById('forecast');

// Event listeners for search functionality
// Handles search by both button click and pressing Enter key
submitButton.addEventListener('click', () => {
    const location = searchInput.value.trim();
    if (location) {
        fetchWeatherData(location);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const location = searchInput.value.trim();
        if (location) {
            fetchWeatherData(location);
        }
    }
});

// Fetches weather data from OpenWeatherMap API
// Fetches current weather and forecast data from OpenWeatherMap using two API calls
// Handles errors and updates UI accordingly
async function fetchWeatherData(location) {
    try {
        // Current weather API call
        const currentWeatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
        );
        
        // 5-day forecast API call
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`
        );

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('Location not found');
        }

        const currentData = await currentWeatherResponse.json();
        const forecastData = await forecastResponse.json();

        // Update UI with fetched data
        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        
        // Display weather container
        weatherData.classList.add('show');
    } catch (error) {
        alert('Error fetching weather data. Please try again.');
        console.error('Error:', error);
    }
}

// Renders current weather: temperature, description, humidity, and wind
function updateCurrentWeather(data) {
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;

    currentWeather.innerHTML = `
        <div class="weather-icon">
            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}">
        </div>
        <div class="weather-info">
            <h2>${temperature}°C</h2>
            <p>${description}</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind: ${windSpeed} m/s</p>
        </div>
    `;
}

// Creates 5-day forecast display
// OpenWeatherMap provides 3-hour intervals – filter to show one forecast per day
function updateForecast(data) {
    // Clear previous forecast data
    forecast.innerHTML = '';

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Filter to get next 5 days, excluding today
    const dailyForecast = data.list.filter(item => {
        const itemDate = new Date(item.dt * 1000);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= tomorrow;
    }).filter((item, index) => index % 8 === 0).slice(0, 5);

    dailyForecast.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const temperature = Math.round(day.main.temp);
        const iconCode = day.weather[0].icon;

        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <h3>${dayName}</h3>
            <p class="forecast-date">${dayDate}</p>
            <img src="https://openweathermap.org/img/wn/${iconCode}.png" alt="${day.weather[0].description}">
            <p>${temperature}°C</p>
        `;

        forecast.appendChild(forecastDay);
    });
}