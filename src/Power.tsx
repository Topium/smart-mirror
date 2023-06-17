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
    const [graphDef, setGraphDef] = useState<string>('')

    const svgRef = useRef<SVGSVGElement>(null)

    const fetchPowerData = function(start: string, end: string) {
        const powerUrl = 'https://sahkotin.fi/prices?vat';
        // fetch(powerUrl + '&start=' + start + "&end=" + end)
        powerDataGenerator(-10, 150)
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
                    const minValue = Math.floor(Math.min(...powerData.map(d => d.value)) / 10) * 10;
                    const maxValue = Math.max(...powerData.map(d => d.value)) > 30 ?
                        Math.ceil(Math.max(...powerData.map(d => d.value)) / 10) * 10 :
                        30;
                    const minDate = Math.min(...powerData.map(d => d.date));
                    const maxDate = Math.max(...powerData.map(d => d.date));
                    const xAxesCount = (maxValue - minValue) / 10;
                    const xAxes = new Array(xAxesCount).fill(0).map((x,i) => graphHeight - (i / xAxesCount * graphHeight));
                    const yAxes = new Array(powerData.length).fill(0).map((x, i) => i / powerData.length * graphWidth)
                    const graphData = processGraphData(powerData, graphWidth, graphHeight, minValue, maxValue, minDate, maxDate);
                    // setMinValue(minValue);
                    // setMaxValue(maxValue);
                    // setMinDate(minDate);
                    // setMaxDate(maxDate);
                    setXAxes(xAxes);
                    setYAxes(yAxes);
                    // setPowerData(powerData)
                    // setGraphData(graphData)
                    setGraphDef(getGraphDef(graphData))
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

    const getGraphDef = function(data: GraphDatum[]): string {
        let graphDef = `M${data[0].x} ${data[0].y} `;
        data.forEach((d, i) => {
            if (i < data.length - 1) {
                graphDef += `L${d.x} ${d.y} L${data[i+1].x} ${d.y} `
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
            <g id="x-axes">
            { xAxes.map((y, i) => (
                <line key={i} className="graph-axis" x1="0" y1={y} x2={svgRef.current?.clientWidth} y2={y} />
            ))}
            </g>
            <g className="y-axes">
                { yAxes.map((x, i) => (
                    <line key={i} className="graph-axis" x1={x} y1="0" x2={x} y2={svgRef.current?.clientHeight} />
                ))}
            </g>
            <path d={graphDef} className="graph-line"/>
        </svg>
        </div>
    )
}