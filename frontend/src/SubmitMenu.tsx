import { useRef, useState } from "react";
import ImportTable from "./ImportTable";
import type { Transaction } from "./Transaction";

export default function SubmitMenu({ setSubmitMenuOpen, submitTransactions }: { setSubmitMenuOpen: (isOpen: boolean) => void, submitTransactions: (newTransactions: Transaction[]) => {} }) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [fileFormat, updateFileFormat] = useState("card")
	const [importedTransactions, updateImportedTransactions] = useState<Transaction[]>([])

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		console.log(file.name);

		let form = new FormData();
		form.append("format", fileFormat);
		form.append("file", file);

		// If the target was a form then send its data to the backend and pull the updated transactions
		try {
			const response = await fetch("/api/submitFile", { method: "POST", body: form, });
			let result: Transaction[] = await response.json();

			let i = 0;
			const indexedResult = result.map((t) => {
				let indexedTransaction = t;
				indexedTransaction.id = i++;
				return indexedTransaction;
			});
			console.log(indexedResult);
			updateImportedTransactions(indexedResult);

		} catch (e) {
			console.error(e)
		}
	}

	return (
		<div className="menu-backdrop">
			<div id="submit-menu">
				<h1>Submit</h1>
				<input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
				<button className="submit-menu-buttons" onClick={() => fileInputRef.current?.click()}>SelectFile</button>
				<br />
				<button className={fileFormat == "card" ? "submit-menu-buttons selected-button" : "submit-menu-buttons"}
					onClick={() => { updateFileFormat("card") }}>Card</button>
				<button className={fileFormat == "bank-account" ? "submit-menu-buttons selected-button" : "submit-menu-buttons"}
					onClick={() => { updateFileFormat("bank-account") }}>Bank Account</button>
				<br />
				<button className="submit-menu-buttons" onClick={() => setSubmitMenuOpen(false)}>Close</button>
			</div>
			<ImportTable nodes={importedTransactions} submitTransactions={submitTransactions} />
		</div>
	);
}
