import { useEffect, useRef, useState } from "react"
import { PowerDatum, SahkotinPowerData } from "./interfaces"

export default function Power() {
    const [powerData, setPowerData] = useState<PowerDatum[]>([]);
    const [error, setError] = useState<string>('')
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(30);
    const [minDate, setMinDate] = useState(0);
    const [maxDate, setMaxDate] = useState(1);
    const [xAxes, setXAxes] = useState<number[]>([])
    const [yAxes, setYAxes] = useState<number[]>([])

    const svgRef = useRef<SVGSVGElement>(null)

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
                    const powerData = processPowerData(result);
                    const minValue = Math.floor(Math.min(...powerData.map(d => d.value)) / 10) * 10;
                    const maxValue = Math.max(...powerData.map(d => d.value)) > 30 ?
                        Math.ceil(Math.max(...powerData.map(d => d.value)) / 10) * 10 :
                        30;
                    const minDate = Math.min(...powerData.map(d => d.date));
                    const maxDate = Math.max(...powerData.map(d => d.date));
                    const xAxesCount = (maxValue - minValue) / 10;
                    const graphHeight = svgRef.current ? svgRef.current.clientHeight : 0;
                    const xAxes = new Array(xAxesCount).fill(0).map((x,i) => graphHeight - (i / xAxesCount * graphHeight));
                    const graphWidth = svgRef.current ? svgRef.current.clientWidth : 0;
                    const yAxes = new Array(powerData.length).fill(0).map((x, i) => i / powerData.length * graphWidth)
                    setPowerData(powerData)
                    setMinValue(minValue);
                    setMaxValue(maxValue);
                    setMinDate(minDate);
                    setMaxDate(maxDate);
                    setXAxes(xAxes);
                    setYAxes(yAxes);
                }
            })
    }

    const processPowerData = function(data: SahkotinPowerData): PowerDatum[] {
        if (data && data.prices) {
            return data.prices.map((d) => ({ date: new Date(d.date).getTime(), value: Math.round(d.value * 10) / 100}))
        }
        return [];
    }

    useEffect(() => {
        const start = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        const end = new Date(new Date().setHours(47, 59, 59, 999)).toISOString();
        fetchPowerData(start, end)
        setInterval(() => fetchPowerData(start, end), 60 * 60 * 1000)
    }, [])

    return (
        <>
        <h3>Power!</h3>
        {error ? <h4>{error}</h4> : ''}
        <svg ref={svgRef} width="100%">
            { xAxes.map((y, i) => (
                <line className="graph-line" key={i} x1="0" y1={y} x2={svgRef.current?.clientWidth} y2={y} />
            ))}
            { yAxes.map((x, i) => (
                <line className="graph-line" key={i} x1={x} y1="0" x2={x} y2={svgRef.current?.clientHeight} />
            ))}
            <line x2="10" y2="10" x1="90" y1="90" stroke="white" />
        </svg>
        <ul>
            {powerData.map((d, i) => (
                <li key={i}>{new Date(d.date).toLocaleString()}: {d.value}</li>
            ))}
        </ul>
        </>
    )
}