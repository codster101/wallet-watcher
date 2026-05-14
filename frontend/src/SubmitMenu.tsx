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
						<button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => fileInputRef.current?.click()}>Select File</button>
					</div>

					<div className="submit-menu-table-wrap">
						<ImportTable nodes={importedTransactions} submitTransactions={closeMenu} />
					</div>
				</div>


			</div>
		</div>
	);
}
