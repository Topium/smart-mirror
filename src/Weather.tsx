import { useEffect, useState } from "react";
import * as secrets from '../secrets.json'


export default function Weather() {
    const [currentTemp, setCurrentTemp] = useState(0)

    function getWeather() {
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

    useEffect(() => {
        setTimeout(() => {
            getWeather();
        }, 1000 * 60 * 15);
    }, [])

    return (
        <div className="weather">
            <div className="current-temp">{Math.round(currentTemp)}°</div>
        </div>
    )
}