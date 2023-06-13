import { useEffect, useState } from "react";
import * as secrets from '../secrets.json'
import { Forecast, OWMForecast, OWMWeather } from "./interfaces";
import './assets/weather-css/weather-icons.min.css';

export default function Weather() {
    const [currentTemp, setCurrentTemp] = useState(0)
    const [currentWeather, setCurrentWeather] = useState('')
    const [forecast, setForecast] = useState<Forecast[]>([])

    function fetchWeather() {
        const weatherUrl = 'http://api.openweathermap.org/data/2.5/weather';
        const cityId = 633679;
        const time = Math.round(new Date().getTime() / 1000);
        fetch(weatherUrl + '?id=' + cityId + '&appid=' + secrets.OpenWeatherAppId + '&units=metric')
            .then(response => {
                return response.json();
            })
            .then((data: OWMWeather) => {
                setCurrentTemp(data.main.temp)
                setCurrentWeather(getWeatherIconClass(data.weather[0].id, time, data.sys.sunset, data.sys.sunrise))
            })
    }

    function fetchForecast() {
        const forecastUrl = 'http://api.openweathermap.org/data/2.5/forecast';
        const cityId = 633679;
        fetch(forecastUrl + '?id=' + cityId + '&appid=' + secrets.OpenWeatherAppId + '&units=metric')
            .then(response => {
                return response.json();
            })
            .then(data => {
                setForecast(getForecast(data))
            })
    }

    function getForecast(data: OWMForecast): Forecast[] {
        const sunrise = data.city.sunrise;
        const sunset = data.city.sunset;
        return data.list.map((d) => (
            {
                time: d.dt_txt.slice(-8, -3),
                temp: Math.round(d.main.temp),
                weatherId: d.weather[0].id,
                weather: d.weather[0].main,
                gust: d.wind.gust,
                iconClass: getWeatherIconClass(d.weather[0].id, d.dt, sunset, sunrise)
            }
        )).slice(0, 5)
    }

    function getWeatherIconClass(id:number, iconTime:number, sunset:number, sunrise:number) {
        if (typeof(id) != 'number') {
          return 'wi-alien';
        }
        const weatherId = id.toString().slice(0,1)
        let weatherClass: string;
        const nextSunrise = sunrise + 24 * 60 * 60;
        
        const daytime = (iconTime > sunrise  && iconTime < sunset) || iconTime > nextSunrise;
    
        switch (weatherId) {
          case '2':
            weatherClass = 'wi-thunderstorm';
            break;
          case '3':
            weatherClass = 'wi-showers';
            break;
          case '5':
            weatherClass = 'wi-rain';
            break;
          case '6':
            weatherClass = 'wi-snow';
            break;
          case '7':
            weatherClass = 'wi-dust';
            break;
          case '8':
            switch (id) {
              case 801:
                if (daytime) {
                  weatherClass = 'wi-day-cloudy';
                }
                else {
                  weatherClass = 'wi-night-alt-cloudy';
                }
                break;
              case 802:
                if (daytime) {
                  weatherClass = 'wi-day-cloudy';
                }
                else {
                  weatherClass = 'wi-night-alt-cloudy';
                }
                break;
              case 803:
                weatherClass = 'wi-cloud';
                break;
              case 804:
                weatherClass = 'wi-cloudy';
                break;
              default:
                if (daytime) {
                    weatherClass = 'wi-day-sunny';
                }
                else {
                  weatherClass = 'wi-night-clear';
                }
            }
            break;
    
          default: 
          weatherClass = 'wi-alien';
        }
    
        return weatherClass;
    }

    useEffect(() => {
        fetchWeather();
        fetchForecast();
        setInterval(() => {
          fetchWeather();
          fetchForecast();
        }, 60 * 60 * 1000)
    }, [])

    return (
        <div className="weather">
            <div className="current-weather">
                <i className={`wi ${currentWeather}`}></i>
                <span className="current-temp">{Math.round(currentTemp)}°</span>
            </div>
            <ul className="forecast">
                {forecast.map((f, i) => (
                    <li key={i}>
                        <div className="temp">{f.temp}°</div>
                        <div className="weather"><i className={`wi ${f.iconClass}`}></i></div>
                        <div className="time">{f.time}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}