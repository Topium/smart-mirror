import { useEffect, useRef, useState } from "react"
import { GraphDatum, PowerDatum, SahkotinPowerData } from "./interfaces"
import { powerDataGenerator } from "./powerTestData"

export default function Power() {
    // const [powerData, setPowerData] = useState<PowerDatum[]>([]);
    // const [graphData, setGraphData] = useState<GraphDatum[]>([]);
    const [error, setError] = useState<string>('')
    // const [minValue, setMinValue] = useState(0);
    // const [maxValue, setMaxValue] = useState(30);
    // const [minDate, setMinDate] = useState(0);
    // const [maxDate, setMaxDate] = useState(1);
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
                    const graphHeight = svgRef.current ? svgRef.current.clientHeight : 0;
                    const graphWidth = svgRef.current ? svgRef.current.clientWidth : 0;
                    const powerData = processPowerData(result);
                    const realizedPowerData = powerData.filter((d) => d.date < new Date().getTime())
                    const forecastPowerData = powerData.filter((d) => d.date >= new Date().getTime() - 1000 * 60 * 60)
                    console.log('realizedPowerData', realizedPowerData)
                    console.log('forecastPowerData', forecastPowerData)
                    const minValue = Math.floor(Math.min(...powerData.map(d => d.value)) / 10) * 10;
                    const maxValue = Math.max(...powerData.map(d => d.value)) > 30 ?
                        Math.ceil(Math.max(...powerData.map(d => d.value)) / 10) * 10 :
                        30;
                    const zeroY = graphHeight - (( - minValue) / (maxValue - minValue) * graphHeight);
                    const minDate = Math.min(...powerData.map(d => d.date));
                    const maxDate = Math.max(...powerData.map(d => d.date));
                    const xAxesCount = (maxValue - minValue) / 10;
                    const xAxes = new Array(xAxesCount).fill(0).map((x,i) => graphHeight - (i / xAxesCount * graphHeight));
                    const yAxes = new Array(powerData.length).fill(0).map((x, i) => i / (powerData.length) * (graphWidth + graphWidth / powerData.length))
                    const forecastPowerGraphData = processGraphData(forecastPowerData, graphWidth, graphHeight, minValue, maxValue, minDate, maxDate);
                    const realizedPowerGraphData = processGraphData(realizedPowerData, graphWidth, graphHeight, minValue, maxValue, minDate, maxDate);
                    // setMinValue(minValue);
                    // setMaxValue(maxValue);
                    // setMinDate(minDate);
                    // setMaxDate(maxDate);
                    setGraphDims({ width: graphWidth, height: graphHeight, zeroY })
                    setXAxes(xAxes);
                    setYAxes(yAxes);
                    // setPowerData(powerData)
                    // setGraphData(graphData)
                    setPowerForecast(getForecastGraphDef(forecastPowerGraphData))
                    setPowerRealized(getRealizedGraphDef(realizedPowerGraphData, zeroY))
                }
            })
    }

    const processPowerData = function(data: SahkotinPowerData): PowerDatum[] {
        if (data && data.prices) {
            return data.prices.map((d) => ({
                date: new Date(d.date).getTime(),
                value: Math.round(d.value * 10) / 100,
            }))
        }
        return [];
    }

    const processGraphData = function(
        data: PowerDatum[],
        graphWidth: number,
        graphHeight: number,
        minValue:number,
        maxValue:number,
        minDate:number,
        maxDate:number
        ): GraphDatum[] {
            const graphData = [];
            for (const d of data) {
                graphData.push(
                    {
                        x: (new Date(d.date).getTime() - minDate) / (maxDate - minDate) * graphWidth,
                        y: graphHeight - ((d.value - minValue) / (maxValue - minValue) * graphHeight),
                    })
            }

        return graphData;
    }

    const getRealizedGraphDef = function(data: GraphDatum[], zeroY: number ): string {
        let graphDef = `M${data[0].x} ${zeroY} L${data[0].x} ${data[0].y} `;
        graphDef += pathTransform(data)
        graphDef += `L${data[data.length - 1].x} ${zeroY}`;
        return graphDef;
    }

    const getForecastGraphDef = function(data: GraphDatum[]): string {
        let graphDef = `M${data[0].x} ${data[0].y} `;
        graphDef += pathTransform(data)
        return graphDef;
    }

    function pathTransform(data: GraphDatum[]) {
        let graphDef = '';
        data.forEach((d, i) => {
            if (i < data.length - 1) {
                graphDef += `L${d.x} ${d.y} L${data[i + 1].x} ${d.y} `
            }
        })
        return graphDef;
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
            <g className="realized-path">
                <path d={powerRealized} className="graph-line realized"/>
            </g>
            <g className="y-axes">
                { yAxes.map((x, i) => (
                    <line key={i} className="graph-axis" x1={x} y1="0" x2={x} y2={svgRef.current?.clientHeight} />
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