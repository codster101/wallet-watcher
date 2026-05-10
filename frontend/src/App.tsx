
import { useEffect, useState } from 'react'
import { TransactionTable } from './TransactionTable.tsx'
import { type Transaction } from './Transaction.tsx'
import { Graph } from './Graph.tsx'
import { CategoryDisplay } from './CategoryDisplay.tsx'
import type { Identifier } from '@table-library/react-table-library/types/table'
import SubmitMenu from './SubmitMenu.tsx'
import type { Category } from './Category.tsx'
import './App.css'


function App() {
  const [transactionList, setTransactionList] = useState<Transaction[]>([]);
  const [categories, updateCategories] = useState<Category[]>([]);
  const [submitMenuOpen, setSubmitMenuOpen] = useState(false);

  async function loadPage() {

    let response = await fetch("api/loadPage");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let result = await response.json();
    setTransactionList(result.transactions);
    updateCategories(result.categories);

  }

  async function pullTransactions() {
    console.time("Pull Transactions");
    let response = await fetch("api/getTransactions");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let result = await response.json();
    // console.log("Response: " + JSON.stringify(result));
    setTransactionList(result)

    updateGraph();
    console.timeEnd("Pull Transactions");
  }

  async function addTransactions(newTransactions: Transaction[]) {

    console.time("Add Transactions");
    await fetch("/api/addTransactions", { method: "POST", body: JSON.stringify(newTransactions) });

    pullTransactions();

    console.timeEnd("Add Transactions");
  }

  async function updateTransaction(value: string, id: Identifier, property: string) {
    console.time("Update Transactions");
    let response = await fetch("api/updateTransaction", {
      method: "POST",
      body: JSON.stringify({ value: value, id: id, property: property })
    });
    if (!response.ok) {
      throw new Error('Response status: ${response.status}');
    }

    pullTransactions();
    console.timeEnd("Update Transactions");
  }

  async function deleteTransaction(idsToDelete: Set<Identifier>) {
    console.time("Delete Transactions");
    let response = await fetch("api/deleteTransactions", {
      method: "POST",
      body: JSON.stringify({ ids: [...idsToDelete] })
    });
    if (!response.ok) {
      throw new Error('Response status: ${response.status}');
    }

    pullTransactions();
    console.timeEnd("Delete Transactions");
  }

  async function updateGraph() {
    console.time("Update Spent Line");
    let response = await fetch("api/getCategories");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let result = await response.json();
    // console.log("Response: " + JSON.stringify(result));
    console.timeEnd("Update Spent Line");
    updateCategories(result)

  }

  function changeBudget(name: string, change: number) {
    const updatedCategories = categories.map(c => c.name == name ? { ...c, budget: c.budget + change } : c);
    updateCategories(updatedCategories);
  }

  useEffect(() => {
    loadPage();
  }, [])

  // Sends form data to backend
  async function sendData(e: React.SubmitEvent<HTMLFormElement>) {
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

            <div className="tile">
              <button onClick={() => { setSubmitMenuOpen(true) }} style={{ width: "100%" }}>Add Transaction</button>
            </div>
          </div>

          <div id='graph-div' className='tile tile-2'>
            <Graph categories={categories} />
          </div>

          <div className='tile tile-3'>
            <TransactionTable nodes={transactionList} handleUpdate={updateTransaction} handleDelete={deleteTransaction} />
          </div>
        </div>
        <CategoryDisplay categories={categories} changeBudget={changeBudget} />
      </div>
      {submitMenuOpen && (<SubmitMenu setSubmitMenuOpen={setSubmitMenuOpen} submitTransactions={addTransactions} />)}
    </>
  )
}

export default App
