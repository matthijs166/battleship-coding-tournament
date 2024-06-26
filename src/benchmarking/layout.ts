import Chart, { ChartColors } from "./chart";

export type LayoutData = {
    brainStats: BrainStat[],
    progress: {
        current: number;
        total: number;
    }
    chartWidth?: number;
}

export type BrainStat = {
    name: string;
    winRate: number;
    loseRate: number;
    takenHits: number;
    givenHits: number;
    // avgTurnTime: number;
    crashes: number;
    color: ChartColors;
}



export function renderLayout(data: LayoutData) {
    let chartWidth: number = isNaN(data.chartWidth ?? NaN) ? 50 : data.chartWidth ?? 50;
    const xOffSet = 15;

    if (!data) {
        return;
    }

    // Win Rate
    const winChart = new Chart({
        width: chartWidth,
        maxValue: data.brainStats.reduce((acc, brainStat) => Math.max(acc, brainStat.winRate), 0),
        xOffSet: xOffSet,
        title: "Wining Rate"
    })
    // sort by win rate
    data.brainStats.sort((a, b) => b.winRate - a.winRate)
    data.brainStats.forEach((brainStat) => {
        winChart.addBar({
            value: brainStat.winRate,
            color: brainStat.color,
            name: brainStat.name
        })
    })
    winChart.render();

    // Lose Rate
    const loseChart = new Chart({
        width: chartWidth,
        maxValue: data.brainStats.reduce((acc, brainStat) => Math.max(acc, brainStat.loseRate), 0),
        xOffSet: xOffSet,
        title: "Losing Rate"
    })
    // sort by lose rate
    data.brainStats.sort((a, b) => b.loseRate - a.loseRate)
    data.brainStats.forEach((brainStat) => {
        loseChart.addBar({
            value: brainStat.loseRate,
            color: brainStat.color,
            name: brainStat.name
        })
    })
    loseChart.render();

    // Taken Hits
    const takenHitsChart = new Chart({
        width: chartWidth,
        maxValue: data.brainStats.reduce((acc, brainStat) => Math.max(acc, brainStat.takenHits), 0),
        xOffSet: xOffSet,
        title: "Taken Hits"
    })
    // sort by taken hits
    data.brainStats.sort((a, b) => b.takenHits - a.takenHits)
    data.brainStats.forEach((brainStat) => {
        takenHitsChart.addBar({
            value: brainStat.takenHits,
            color: brainStat.color,
            name: brainStat.name
        })
    })
    takenHitsChart.render();

    // Given Hits
    const givenHitsChart = new Chart({
        width: chartWidth,
        maxValue: data.brainStats.reduce((acc, brainStat) => Math.max(acc, brainStat.givenHits), 0),
        xOffSet: xOffSet,
        title: "Given Hits"
    })
    // sort by given hits
    data.brainStats.sort((a, b) => b.givenHits - a.givenHits)
    data.brainStats.forEach((brainStat) => {
        givenHitsChart.addBar({
            value: brainStat.givenHits,
            color: brainStat.color,
            name: brainStat.name
        })
    })
    givenHitsChart.render();

    // Average Turn Time
    // const avgTurnTimeChart = new Chart({
    //     width: chartWidth,
    //     xOffSet: xOffSet,
    //     title: "Average Turn Time"
    // })
    // data.brainStats.forEach((brainStat) => {
    //     avgTurnTimeChart.addBar({
    //         value: brainStat.avgTurnTime,
    //         color: brainStat.color,
    //         name: brainStat.name
    //     })
    // })
    // avgTurnTimeChart.render();

    // Crashes
    const crashesChart = new Chart({
        width: chartWidth,
        maxValue: data.brainStats.reduce((acc, brainStat) => Math.max(acc, brainStat.crashes), 0),
        xOffSet: xOffSet,
        title: "Crashes"
    })
    // sort by crashes
    data.brainStats.sort((a, b) => b.crashes - a.crashes)
    data.brainStats.forEach((brainStat) => {
        crashesChart.addBar({
            value: brainStat.crashes,
            color: brainStat.color,
            name: brainStat.name
        })
    })
    crashesChart.render();

    // Progress
    const progressChart = new Chart({
        width: chartWidth,
        maxValue: data.progress.total,
        xOffSet: xOffSet,
        title: "Benchmark progress:"
    })
    progressChart.addBar({
        value: data.progress.current,
        color: ChartColors.green,
        name: data.progress.current + "/" + data.progress.total
    })
    progressChart.render();

    // CPU Load
    // const cpuLoadChart = new Chart({
    //     width: chartWidth,
    //     maxValue: 100,
    //     xOffSet: xOffSet,
    //     title: "CPU Load"
    // })
    // data.CPUStats.forEach((coreStat, i) => {
    //     cpuLoadChart.addBar({
    //         value: coreStat.load,
    //         color: i % 2 === 0 ? ChartColors.green : ChartColors.red,
    //         name: "Core " + coreStat.core
    //     })
    // })
    // cpuLoadChart.render();

}