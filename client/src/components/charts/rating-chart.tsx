import { useEffect, useRef } from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";

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

interface RatingChartProps {
  data: Array<{
    date: string;
    avgRating: number;
    count: number;
  }>;
}

export default function RatingChart({ data }: RatingChartProps) {
  const chartData = {
    labels: data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
    }),
    datasets: [
      {
        label: 'Average Rating',
        data: data.map(item => parseFloat(item.avgRating.toString())),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'hsl(var(--primary))',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'hsl(var(--popover))',
        titleColor: 'hsl(var(--popover-foreground))',
        bodyColor: 'hsl(var(--popover-foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const dataPoint = data[context[0].dataIndex];
            return new Date(dataPoint.date).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            });
          },
          label: (context: any) => {
            const dataPoint = data[context.dataIndex];
            return [
              `Average Rating: ${parseFloat(dataPoint.avgRating.toString()).toFixed(1)}`,
              `Reviews: ${dataPoint.count}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 3.5,
        max: 5,
        grid: {
          color: 'hsl(var(--muted) / 0.5)',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          stepSize: 0.5,
          callback: function(value: any) {
            return value.toFixed(1);
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          maxTicksLimit: 8,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  // Show empty state if no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <p>No rating data available</p>
          <p className="text-sm">Data will appear as reviews are processed</p>
        </div>
      </div>
    );
  }

  return <Line data={chartData} options={options} />;
}
