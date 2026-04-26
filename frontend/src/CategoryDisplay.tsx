import { useEffect, useState } from 'react';
import type { Category } from './Category.tsx'

function getBudgetTotal(categoryList: Category[]) {
	console.log(categoryList.reduce((sum, curr) => sum + curr.budget, 0));
	return categoryList.reduce((sum, curr) => sum + curr.budget, 0);
}

function BudgetLabel({ name, budget, changeBudget }: { name: string, budget: number, changeBudget: (budgetChange: number) => void }) {
	// Value state
	const [budgetValue, updateBudget] = useState(budget);
	const [oldBudget, submitBudget] = useState(budgetValue);

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
				onBlur={() => {
					updateCategory(name, budgetValue);
					console.log(budgetValue - oldBudget);
					changeBudget(budgetValue - oldBudget);
					submitBudget(budgetValue);
				}}
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

export function CategoryDisplay({ changeBudget }: { changeBudget: (totalBudget: number) => void }) {
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
		// console.log(getBudgetTotal(result));
		changeBudget(getBudgetTotal(result));
	}

	useEffect(() => {
		getCategories(month)
	}, [month])

	function getBorderColor(budget: number, spent: number) {
		if (budget < spent) {
			return "#EF4444";
		} else if (budget > spent) {
			return "#22C55E";
		}
		return "#E3E8F0";
	}

	function getBackgroundColor(budget: number, spent: number) {
		if (budget < spent) {
			return "#FEF2F2";
		} else if (budget > spent) {
			return "#ECFDF5";
		}
		return "#F9FAFB";
	}

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
					<div key={category.id} className='tile'
						style={{
							backgroundColor: getBackgroundColor(category.budget, category.spent),
							borderColor: getBorderColor(category.budget, category.spent)
						}}>
						<p>{category.name}</p>
						<BudgetLabel
							name={category.name}
							budget={category.budget}
							changeBudget={changeBudget}
						/>
						<p>Spent: {category.spent}</p>
					</div>
				))}
			</div>
		</div>
	);
}
