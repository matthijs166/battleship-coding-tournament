

type BarChartOptions = {
    title?: string;
    width: number;
    maxValue: number;
    xOffSet?: number;
}

export enum ChartColors {
    green = "\x1b[32m",
    red = "\x1b[31m",
    blue = "\x1b[34m",
    yellow = "\x1b[33m",
    white = "\x1b[37m",
    cyan = "\x1b[36m",
    magenta = "\x1b[35m",
    gray = "\x1b[90m",
    random = ""
}
    
type BarStruct = {
    value: number;
    color: ChartColors;
    name?: string;
    suffix?: string;
}

export default class BarChart {
    private options: BarChartOptions;
    private bar: BarStruct[] = [];

    constructor(options: BarChartOptions) {
        this.options = options;
    }

    addBar(args: BarStruct): void {
        this.bar.push(args);
    }

    render() {
        console.log("\x1b[0m");
        
        let header = this.options.title ? this.options.title : "Bar Chart";
        let barLines: String[] = []

        console.log(header);

        // loop each bar a
        this.bar.forEach((bar) => {
            let barLine = "";
            // scale the bar based on the width and max value
            let barLength =  Math.floor((bar.value / this.options.maxValue) * this.options.width);
            // loop each column
            for (let i = 0; i < this.options.width; i++) {
                barLine += bar.color;
                if (i < barLength) {
                    barLine += "█";
                }
                barLine += "\x1b[0m";

                // add value to the end of the bar
                if (i === this.options.width - 1) {
                    barLine += " " + bar.value;
                }
            }
            barLines.push(barLine);
        });

        // print each bar take in account the xOffSet and calculate the name length minus its width
        // aligin name to the left
        barLines.forEach((barLine, index) => {
            let name = this.bar[index].name ?? index.toString();
            let nameLength = name.length;
            let xOffSet = this.options.xOffSet || 0;
            let xOffSetSpaces = "";
            for (let i = 0; i < xOffSet - nameLength; i++) {
                xOffSetSpaces += " ";
            }
            console.log(
                ChartColors.gray +
                name + 
                xOffSetSpaces + 
                barLine
            );
        });


        // reset all colors
        console.log("\x1b[0m");
        
    }
}