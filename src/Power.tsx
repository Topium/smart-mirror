import { useEffect, useRef, useState } from "react"
import { GraphDims, GraphLimits, PowerDatum, SahkotinPowerData } from "./interfaces"
import PowerService from "./power.service";

export default function Power() {
    const [error, setError] = useState<string>('')
    const [xAxes, setXAxes] = useState<{y: number, value: number}[]>([])
    const [yAxes, setYAxes] = useState<{x: number, value: number}[]>([])
    const [powerData, setPowerData] = useState<PowerDatum[]>([])
    const [powerRealized, setPowerRealized] = useState<string>('')
    const [powerForecast, setPowerForecast] = useState<string>('')
    const [graphDims, setGraphDims] = useState<GraphDims>({width: 0, height: 0, paddingTop: 0, paddingBottom: 0, paddingLeft: 0, zeroY: 0})
    const [graphLimits, setGraphLimits] = useState<GraphLimits>({minValue: 0, maxValue: 0, minDate: 0, maxDate: 0})

    const svgRef = useRef<SVGSVGElement>(null)

    const fetchPowerData = function(start: string, end: string) {
        const powerUrl = 'https://sahkotin.fi/prices?vat';
        fetch(powerUrl + '&start=' + start + "&end=" + end)
        // powerDataGenerator(-100, 300)
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    setError(response.statusText);
                    return null;
                }
            })
            .then((result: SahkotinPowerData | null) => {
                if (result !== null && PowerService.isPowerData(result)) {
                    const powerData = PowerService.processPowerData(result);
                    setPowerData(powerData);

                    const paddingTop = 8;
                    const paddingLeft = 36;
                    const paddingBottom = 24;
                    const graphHeight = svgRef.current ? svgRef.current.clientHeight - paddingBottom - paddingTop : 0;
                    const graphWidth = svgRef.current ? svgRef.current.clientWidth - paddingLeft : 0;
                    const minValue = Math.floor(Math.min(...powerData.map(d => d.value)) / 10 - 0.1) * 10;
                    const maxValue = Math.max(...powerData.map(d => d.value)) > 20 ? Math.ceil(Math.max(...powerData.map(d => d.value)) / 10 + 0.1) * 10 : 20;
                    const zeroY = graphHeight + paddingTop + (minValue / (maxValue - minValue) * graphHeight);
                    const minDate = Math.min(...powerData.map(d => d.date));
                    const maxDate = Math.max(...powerData.map(d => d.date));
                    const xAxesCount = Math.ceil((maxValue - minValue) / 10);
                    const xAxes = new Array(xAxesCount + 1).fill(0).map((x, i) => {
                        x;
                        return { y: graphHeight + paddingTop - (i / xAxesCount * graphHeight), value: minValue + i * 10 }
                    });
                    const yAxes = new Array(powerData.length).fill(0).map((x, i) => {
                        x;
                        return { x: i / (powerData.length) * (graphWidth + graphWidth / powerData.length), value : powerData[i].date }
                    });

                    const graphDims = { width: graphWidth, height: graphHeight, paddingTop, paddingBottom, paddingLeft, zeroY }
                    const graphLimits = { minValue, maxValue, minDate, maxDate };

                    setGraphDims(graphDims)
                    setGraphLimits(graphLimits)
                    setXAxes(xAxes);
                    setYAxes(yAxes);
                    refreshGraph(powerData, graphDims, graphLimits)
                }
            })
    }

    const refreshGraph = function (powerData: PowerDatum[], graphDims: GraphDims, graphLimits: GraphLimits) {
        if (powerData.length) {
            const realizedPowerData = powerData.filter((d) => d.date < new Date().getTime())
            const forecastPowerData = powerData.filter((d) => d.date >= new Date().getTime() - 1000 * 60 * 60)
            const forecastPowerGraphData = PowerService.processGraphData(forecastPowerData, graphDims, graphLimits.minValue, graphLimits.maxValue, graphLimits.minDate, graphLimits.maxDate);
            const realizedPowerGraphData = PowerService.processGraphData(realizedPowerData, graphDims, graphLimits.minValue, graphLimits.maxValue, graphLimits.minDate, graphLimits.maxDate);
            setPowerForecast(PowerService.getForecastPath(forecastPowerGraphData))
            setPowerRealized(PowerService.getRealizedPath(realizedPowerGraphData, graphDims.zeroY))
        }
    }

    const powerDataTimer = function () {
        const start = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
        const end = new Date(new Date().setHours(47, 59, 59, 999)).toISOString();
        fetchPowerData(start, end)
    }

    useEffect(() => {
        powerDataTimer();
    }, [])

    setInterval(() => powerDataTimer(), 60 * 60 * 1000)
    setInterval(() => refreshGraph(powerData, graphDims, graphLimits), 60 * 1000)

    return (
        <div className="power-graph">
        {error ? <h4>{error}</h4> : ''}
        <svg ref={svgRef} width="100%" height="13vw">
            <path d={powerRealized} className="graph-line realized"/>
            <line className="graph-axis strong" x1={graphDims.paddingLeft} y1={graphDims.zeroY} x2={graphDims.width + graphDims.paddingLeft} y2={graphDims.zeroY} />
            <path d={powerForecast} className="graph-line forecast"/>
            <g className="y-axes">
                { yAxes.map((axis, i) => (
                    <g key={i}>
                        {i % 6 === 0 ?
                        <>
                        <text className="y-label" x={axis.x + graphDims.paddingLeft} y={graphDims.height + graphDims.paddingBottom + graphDims.paddingTop}>{new Date(axis.value).getHours()}</text>
                        <line className={`graph-axis`} x1={axis.x + graphDims.paddingLeft} y1={graphDims.paddingTop} x2={axis.x + graphDims.paddingLeft} y2={graphDims.height + graphDims.paddingTop} />
                        </>
                         : ''}
                    </g>
                    ))}
            </g>
            <g className="x-axes">
            { xAxes.map((axis, i) => (
                <g key={i}>
                    <text className="x-label" x={graphDims.paddingLeft - 6} y={axis.y}>{axis.value}</text>
                    <line className="graph-axis" x1={graphDims.paddingLeft} y1={axis.y} x2={graphDims.width + graphDims.paddingLeft} y2={axis.y} />
                </g>
                ))}
            </g>
            <rect className="zero-mask" x={graphDims.paddingLeft} y={graphDims.zeroY + 0.5} width={graphDims.width + graphDims.paddingLeft} height={graphDims.height + graphDims.paddingTop - graphDims.zeroY} />
        </svg>
        </div>
    )
}