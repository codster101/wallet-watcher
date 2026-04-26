
export default function InputTransactionButton({ setSubmitMenuOpen }: { setSubmitMenuOpen: (isOpen: boolean) => void }) {

	return (
		<div className="tile">
			<button onClick={() => { setSubmitMenuOpen(true) }} style={{}}>Add Transaction</button>
		</div>
	);
}
// <form className='tile' action="/api/submitFile" method="post" encType='multipart/form-data'>
// 	<label>Input File</label>
// 	<input name="TransactionFile" type='file' />
// 	<button type="submit">Submit</button>
// </form>
