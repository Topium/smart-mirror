import { useEffect, useState } from "react";
import * as secrets from '../secrets.json'

interface Forecast {
    time: string,
    temp: number,
    weatherId: number,
    weather: string,
    gust: number,
}

export default function Weather() {
    const [currentTemp, setCurrentTemp] = useState(0)
    const [forecast, setForecast] = useState<Forecast[]>([])

    function fetchWeather() {
        const weatherUrl = 'http://api.openweathermap.org/data/2.5/weather';
        const cityId = 633679;
        fetch(weatherUrl + '?id=' + cityId + '&appid=' + secrets.OpenWeatherAppId + '&units=metric')
            .then(response => {
                return response.json();
            })
            .then(data => {
                setCurrentTemp(data.main.temp)
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

    function getForecast(data): Forecast[] {
        return data.list.map((d) => (
            {
                time: d.dt_txt.slice(-8, -3),
                temp: Math.round(d.main.temp),
                weatherId: d.weather[0].id,
                weather: d.weather[0].main,
                gust: d.wind.gust
            }
        )).slice(0, 5)
    }

    useEffect(() => {
        fetchWeather();
        fetchForecast();
    }, [])

    return (
        <div className="weather">
            <div className="current-temp">{Math.round(currentTemp)}°</div>
            <ul className="forecast">
                {forecast.map((f, i) => (
                    <li key={i}>
                        <div className="temp">{f.temp}°</div>
                        <div className="weather">{f.weather}</div>
                        <div className="time">{f.time}</div>
                    </li>
                ))}
            </ul>
        </div>
    )
}