import { ChartData, ChartOptions } from 'chart.js'
import jMoment from 'moment-jalaali'
import { Line, mixins } from 'vue-chartjs'
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'

const { reactiveProp } = mixins

@Component({
    extends: Line,
    mixins: [reactiveProp],
})
export default class LineChart extends Vue {
    @Prop({ default: () => ({}) }) public chartData: { x: string[]; y: number[] }

    private dataset: ChartData = {}

    // @Watch('chartData', { immediate: true })
    // private onDataChange(val: any) {
    //     console.log(val)
    //     this.dataset.labels = val.x
    //     this.dataset.datasets[0].data = val.y
    // }

    private mounted() {
        const ctx = (this.$refs.canvas as HTMLCanvasElement).getContext('2d')
        const gradientStroke = ctx.createLinearGradient(500, 0, 100, 0)
        gradientStroke.addColorStop(0, '#ff6c00')
        gradientStroke.addColorStop(1, '#ff3b74')

        const gradientBkgrd = ctx.createLinearGradient(0, 100, 0, 400)
        gradientBkgrd.addColorStop(0, 'rgba(244,94,132,0.2)');
        gradientBkgrd.addColorStop(1, 'rgba(249,135,94,0)')

        this.dataset = {
            labels: this.chartData.x,
            datasets: [
              {
                data: this.chartData.y,
                backgroundColor: gradientBkgrd,
                borderColor: gradientStroke,
                pointBorderColor: 'rgba(255,255,255,0)',
                pointBackgroundColor: 'rgba(255,255,255,0)',
                pointBorderWidth: 4,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#ff3b74',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 4,
                pointRadius: 1,
                borderWidth: 5,
                pointHitRadius: 16,
              }
            ]
          };

        const opts = {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
              display: false
            },
            scales: {
              xAxes: [{
                gridLines: { display: false },
                ticks: {
                  fontFamily: 'Iransans-medium',
                  callback: (v: string) => jMoment(v).format('jD jMMMM'),
                  maxRotation: 90,
                  minRotation: 90,
                  mirror: true,
                  min: 0
                }
              }],
              yAxes: [{
                display: false,
                gridLines: { display: false },
                ticks: {
                  fontFamily: 'Iransans-medium',
                  callback: (v: string) => v + '°C'
                }
              }]
            }
          };

        // @ts-ignore
        this.renderChart(this.dataset, opts)
    }
}
