package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/codster101/wallet-watcher/database"
	"github.com/codster101/wallet-watcher/user"
)

func main() {

	fmt.Println("Wassup")

	dbconn.ConnectToDB()

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("./frontend/dist/")))

	// Test API
	helloHandler := func(w http.ResponseWriter, req *http.Request) {
		fmt.Println("hello handler")
	}

	mux.HandleFunc("/hello", helloHandler)

	// API for form submission of a transaction
	manualTransactionInput := func(w http.ResponseWriter, req *http.Request) {
		// Parse/Handle input
		name := req.FormValue("TransactionName")
		amountStr := req.FormValue("TransactionAmount")
		category := req.FormValue("TransactionCategory")
		dateStr := req.FormValue("TransactionDate")

		// Display before and after type formatting
		fmt.Printf("%s , %s, %s, %s\n", name, amountStr, category, dateStr)

		// Type formatting
		amount, err := strconv.ParseFloat(amountStr, 64)
		if err != nil {
			fmt.Println("Error parsing the input value")
			log.Fatal(err)
		}

		const layout = "2026-Jan-01"
		date, err := time.Parse(time.DateOnly, dateStr)
		if err != nil {
			fmt.Println("Error parsing the input value")
			log.Fatal(err)
		}

		// Display before and after type formatting
		fmt.Printf("%s , %2f, %s, %s\n", name, amount, category, date.String())

		// Create Transaction
		newTransaction := user.Transaction{Name: name, Amount: amount, Category: category, Date: date}

		// Add input to db
		dbconn.AddTransaction(newTransaction)
	}
	mux.HandleFunc("/addTransaction", manualTransactionInput)

	// API for  retrieving all transactions
	getTransactions := func(w http.ResponseWriter, req *http.Request) {
		io.WriteString(w, `[{"name": "Cody","amount": 15,"category": "test","date": "01-14-2026"}, {"name": "Kenzie","amount": 38,"category": "test","date": "01-26-2026"}]`)
	}
	mux.HandleFunc("/getTransactions", getTransactions)

	fmt.Println(http.ListenAndServe(":8080", mux))
}
