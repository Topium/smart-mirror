import { useEffect, useState } from "react"
import { PowerDatum, SahkotinPowerData } from "./interfaces"

export default function Power() {
    const [powerData, setPowerData] = useState<PowerDatum[]>([]);
    const [error, setError] = useState<string>('')

    const fetchPowerData = function(start: string, end: string) {
        const powerUrl = 'https://sahkotin.fi/prices?vat';
        fetch(powerUrl + '&start=' + start + "&end=" + end)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    setError(response.statusText);
                    return null;
                }
            })
            .then((result: SahkotinPowerData) => {
                if (result !== null) {
                    setPowerData(processPowerData(result))
                }
            })
    }

    const processPowerData = function(data: SahkotinPowerData): PowerDatum[] {
        if (data && data.prices) {
            return data.prices.map((d) => ({ date: new Date(d.date).getTime(), value: d.value}))
        }
        return [];
    }

    useEffect(() => {
        const start = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        const end = new Date(new Date().setHours(47, 59, 59, 999)).toISOString();
        fetchPowerData(start, end)
    }, [])

    return (
        <>
        <h3>Power!</h3>
        {error ? <h4>{error}</h4> : ''}
        <ul>
            {powerData.map((d, i) => (
                <li key={i}>{new Date(d.date).toLocaleString()}: {Math.round(d.value * 10) / 100}</li>
            ))}
        </ul>
        </>
    )
}