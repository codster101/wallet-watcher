import './App.css'
import { useEffect, useState } from 'react'
import { TransactionTable } from './TransactionTable.tsx'
import { type Transaction } from './Transaction.tsx'
import { Graph } from './Graph.tsx'
import { CategoryDisplay } from './CategoryDisplay.tsx'
import type { Event, Identifier } from '@table-library/react-table-library/types/table'


function App() {
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [allSpentMonthlyTotals, setSpentLine] = useState<number[]>([]);
  const [incomeMonthlyTotals, setIncomeLine] = useState<number[]>([]);
  const [budgetTotal, updateTotalBudget] = useState(0);

  async function pullTransactions() {
    let response = await fetch("api/getTransactions");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let result = await response.json();
    // console.log("Response: " + JSON.stringify(result));
    setTransactionList(result)

    updateGraphSpentLine();
  }

  async function updateTransaction(value: string, id: Identifier, property: string) {
    let response = await fetch("api/updateTransaction", {
      method: "POST",
      body: JSON.stringify({ value: value, id: id, property: property })
    });
    if (!response.ok) {
      throw new Error('Response status: ${response.status}');
    }

    pullTransactions();
  }

  async function updateGraphSpentLine() {
    let response = await fetch("api/getAllSpentMonthlyTotals");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let result = await response.json();
    // console.log("Response: " + JSON.stringify(result));
    setSpentLine(result)

    response = await fetch("api/getIncomeMonthlyTotals");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    result = await response.json();
    // console.log("Response: " + JSON.stringify(result));
    setIncomeLine(result)
  }

  function changeBudget(change: number) {
    console.log(budgetTotal + change);
    updateTotalBudget(budgetTotal + change);
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
      <h1 id='title'> WALLET<span>WATCHER</span></h1>
      <div id='dashboard'>
        <div id='left-panel'>
          <div>
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
          </div>

          <div id='graph-div' className='tile tile-2'>
            <Graph allSpentMonthlyTotals={allSpentMonthlyTotals} incomeMonthlyTotals={incomeMonthlyTotals} budgetTotal={budgetTotal} />
          </div>

          <div className='tile tile-3'>
            <TransactionTable nodes={transactionList} handleUpdate={updateTransaction} />
          </div>
        </div>
        <CategoryDisplay changeBudget={changeBudget} />
      </div>
    </>
  )
}

export default App
