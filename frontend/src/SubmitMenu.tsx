import { useRef, useState } from "react";

export default function SubmitMenu({ setSubmitMenuOpen }: { setSubmitMenuOpen: (isOpen: boolean) => void }) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [fileFormat, updateFileFormat] = useState("card")

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		console.log(file.name);

		let form = new FormData();
		form.append("format", fileFormat);
		form.append("file", file);

		// If the target was a form then send its data to the backend and pull the updated transactions
		try {
			await fetch("/api/submitFile", { method: "POST", body: form, });
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
		</div>
	);
}
