import { useRef, useState } from "react";
import ImportTable from "./ImportTable";
import type { Transaction } from "./Transaction";

export default function SubmitMenu({ setSubmitMenuOpen, submitTransactions }: { setSubmitMenuOpen: (isOpen: boolean) => void, submitTransactions: (newTransactions: Transaction[]) => {} }) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [fileFormat, updateFileFormat] = useState("card")
	const [importedTransactions, updateImportedTransactions] = useState<Transaction[]>([])

	// function readFile(file: File): Promise<string> {
	// 	return new Promise((resolve, reject) => {
	// 		const reader = new FileReader();
	// 		reader.onload = () => resolve(reader.result as string);
	// 		reader.onerror = () => reject(reader.error);
	// 		reader.readAsText(file);
	// 	});
	// }
	//
	// function parseRow(row: string): Transaction {
	// 	const fields = row.split(",");
	//
	// 	let transaction: Transaction = { name: "", amount: 0, category: "", date: "", id: 0 };
	// 	let amount = 0.0;
	// 	let dateString = "";
	// 	let [month, day, year] = ["", "", ""];
	// 	switch (fileFormat) {
	// 		case "card":
	// 			amount = isNaN(Number.parseFloat(fields[5])) ? 0.00 : Math.abs(Number.parseFloat(fields[5]));
	// 			console.log(fields[0]);
	// 			[month, day, year] = fields[0].split("/");
	// 			console.log([month, day, year]);
	// 			dateString = `${year}-${month}-${day}`;
	// 			transaction = { name: fields[2], amount: amount, category: fields[3], date: dateString, id: 0 };
	// 			break;
	// 		case "bank-account":
	// 			amount = isNaN(Number.parseFloat(fields[3])) ? 0.00 : Math.abs(Number.parseFloat(fields[3]));;
	// 			[month, day, year] = fields[0].split("/");
	// 			dateString = `${year}-${month}-${day}`;
	// 			transaction = { name: fields[2], amount: amount, category: fields[4], date: dateString, id: 0 };
	// 			break;
	// 	}
	//
	// 	// console.log(transaction);
	// 	return transaction;
	// }

	// async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
	// 	const file = e.target.files?.[0];
	// 	if (!file) return;
	//
	// 	// If the target was a form then send its data to the backend and pull the updated transactions
	// 	try {
	//
	// 		let rows = (await readFile(file)).split('\n');
	// 		rows = rows.slice(1, -1);
	//
	// 		let result: Transaction[] = new Array();
	//
	// 		rows.map((r, i) => result.push({ ...parseRow(r), id: i })); // Maps each row to a Transaction with an id of the row number
	// 		updateImportedTransactions(result);
	//
	// 	} catch (e) {
	// 		console.error(e)
	// 	}
	// }

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		let form = new FormData();
		form.append("format", fileFormat);
		form.append("file", file);

		// If the target was a form then send its data to the backend and pull the updated transactions
		try {

			const response = await fetch("api/submitFile", { method: 'POST', body: form });
			let result: Transaction[] = await response.json();

			const indexedResult = result.map((t, i) => { return { ...t, id: i } });
			updateImportedTransactions(indexedResult);

		} catch (e) {
			console.error(e)
		}
	}

	function closeMenu(transactions: Transaction[]) {
		submitTransactions(transactions);
		setSubmitMenuOpen(false);
	}

	return (
		<div className="menu-backdrop" onClick={e => { if (e.target === e.currentTarget) setSubmitMenuOpen(false) }}>
			<div className="submit-menu">
				<div className="submit-menu-header">
					<h1>Import Transaction</h1>
					<button className="btn-secondary" onClick={() => setSubmitMenuOpen(false)}>Close</button>
				</div>
				<div className="submit-menu-body">
					<div className="submit-menu-row">
						<span className="sec-label" style={{ margin: 0 }}>Format</span>
						<div className="format-toggle">
							<button
								className={`format-btn${fileFormat === 'card' ? ' active' : ''}`}
								onClick={() => updateFileFormat('card')}
							>
								Card
							</button>
							<button
								className={`format-btn${fileFormat === 'bank-account' ? ' active' : ''}`}
								onClick={() => updateFileFormat('bank-account')}
							>
								Bank account
							</button>
						</div>

						<input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
						<button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => fileInputRef.current?.click()}>SelectFile</button>
					</div>

					<div className="submit-menu-table-wrap">
						<ImportTable nodes={importedTransactions} submitTransactions={closeMenu} />
					</div>
				</div>


			</div>
		</div>
	);
}
