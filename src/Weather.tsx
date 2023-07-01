import { useEffect, useState } from "react";
import * as secrets from '../secrets.json'
import { Forecast, OWMWeather } from "./interfaces";
import './assets/weather-css/weather-icons.min.css';
import WeatherService from "./weather.service";

export default function Weather() {
    const [currentTemp, setCurrentTemp] = useState(0)
    const [currentWeather, setCurrentWeather] = useState('')
    const [forecast, setForecast] = useState<Forecast[]>([])
    const [isRainy, setIsRainy] = useState<boolean>(true)
    const [isWindy, setIsWindy] = useState<boolean>(true)

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
                setCurrentWeather(WeatherService.getWeatherIconClass(data.weather[0].id, time, data.sys.sunset, data.sys.sunrise))
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
                console.log('weatherdata', data)
                setForecast(WeatherService.getForecast(data))
                setIsRainy(WeatherService.getIsRainy(data));
                setIsWindy(WeatherService.getIsWindy(data));
            })
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
        <div className="weather-container">
            <div className="current-container">
              <div className="current-weather">
                  <i className={`wi ${currentWeather}`}></i>
                  <span className="current-temp">{Math.round(currentTemp)}°</span>
              </div>
              <div className="weather-warnings">
                { isRainy ? <i className="wi wi-umbrella"></i> : ''}
                { isWindy ? <i className="wi wi-strong-wind"></i> : ''}
              </div>
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