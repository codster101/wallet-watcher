import { useState } from 'react';
import type { Category } from './Category.tsx'

// function getBudgetTotal(categoryList: Category[]) {
// 	console.log(categoryList.reduce((sum, curr) => sum + curr.budget, 0));
// 	return categoryList.reduce((sum, curr) => sum + curr.budget, 0);
// }

function BudgetLabel({ name, budget, changeBudget }: { name: string, budget: number, changeBudget: (name: string, budgetChange: number) => void }) {
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
			<input
				className='cat-budget-input'
				type='number'
				value={budgetValue}
				onChange={(event) => { updateBudget(Number.parseFloat(event.target.value)) }}
				onBlur={() => {
					updateCategory(name, budgetValue);
					changeBudget(name, budgetValue - oldBudget);
					submitBudget(budgetValue);
				}}
				onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
			/>
		</div>
	);
}

export function CategoryDisplay({ categories, changeBudget }: { categories: Category[], changeBudget: (name: string, totalBudget: number) => void }) {
	const months = [
		"January", "February", "March", "April",
		"May", "June", "July", "August",
		"September", "October", "November", "December"
	];

	const [month, setMonth] = useState((new Date()).getMonth())

	function cardClass(budget: number, spent: number) {
		if (spent === 0) return 'cat-card'
		return spent > budget ? 'cat-card over' : 'cat-card ok'
	}

	function spentClass(budget: number, spent: number) {
		if (spent === 0) return 'cat-spent empty'
		return spent > budget ? 'cat-spent over' : 'cat-spent ok'
	}

	return (
		<div className='cat-strip'>
			<div className='cat-strip-header'>
				<span className='sec-label' style={{ margin: 0 }}>Categories</span>
				<select defaultValue={month} className='month-select' onChange={(event) => {
					setMonth(Number.parseInt(event.target.value));
				}}>
					{months.map((month, i) => (
						<option key={i} value={i}>{month}</option>
					))}:
				</select>
			</div>

			<div className='cat-scroll'>
				{categories.map((category) => (
					<div key={category.name} className={cardClass(category.budget, category.spent[month])}>
						<div className="cat-name">{category.name}</div>
						<div className="cat-budget-row">
							<span className="cat-budget-label">Budget</span>
							<BudgetLabel name={category.name} budget={category.budget} changeBudget={changeBudget} />
						</div>
						<div className={spentClass(category.budget, category.spent[month])}>
							${category.spent[month].toFixed(2)} spent
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
