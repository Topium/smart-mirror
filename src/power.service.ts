import { GraphDatum, GraphDims, PowerDatum, SahkotinPowerData } from "./interfaces";

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
        graphDims: GraphDims,
        minValue: number,
        maxValue: number,
        minDate: number,
        maxDate: number,
        ): GraphDatum[] {
            const graphData = [];
            for (const d of data) {
                graphData.push(
                    {
                        x: (new Date(d.date).getTime() - minDate) / (maxDate - minDate) * graphDims.width + graphDims.paddingLeft,
                        y: graphDims.height + graphDims.paddingTop - ((d.value - minValue) / (maxValue - minValue) * graphDims.height),
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

    isPowerData: function(data: SahkotinPowerData): boolean {
        return Object.prototype.hasOwnProperty.call(data, 'prices') &&
            Object.prototype.hasOwnProperty.call(data.prices[0], 'date') &&
            Object.prototype.hasOwnProperty.call(data.prices[0], 'value');
    }
}

export default PowerService