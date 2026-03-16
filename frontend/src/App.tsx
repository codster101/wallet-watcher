// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { useEffect, useState } from 'react'
import { TransactionTable } from './TransactionTable.tsx'
import { type Transaction } from './TransactionTable.tsx'
import { Graph } from './Graph.tsx'
import type { Event } from '@table-library/react-table-library/types/table'


function App() {
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);

  async function pullTransactions() {
    const response = await fetch("api/getTransactions");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Response: " + result);
    setTransactionList(result)
  }

  useEffect(() => {
    pullTransactions();
  }, [])

  // Sends form data to backend
  async function sendData(e: Event) {
    e.preventDefault(); // Prevents page from reloading

    // Creates new form data object
    const form = e.target;
    let formData: FormData;

    // If the target was a form then send its data to the backend and pull the updated transactions
    if (form instanceof HTMLFormElement) {
      formData = new FormData(form);

      try {
        await fetch("/api/addTransaction", { method: "POST", body: formData, });

        pullTransactions();

      } catch (e) {
        console.error(e)
      }
    }
  }

  return (
    <>
      <div id='top' className='horz'>
        <form className='tile' onSubmit={sendData}>
          <div className="inputField">
            <p>Name: </p>
            <input name="TransactionName" type="text" />
          </div>
          <div className="inputField">
            <p>Amount: </p>
            <input name="TransactionAmount" type="number" />
          </div>
          <div className="inputField">
            <p>Category: </p>
            <input name="TransactionCategory" type="text" />
          </div>
          <div className="inputField">
            <p>Date: </p>
            <input name="TransactionDate" type="date" />
          </div>
          <button type="submit">Submit</button>
        </form>
        <form className='tile' action="/api/submitFile" method="post" encType='multipart/form-data'>
          <label>Input File</label>
          <input name="TransactionFile" type='file' />
          <button type="submit">Submit</button>
        </form>
        <Graph />
      </div>
      <div className='tile'>
        <TransactionTable nodes={transactionList} />
      </div>
    </>
  )
}

export default App
