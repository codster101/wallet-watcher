import { useEffect, useState } from 'react';
import type { Category } from './Category.tsx'


function BudgetLine({ name, budget }: { name: string, budget: number }) {
	// Value state
	const [budgetValue, updateBudget] = useState(budget);

	async function updateCategory(name: string, amount: number) {
		let response = await fetch("api/updateCategory", {
			method: "POST",
			body: JSON.stringify({ name: name, amount: amount })
		});
		if (!response.ok) {
			throw new Error('Response status: ${response.status}');
		}
	}

	// Return in-edit element
	return (
		<div style={{ display: "flex", alignItems: "center", gap: "4%" }}>
			<p>Budgeted: </p>
			<input style={{ width: "75px" }}
				type='number'
				value={budgetValue}
				onChange={(event) => { updateBudget(Number.parseFloat(event.target.value)) }}
				onBlur={() => { updateCategory(name, budgetValue) }}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						updateCategory(name, budgetValue);
						event.currentTarget.blur();
					}
				}}
			/>
		</div>
	);
}

// export function CategoryDisplay({ categories, handleUpdate, getCategories }:
// { categories: Category[], handleUpdate: (name: string, amount: number) => void, getCategories: (month: number) => Category[] }) {
export function CategoryDisplay() {
	const months = [
		"January", "February", "March", "April",
		"May", "June", "July", "August",
		"September", "October", "November", "December"
	];

	const [month, setMonth] = useState((new Date()).getMonth())

	const [categories, setCategories] = useState<Category[]>([]);

	async function getCategories(month: number) {
		const response = await fetch("api/getCategoryTotals", {
			method: "POST",
			body: JSON.stringify({ month: month })
		});
		if (!response.ok) {
			throw new Error(`Response status: ${response.status}`);
		}

		const result = await response.json();
		// console.log("Response: " + JSON.stringify(result));
		setCategories(result);
	}

	useEffect(() => {
		getCategories(month)
	}, [month])

	return (
		<div id='right-panel'>
			<select defaultValue={month} onChange={(event) => {
				setMonth(Number.parseInt(event.target.value));
			}}>
				{months.map((month, i) => (
					<option key={i + 1} value={i + 1}>{month}</option>
				))}
			</select>
			<div id='category-grid'>
				{categories.map((category) => (
					<div key={category.id} className='tile'>
						<p>{category.name}</p>
						<BudgetLine
							name={category.name}
							budget={category.budget}
						/>
						<p>Spent: {category.spent}</p>
					</div>
				))}
			</div>
		</div>
	);
}
