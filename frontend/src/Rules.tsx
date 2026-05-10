import { useEffect, useState } from "react";
import type { Rule } from "./Rule";
import { Link } from "react-router-dom";
import './Rules.css';

export default function Rules() {
	const [rules, setRules] = useState<Rule[]>([]);

	async function getRules() {
		const response = await fetch("api/getRules");
		const result = await response.json();
		if (result != null) {
			setRules(await result);
		}
	}

	useEffect(() => { getRules(); }, [])

	async function updateRule(newValue: string, id: number, property: string) {
		const newRules = rules.map((rule) => rule.id == id ? { ...rule, [property]: newValue } : rule);
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

		// If the target was a form then send its data to the backend and pull the updated transactions
		if (form instanceof HTMLFormElement) {
			const formData = new FormData(form);

			try {
				const response = await fetch("/api/addRule", { method: "POST", body: formData, });
				const result = await response.json();
				setRules(result);

			} catch (e) {
				console.error(e)
			}
		}
	}

	return (
		<div>
			<nav className="rules-nav">
				<Link to="/" className="rules-nav-title">
					WALLET<span>WATCHER</span>
				</Link>
				<div className="rules-nav-links">
					<Link to="/" className="nav-link">Dashboard</Link>
					<Link to="/rules" className="nav-link active">Rules</Link>
				</div>
			</nav>
			<div className="rules-body">
				<div className="rules-header">
					<h1>RULES</h1>
					<p>Auto-categorize transactions by name pattern</p>
				</div>
				<div>
					<div className="add-rule-card">
						<h2>New Rule</h2>
						<form onSubmit={sendData}>

							<div className="rule-form-row">
								<div className="form-group">
									<label>Operator</label>
									<select name="Operator">
										<option>contains</option>
									</select>
								</div>

								<div className="form-group">
									<label>Target</label>
									<input type='text' name="Target"></input>
								</div>

								<div className="form-group">
									<label>Category</label>
									<input type='text' name="Category"></input>
								</div>

								<button type="submit" className="btn-add">Add</button>
							</div>
						</form>
					</div>
					{rules.map((rule) => (
						<div key={rule.id} className="rule-item">
							<div className="rule-field">
								<span className="rule-field-label">Operator</span>
								<select className="rule-operator-badge" defaultValue={rule.operator} onChange={(e) => updateRule(e.target.value, rule.id, "Category")}>
									<option>contains</option>
								</select>
							</div>

							<div className="rule-field">
								<span className="rule-field-label">Target</span>
								<input type='text' defaultValue={rule.target} onBlur={(e) => updateRule(e.target.value, rule.id, "Target")}
									onKeyDown={(e) => { if (e.key == "Enter") e.currentTarget.blur() }} />
							</div>

							<div className="rule-field">
								<span className="rule-field-label">Category</span>
								<input type='text' defaultValue={rule.category} onBlur={(e) => updateRule(e.target.value, rule.id, "Category")}
									onKeyDown={(e) => { if (e.key == "Enter") e.currentTarget.blur() }} />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
