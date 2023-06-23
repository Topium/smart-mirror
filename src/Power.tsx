import { useEffect, useRef, useState } from "react"
import { SahkotinPowerData } from "./interfaces"
import { powerDataGenerator } from "./powerTestData"
import PowerService from "./power.service";

export default function Power() {
    const [error, setError] = useState<string>('')
    const [xAxes, setXAxes] = useState<number[]>([])
    const [yAxes, setYAxes] = useState<number[]>([])
    const [powerRealized, setPowerRealized] = useState<string>('')
    const [powerForecast, setPowerForecast] = useState<string>('')
    const [graphDims, setGraphDims] = useState<{width: number, height: number, zeroY: number}>({width: 0, height: 0, zeroY: 0})

    const svgRef = useRef<SVGSVGElement>(null)

    const fetchPowerData = function(start: string, end: string) {
        const powerUrl = 'https://sahkotin.fi/prices?vat';
        // fetch(powerUrl + '&start=' + start + "&end=" + end)
        powerDataGenerator(-100, 850)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    setError(response.statusText);
                    return null;
                }
            })
            .then((result: SahkotinPowerData | null) => {
                if (result !== null) {
                    const powerData = PowerService.processPowerData(result);

                    const graphHeight = svgRef.current ? svgRef.current.clientHeight : 0;
                    const graphWidth = svgRef.current ? svgRef.current.clientWidth : 0;
                    const minValue = Math.floor(Math.min(...powerData.map(d => d.value)) / 10) * 10;
                    const maxValue = Math.max(...powerData.map(d => d.value)) > 30 ? Math.ceil(Math.max(...powerData.map(d => d.value)) / 10) * 10 : 30;
                    const zeroY = graphHeight - (( - minValue) / (maxValue - minValue) * graphHeight);
                    const minDate = Math.min(...powerData.map(d => d.date));
                    const maxDate = Math.max(...powerData.map(d => d.date));
                    const xAxesCount = (maxValue - minValue) / 10;
                    const xAxes = new Array(xAxesCount).fill(0).map((x,i) => graphHeight - (i / xAxesCount * graphHeight));
                    const yAxes = new Array(powerData.length).fill(0).map((x, i) => i / (powerData.length) * (graphWidth + graphWidth / powerData.length))
                    
                    const realizedPowerData = powerData.filter((d) => d.date < new Date().getTime())
                    const forecastPowerData = powerData.filter((d) => d.date >= new Date().getTime() - 1000 * 60 * 60)
                    const forecastPowerGraphData = PowerService.processGraphData(forecastPowerData, graphWidth, graphHeight, minValue, maxValue, minDate, maxDate);
                    const realizedPowerGraphData = PowerService.processGraphData(realizedPowerData, graphWidth, graphHeight, minValue, maxValue, minDate, maxDate);

                    setGraphDims({ width: graphWidth, height: graphHeight, zeroY })
                    setXAxes(xAxes);
                    setYAxes(yAxes);
                    setPowerForecast(PowerService.getForecastPath(forecastPowerGraphData))
                    setPowerRealized(PowerService.getRealizedPath(realizedPowerGraphData, zeroY))
                }
            })
    }

    useEffect(() => {
        const start = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        const end = new Date(new Date().setHours(47, 59, 59, 999)).toISOString();
        fetchPowerData(start, end)
        setInterval(() => fetchPowerData(start, end), 60 * 60 * 1000)
    }, [])

    return (
        <div className="power-graph">
        {error ? <h4>{error}</h4> : ''}
        <svg ref={svgRef} width="100%">
            <path d={powerRealized} className="graph-line realized"/>
            <g className="y-axes">
                { yAxes.map((x, i) => (
                    <line key={i} className="graph-axis" x1={x} y1="0" x2={x} y2={graphDims.height} />
                    ))}
            </g>
            <line className="graph-axis strong" x1="0" y1={graphDims.zeroY} x2={graphDims.width} y2={graphDims.zeroY} />
            <path d={powerForecast} className="graph-line forecast"/>
            <rect className="zero-mask" x="0" y={graphDims.zeroY + 0.5} width={graphDims.width} height={graphDims.height} />
            <g className="x-axes">
            { xAxes.map((y, i) => (
                <line key={i} className="graph-axis" x1="0" y1={y} x2={svgRef.current?.clientWidth} y2={y} />
                ))}
            </g>
        </svg>
        </div>
    )
}