import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function StudentDistributionChart({ data }) {
    const levels = ['A1 Intro', 'A2 Basic', 'B1 Inter', 'B2 Adv'];
    const students = data && data.length > 0 ? data : [245, 185, 128, 75];

    const chartData = {
        labels: levels,
        datasets: [
            {
                label: 'Nombre d\'élèves',
                data: students,
                backgroundColor: '#4f46e5',
                borderColor: '#4f46e5',
                borderWidth: 0,
                borderRadius: 8,
                hoverBackgroundColor: '#6366f1',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                callbacks: {
                    label: function (context) {
                        return context.parsed.y + ' élèves';
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#94a3b8',
                    font: { size: 12 },
                    stepSize: 50,
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false,
                },
            },
            x: {
                ticks: {
                    color: '#94a3b8',
                    font: { size: 12 },
                },
                grid: {
                    display: false,
                    drawBorder: false,
                },
            },
        },
    };

    return <Bar data={chartData} options={options} height={300} />;
}
