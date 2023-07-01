import { Forecast, OWMForecast } from "./interfaces";

const WeatherService = {
    getForecast: function(data: OWMForecast): Forecast[] {
        const sunrise = data.city.sunrise;
        const sunset = data.city.sunset;
        return data.list.map((d) => (
            {
                time: d.dt_txt.slice(-8, -3),
                temp: Math.round(d.main.temp),
                weatherId: d.weather[0].id,
                weather: d.weather[0].main,
                gust: d.wind.gust,
                iconClass: this.getWeatherIconClass(d.weather[0].id, d.dt, sunset, sunrise)
            }
        )).slice(0, 5)
    },

    getWeatherIconClass: function(id:number, iconTime:number, sunset:number, sunrise:number) {
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
    },

    getIsRainy: function(data: OWMForecast): boolean {
        return data.list.slice(0, 3).some(x => x.rain)
    },
  
    getIsWindy: function(data: OWMForecast): boolean {
        return data.list.slice(0, 3).some(x => x.wind.speed >= 6)
    }
}

export default WeatherService;