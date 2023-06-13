export interface OWMWeather {
    coord: Coord;
    weather: Weather[];
    base: string;
    main: Main;
    visibility: number;
    wind: Wind;
    clouds: Clouds;
    dt: number;
    sys: Sys;
    timezone: number;
    id: number;
    name: string;
    cod: number;
  }
  
  interface Sys {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  }
  
  interface Clouds {
    all: number;
  }
  
  interface Wind {
    speed: number;
    deg: number;
  }
  
  interface Main {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  }
  
  interface Weather {
    id: number;
    main: string;
    description: string;
    icon: string;
  }
  
  interface Coord {
    lon: number;
    lat: number;
  }

export interface OWMForecast {
  cod: string;
  message: number;
  cnt: number;
  list: List[];
  city: City;
}

interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

interface Coord {
  lat: number;
  lon: number;
}

interface List {
  dt: number;
  main: Main;
  weather: Weather[];
  clouds: Clouds;
  wind: Wind;
  visibility: number;
  pop: number;
  sys: Sys;
  dt_txt: string;
}

interface Sys {
  pod: string;
}

interface Wind {
  speed: number;
  deg: number;
  gust: number;
}

interface Clouds {
  all: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Main {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  sea_level: number;
  grnd_level: number;
  humidity: number;
  temp_kf: number;
}

export interface Forecast {
    time: string,
    temp: number,
    weatherId: number,
    weather: string,
    gust: number,
    iconClass: string,
}

export interface SahkotinPowerData {
    "prices": SahkotinPowerDatum[],
}

interface SahkotinPowerDatum {
    "date": string,
    "value": number
}

export interface PowerDatum {
    "date": number,
    "value": number
}

export interface GraphDatum {
    "x": number,
    "y": number
}