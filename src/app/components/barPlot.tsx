import { formatMoney } from "../utils";

function rangeGen(from: number, to: number) {
    let arr = []
    for(let i=from; i<=to; i++) {
        arr.push(i);
    }
    return arr
}

export default async function BarPlot(x_min: number, x_max: number, data: Map<number, number>, height=15) {
    const x_max_len = x_max.toString().length
    const y_max = Math.max(...Array.from(data.values()));
    const y_max_len = Math.max(...Array.from(data.values()))

    const x_labels = rangeGen(x_min, x_max).map(x => x.toString().padStart(x_max_len, '0')).join("|")
    let fills = [];
    for(let i=0; i<height; i++) {
        const s = rangeGen(x_min, x_max).map(x => {
            if(data.has(x) && data.get(x)! >= y_max*(1-((i)/height))) {
                return "*".repeat(x_max_len)
            } else {
                return " ".repeat(x_max_len)
            }
        }).join("|")
        fills.push(<pre>|{s}|{(i%2 == 0 ? " " + formatMoney(Math.round(y_max*(1-((i)/height)))) + "€" : "")}</pre>)
    }
    return <>
    {fills}
    <p>|{x_labels}|</p>
    </>
}