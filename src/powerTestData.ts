import { SahkotinPowerData, SahkotinPowerDatum } from "./interfaces"

export function powerDataGenerator(min = 0, max = 100): Promise<{ok: string, statusText: string, json: () => SahkotinPowerData }> {
    const thisMorning = new Date().setHours(0,0,0,0);
    const prices: SahkotinPowerDatum[] = [];
    const diff = max - min;
    for (let i = 0; i < 48; i++) {
        prices.push(
            {
                date: new Date(thisMorning + i * 1000 * 60 * 60).toISOString(),
                value: Math.sin(Math.PI / 16 * i) * diff / 2 + diff / 2 + min,
            }
        )
    }
    return new Promise(res => {
        res(
            {
                ok : 'ok',
                statusText: 'ok',
                json: (): SahkotinPowerData  => { return { prices }},
            }
        )
    })
}
