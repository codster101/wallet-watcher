package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"

	"github.com/codster101/wallet-watcher/database"
	"github.com/codster101/wallet-watcher/user"
)

func main() {
	dbconn.ConnectToDB()

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("./frontend/dist/")))

	// API for form submission of a transaction
	manualTransactionInput := func(w http.ResponseWriter, req *http.Request) {
		fmt.Println("Manual Submission")
		// Parse/Handle input
		name := req.FormValue("TransactionName")
		amountStr := req.FormValue("TransactionAmount")
		category := req.FormValue("TransactionCategory")
		date := req.FormValue("TransactionDate")

		// Display before and after type formatting
		// fmt.Printf("%s , %s, %s, %s\n", name, amountStr, category, date)

		// Type formatting
		amount, err := strconv.ParseFloat(amountStr, 64)
		if err != nil {
			fmt.Println("Error parsing the input value")
			log.Fatal(err)
		}

		// Display before and after type formatting
		// fmt.Printf("%s , %2f, %s, %s\n", name, amount, category, date)

		// Create Transaction
		newTransaction := user.Transaction{Name: name, Amount: amount, Category: category, Date: date}

		// Add input to db
		dbconn.AddTransaction(newTransaction)
	}
	mux.HandleFunc("/addTransaction", manualTransactionInput)

	// API for  retrieving all transactions
	getTransactions := func(w http.ResponseWriter, req *http.Request) {
		fmt.Println("Retrieving Transactions")
		transactions := dbconn.GetAllTransactions()
		jsonTransactions := "["
		for _, t := range transactions {
			jsonTransactions += user.TransactionToJson(t) + ", "
		}
		jsonTransactions = jsonTransactions[:len(jsonTransactions)-2] + "]"
		// fmt.Println(jsonTransactions)
		io.WriteString(w, jsonTransactions)
	}
	mux.HandleFunc("/getTransactions", getTransactions)

	// API for submitting transaction files
	submitFile := func(w http.ResponseWriter, req *http.Request) {
		fmt.Println("File Submission")
		file, _, err := req.FormFile("TransactionFile")
		if err != nil {
			fmt.Println("Error retrieving file from HTTP Request")
			log.Fatal(err)
		}
		transactions := ParseCSV(file)
		dbconn.AddTransactions(transactions)
	}
	mux.HandleFunc("/submitFile", submitFile)

	fmt.Println(http.ListenAndServe(":8080", mux))
}
