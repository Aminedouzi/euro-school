import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function RevenueChart({ data }) {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const revenues = data && data.length > 0 ? data : [8400, 10200, 9800, 12100, 11800, 13200, 14500, 15200, 14800, 16100, 17800, 18450];

    const chartData = {
        labels: months,
        datasets: [
            {
                label: 'Revenu (dh)',
                data: revenues,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#4f46e5',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
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
                        return 'dh ' + context.parsed.y.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return 'dh ' + (value / 1000).toFixed(1) + 'k';
                    },
                    color: '#94a3b8',
                    font: { size: 12 },
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

    return <Line data={chartData} options={options} height={300} />;
}
