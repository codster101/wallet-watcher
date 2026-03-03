// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Component from './TransactionTable.tsx'

function App() {

  // async function TestAPI() {
  //   // const url = "http://localhost:8080/hello";
  //   const url = "/hello";
  //   try {
  //     const response = await fetch(url, { mode: 'no-cors' });
  //     if (!response.ok) {
  //       throw new Error(`Response status: ${response.status}`);
  //     }
  //
  //     const result = await response.json();
  //     console.log("Success");
  //     console.log(result);
  //
  //   } catch (error) {
  //     console.log("Error!!");
  //   }
  // }

  const pullTransactions = async function() {
    const response = await fetch("/api/getTransactions");

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    return result;
  };

  const nodes = pullTransactions();

  return (
    <>
      <div>
        <form action="/api/addTransaction" method="post">
          <p>Name: </p>
          <input name="TransactionName" type="text" />
          <p>Amount: </p>
          <input name="TransactionAmount" type="number" />
          <p>Category: </p>
          <input name="TransactionCategory" type="text" />
          <p>Date: </p>
          <input name="TransactionDate" type="date" />
          <button type="submit">Submit</button>
        </form>
      </div>
      <Component nodes={nodes} />
    </>
  )
}

export default App
