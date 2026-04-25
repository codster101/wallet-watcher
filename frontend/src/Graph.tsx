// import { } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { type Transaction } from './Transaction.tsx'

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

type Line = {
	label: string,
	data: number[],
	borderColor: string,
	backgroundColor: string,
}
export type Lines = Line[];

export const options = {
	responsive: true,
	plugins: {
		legend: {
			position: 'top' as const,
		},
		title: {
			display: true,
			text: 'Chart.js Line Chart',
		},
	},
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function Graph({ allSpentMonthlyTotals, incomeMonthlyTotals, budgetTotal }: { allSpentMonthlyTotals: number[], incomeMonthlyTotals: number[], budgetTotal: number }) {

	function GetMonthlyBudgetTotal() {
		return (new Array(12)).fill(budgetTotal);
	}

	const data = {
		labels,
		datasets: [
			{
				label: 'Spent',
				data: allSpentMonthlyTotals,
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgb(255, 99, 132)',
			},
			{
				label: 'Income',
				data: incomeMonthlyTotals,
				borderColor: 'rgb(99, 255, 132)',
				backgroundColor: 'rgb(99, 255, 132)',
			},
			{
				label: 'Budget',
				data: GetMonthlyBudgetTotal(),
				borderColor: 'rgb(132, 99, 255)',
				backgroundColor: 'rgb(132, 99, 255)',
			},
		]
	}

	return <Line options={options} data={data} />
};

