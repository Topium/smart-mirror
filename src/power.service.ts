import { GraphDatum, PowerDatum, SahkotinPowerData } from "./interfaces";

const PowerService = {
    processPowerData: function(data: SahkotinPowerData): PowerDatum[] {
        if (data && data.prices) {
            return data.prices.map((d) => ({
                date: new Date(d.date).getTime(),
                value: Math.round(d.value * 10) / 100,
            }))
        }
        return [];
    },

    processGraphData: function(
        data: PowerDatum[],
        graphWidth: number,
        graphHeight: number,
        minValue: number,
        maxValue: number,
        minDate: number,
        maxDate: number,
        paddingLeft: number,
        paddingBottom: number,
        paddingTop: number,
        ): GraphDatum[] {
            const graphData = [];
            for (const d of data) {
                graphData.push(
                    {
                        x: (new Date(d.date).getTime() - minDate) / (maxDate - minDate) * graphWidth + paddingLeft,
                        y: graphHeight + paddingTop - ((d.value - minValue) / (maxValue - minValue) * graphHeight),
                    })
            }

        return graphData;
    },
    
    getRealizedPath: function(data: GraphDatum[], zeroY: number ): string {
        let path = `M${data[0].x} ${zeroY} L${data[0].x} ${data[0].y} `;
        path += this.getPathBody(data)
        path += `L${data[data.length - 1].x} ${zeroY}`;
        return path;
    },

    getForecastPath: function(data: GraphDatum[]): string {
        let path = `M${data[0].x} ${data[0].y} `;
        path += this.getPathBody(data)
        return path;
    },

    getPathBody: function(data: GraphDatum[]) {
        let graphDef = '';
        data.forEach((d, i) => {
            if (i < data.length - 1) {
                graphDef += `L${d.x} ${d.y} L${data[i + 1].x} ${d.y} `
            }
        })
        return graphDef;
    },

}

export default PowerService