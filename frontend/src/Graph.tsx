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
import type { Category } from './Category.tsx';

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

export function Graph({ categories }: { categories: Category[] }) {

	function SpentLine() {
		if (categories == null || categories.length == 0) return Array(12).fill(0);
		return categories.reduce((sum, current) => current.name != "Income" ? sum.map((x, i) => x + current.spent[i]) : sum, Array(12).fill(0));
	}

	function IncomeLine() {
		if (categories == null || categories.length == 0) return Array(12).fill(0);
		return categories.reduce((sum, current) => current.name == "Income" ? sum.map((x, i) => x + current.spent[i]) : sum, Array(12).fill(0));
	}

	function BudgetLine() {
		if (categories == null || categories.length == 0) return Array(12).fill(0);
		return Array(12).fill(categories.reduce((sum, current) => current.name != "Income" ? sum + current.budget : sum, 0));
	}

	const data = {
		labels,
		datasets: [
			{
				label: 'Spent',
				data: SpentLine(),
				borderColor: 'rgb(255, 99, 132)',
				backgroundColor: 'rgb(255, 99, 132)',
			},
			{
				label: 'Income',
				data: IncomeLine(),
				borderColor: 'rgb(99, 255, 132)',
				backgroundColor: 'rgb(99, 255, 132)',
			},
			{
				label: 'Budget',
				data: BudgetLine(),
				borderColor: 'rgb(132, 99, 255)',
				backgroundColor: 'rgb(132, 99, 255)',
			},
		]
	}

	return <Line options={options} data={data} />
};

