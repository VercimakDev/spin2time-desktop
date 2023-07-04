import { Bar, mixins } from "vue-chartjs";
const { reactiveProp } = mixins;



export default {
    extends: Bar,
    mixins: [reactiveProp],
    props: ['options', 'chartData'],
    mounted() {
        this.renderChart(this.chartData, this.options);
    },
    watch: {
        chartData() {
            this.$data._chart.update();
        },
        options() {
            this.$data._chart.destroy()
            this.renderChart(this.chartData, this.options);
        }
    }
};

