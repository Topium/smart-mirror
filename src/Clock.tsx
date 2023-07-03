import { useState } from "react"

export default function Clock() {
    const [time, setTime] = useState(new Date())

    const days: string[] = ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La']

    setTimeout(() => {
        setTime(new Date());
    }, 1000 * 15);

    return(
    <>
        <div className="time">{time.toLocaleTimeString('en-UK').slice(0, -3)}</div>
        <div className="date">{days[time.getDay()]} {time.toLocaleDateString('fi-FI')}</div>
    </>
    )
}