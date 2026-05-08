import { useEffect, useState } from "react";
import type { Rule } from "./Rule";

export default function Rules() {
	const [rules, setRules] = useState<Rule[]>([]);

	async function getRules() {
		const response = await fetch("api/getRules");
		const result = await response.json();
		if (result != null) {
			setRules(await result);
			console.log("Rules set");
			console.log(await result);
		}

		console.log(rules);
	}

	useEffect(() => { getRules(); }, [])

	async function updateRule(newValue: string, id: number, property: string) {
		const newRules = rules.map((rule) => rule.Id == id ? { ...rule, [property]: newValue } : rule);
		setRules(newRules);

		const response = await fetch("api/updateRule", { method: 'POST', body: JSON.stringify({ "value": newValue, "id": id, "property": property }) });
		if (!response.ok) {
			throw new Error('Response status: ${response.status}');
		}
	}

	async function sendData(e: React.SubmitEvent<HTMLFormElement>) {
		e.preventDefault(); // Prevents page from reloading

		// Creates new form data object
		const form = e.target;
		let formData: FormData;

		// If the target was a form then send its data to the backend and pull the updated transactions
		if (form instanceof HTMLFormElement) {
			formData = new FormData(form);

			try {
				await fetch("/api/addRule", { method: "POST", body: formData, });

			} catch (e) {
				console.error(e)
			}
		}
	}

	return (
		<>
			<h1>Rules</h1>
			<div>
				<div>
					<form onSubmit={sendData}>
						<label>Operator</label>
						<select name="Operator">
							<option>contains</option>
						</select>
						<label>Target</label>
						<input type='text' name="Target"></input>
						<label>Category</label>
						<input type='text' name="Category"></input>
						<button type="submit">Add</button>
					</form>
				</div>
				{rules.map((rule) => (
					<div key={rule.id}>
						<form>
							<label>Operator</label>
							<select onChange={(e) => updateRule(e.target.value, rule.id, "Category")}>
								<option>contains</option>
							</select>
							<label>Target</label>
							<input type='text' defaultValue={rule.target} onBlur={(e) => updateRule(e.target.value, rule.id, "Target")}></input>
							<label>Category</label>
							<input type='text' defaultValue={rule.category} onBlur={(e) => updateRule(e.target.value, rule.id, "Category")}></input>
						</form>
					</div>
				))}
			</div>
		</>
	);
}
