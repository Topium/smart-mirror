import { useState } from "react"

export default function Clock() {
    const [time, setTime] = useState(new Date())

    const days: string[] = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su']

    setTimeout(() => {
        setTime(new Date());
    }, 1000 * 15);

    return(
    <>
        <div className="time">{time.toLocaleTimeString().slice(0, -3)}</div>
        <div className="date">{days[time.getDay()]} {time.toLocaleDateString()}</div>
    </>
    )
}