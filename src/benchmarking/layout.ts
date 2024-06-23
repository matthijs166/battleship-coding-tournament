import Chart, { ChartColors } from "./chart";

export type LayoutData = {
    brainStats: BrainStat[],
    progress: {
        current: number;
        total: number;
    }
    CPUStats: [
        {
            core: number;
            load: number;
        }
    ]
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

const chartWidth = 50;
const xOffSet = 20;

export function renderLayout(data: LayoutData) {
    if (!data) {
        return;
    }

    // Win Rate
    const winChart = new Chart({
        width: chartWidth,
        maxValue: 100,
        xOffSet: 10,
        xOffSet: xOffSet,
        title: "Wining Rate"
    })
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
        maxValue: 100,
        xOffSet: 10,
        xOffSet: xOffSet,
        title: "Losing Rate"
    })
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
        maxValue: 100,
        xOffSet: 10,
        xOffSet: xOffSet,
        title: "Taken Hits"
    })
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
        maxValue: 100,
        xOffSet: 10,
        xOffSet: xOffSet,
        title: "Given Hits"
    })
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
    //     xOffSet: 10,
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
    // const crashesChart = new Chart({
    //     width: chartWidth,
    //     xOffSet: 10,
    //     title: "Crashes"
    // })
    // data.brainStats.forEach((brainStat) => {
    //     crashesChart.addBar({
    //         value: brainStat.crashes,
    //         color: brainStat.color,
    //         name: brainStat.name
    //     })
    // })
    // crashesChart.render();

    // Progress
    const progressChart = new Chart({
        width: chartWidth,
        maxValue: data.progress.total,
        xOffSet: 10,
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
    const cpuLoadChart = new Chart({
        width: chartWidth,
        maxValue: 100,
        xOffSet: 10,
        xOffSet: xOffSet,
        title: "CPU Load"
    })
    data.CPUStats.forEach((coreStat, i) => {
        cpuLoadChart.addBar({
            value: coreStat.load,
            color: i % 2 === 0 ? ChartColors.green : ChartColors.red,
            name: "Core " + coreStat.core
        })
    })
    cpuLoadChart.render();

}