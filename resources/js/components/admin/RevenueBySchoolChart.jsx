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

export default function RevenueBySchoolChart({ data }) {
    const rows = Array.isArray(data) ? data : [];
    const labels = rows.map((r) => r.school_name || '—');
    const totals = rows.map((r) => Number(r.total) || 0);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Revenu (DH)',
                data: totals,
                backgroundColor: '#059669',
                borderColor: '#047857',
                borderWidth: 0,
                borderRadius: 8,
                hoverBackgroundColor: '#10b981',
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
                callbacks: {
                    label: function (context) {
                        const v = context.parsed.y;
                        return ` ${v.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DH`;
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
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false,
                },
            },
            x: {
                ticks: {
                    color: '#94a3b8',
                    font: { size: 11 },
                    maxRotation: 45,
                    minRotation: 0,
                },
                grid: {
                    display: false,
                    drawBorder: false,
                },
            },
        },
    };

    if (rows.length === 0) {
        return (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                Aucun paiement complété à attribuer par école.
            </p>
        );
    }

    return <Bar data={chartData} options={options} height={300} />;
}
