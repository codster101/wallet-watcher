package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/codster101/wallet-watcher/database"
	"github.com/codster101/wallet-watcher/user"
)

func main() {
	dbconn.ConnectToDB()

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("./frontend/dist/")))

	// Calculate category spent values
	// This will query the DB for all transactions and put their totals in the corresponding category
	// The categories will hold a list of 12 floats each corresponding to amount spent in that month (0: January, 1: February, etc.)
	calculateCategoryMonthlyPurchases := func(transactions []user.Transaction) []user.Category {

		categories := dbconn.GetAllCategories()

		// Put all category objects into a map for easy reference
		categoryRef := map[string]int{} // category name : index in category list
		for i, c := range categories {
			categoryRef[strings.ToLower(c.Name())] = i
		}

		// For each transaction add its total to the category total
		for _, t := range transactions {
			if index, ok := categoryRef[strings.ToLower(t.Category())]; !ok { // If the category does not exists
				fmt.Println("Category of transaction not found in Category table")
				log.Fatal(t.Category())
			} else {
				categories[index].AddToSpent(t.Amount(), t.GetMonthInt()-1)
			}
		}

		return categories

	}

	evaluateRule := func(transaction *user.Transaction) {

		rules := dbconn.GetRules()

		for _, rule := range rules {
			if rule.Check(*transaction) {
				transaction.SetCategory(rule.Category())
				fmt.Println(*transaction)
			}
		}
	}

	categorize := func(transactions []user.Transaction) {
		for i := range transactions {
			evaluateRule(&(transactions[i]))
			fmt.Println(transactions[i])
		}
	}

	loadPage := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()
		transactions := dbconn.GetAllTransactions()

		categories := calculateCategoryMonthlyPurchases(transactions)

		type response struct {
			Transactions []user.Transaction `json:"transactions"`
			Categories   []user.Category    `json:"categories"`
		}

		body := response{
			Transactions: transactions,
			Categories:   categories,
		}

		json.NewEncoder(w).Encode(body)

		fmt.Println("Load Page" + time.Since(start).String())
	}
	mux.HandleFunc("/loadPage", loadPage)

	// API for form submission of a transaction
	manualTransactionInput := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()
		// Parse/Handle input
		name := req.FormValue("TransactionName")
		amountStr := req.FormValue("TransactionAmount")
		category := req.FormValue("TransactionCategory")
		dateStr := req.FormValue("TransactionDate")

		// Display before and after type formatting
		// fmt.Printf("%s , %s, %s, %s\n", name, amountStr, category, date)

		// Type formatting
		amount, err := strconv.ParseFloat(amountStr, 64)
		if err != nil {
			fmt.Println("Error parsing the input value")
			log.Fatal(err)
		}

		// Format all Categories with first letter capital, rest lowercase: Category
		category = strings.ToUpper(string(category[0])) + strings.ToLower(category[1:])

		//Format date string
		date, err := time.Parse(time.DateOnly, dateStr)
		if err != nil {
			fmt.Println("Error: unrecognized date format. Expected yyyy-mm-dd")
			log.Fatal(err)
		}

		// Display before and after type formatting
		// fmt.Printf("%s , %2f, %s, %s\n", name, amount, category, date)

		// Create Transaction
		newTransaction := user.NewTransaction(name, amount, category, date)

		// Add input to db
		dbconn.AddTransaction(newTransaction)
		fmt.Println("Manual Submission: " + time.Since(start).String())
	}
	mux.HandleFunc("/addTransaction", manualTransactionInput)

	// API for adding a set of transactions
	addTransactions := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()
		// Create json type
		type requestJson struct {
			Name     string `json:"name"`
			Amount   string `json:"amount"`
			Category string `json:"category"`
			Date     string `json:"date"`
		}

		// Parse Input
		var body []requestJson
		err := json.NewDecoder(req.Body).Decode(&body)
		if err != nil {
			fmt.Println("Error parsing the HTTP request")
			log.Fatal(err)
		}
		defer req.Body.Close()

		transactions := []user.Transaction{}
		for _, t := range body {

			amount, err := strconv.ParseFloat(t.Amount, 64)
			if err != nil {
				fmt.Println("Error parsing the input value")
				log.Fatal(err)
			}

			category := strings.ToUpper(string(t.Category[0])) + strings.ToLower(t.Category[1:])

			//Format date string
			date, err := time.Parse(time.DateOnly, t.Date)
			if err != nil {
				fmt.Println("Error: unrecognized date format. Expected yyyy-mm-dd")
				log.Fatal(err)
			}
			transactions = append(transactions, user.NewTransaction(t.Name, amount, category, date))

		}

		// Add input to db
		dbconn.AddTransactions(transactions)
		fmt.Println("Adding Transactions: " + time.Since(start).String())
	}
	mux.HandleFunc("/addTransactions", addTransactions)

	// API for  retrieving all transactions
	getTransactions := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()
		transactions := dbconn.GetAllTransactions()

		json.NewEncoder(w).Encode(transactions)
		fmt.Println("Retrieving Transactions: " + time.Since(start).String())
	}
	mux.HandleFunc("/getTransactions", getTransactions)

	// API for submitting transaction files
	submitFile := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()
		format := req.FormValue("format")
		file, _, err := req.FormFile("file")
		if err != nil {
			fmt.Println("Error retrieving file from HTTP Request")
			log.Fatal(err)
		}
		transactions := ParseCSV(format, file)
		fmt.Println(transactions)
		categorize(transactions)
		fmt.Println(transactions)
		// dbconn.AddTransactions(transactions)

		json.NewEncoder(w).Encode(transactions)
		fmt.Println("File Submission: " + time.Since(start).String())
	}
	mux.HandleFunc("/submitFile", submitFile)

	// API for getting category information
	// This will query the DB for all transactions and put their totals in the corresponding category
	// The categories will hold a list of 12 floats each corresponding to amount spent in that month (0: January, 1: February, etc.)
	// NTD - Passing in an integer 1-12 will return category totals for the corresponding month
	getCategories := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()

		categories := calculateCategoryMonthlyPurchases(dbconn.GetAllTransactions())

		json.NewEncoder(w).Encode(categories)
		fmt.Println("Gettting Category Totals: " + time.Since(start).String())
	}
	mux.HandleFunc("/getCategories", getCategories)

	// API for submitting transaction files
	updateTransaction := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()

		// Create json type
		type UpdateTransactionRequest struct {
			Value    string `json:"value"`
			Id       int    `json:"id"`
			Property string `json:"property"`
		}

		// Parse Input
		var body UpdateTransactionRequest
		err := json.NewDecoder(req.Body).Decode(&body)
		if err != nil {
			fmt.Println("Error parsing the HTTP request")
			log.Fatal(err)
		}
		defer req.Body.Close()

		value := body.Value
		id := body.Id
		property := body.Property

		// Call DB to update the transaction
		dbconn.UpdateTransaction(value, id, property)
		fmt.Println("Updating Transaction: " + time.Since(start).String())

	}
	mux.HandleFunc("/updateTransaction", updateTransaction)

	// API for submitting transaction files
	updateCategory := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()

		// Create json type
		type UpdateCategoryRequest struct {
			Name   string  `json:"name"`
			Amount float64 `json:"amount"`
		}

		// Parse Input
		var body UpdateCategoryRequest
		err := json.NewDecoder(req.Body).Decode(&body)
		if err != nil {
			fmt.Println("Error parsing the HTTP request")
			log.Fatal(err)
		}
		defer req.Body.Close()

		name := body.Name
		amount := body.Amount

		// Call DB to update the transaction
		dbconn.UpdateCategory(name, amount)
		fmt.Println("Updating Category: " + time.Since(start).String())

	}
	mux.HandleFunc("/updateCategory", updateCategory)

	// API for deleting a list of Transactions based on their ids
	deleteTransactions := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()

		// Create json type
		type DeleteTransactionsRequest struct {
			Ids []int `json:"ids"`
		}

		// Parse Input
		var body DeleteTransactionsRequest
		err := json.NewDecoder(req.Body).Decode(&body)
		if err != nil {
			fmt.Println("Error parsing the HTTP request")
			log.Fatal(err)
		}
		defer req.Body.Close()

		idsToDelete := body.Ids

		dbconn.DeleteTransaction(idsToDelete)
		fmt.Println("Deleting Category: " + time.Since(start).String())

	}
	mux.HandleFunc("/deleteTransactions", deleteTransactions)

	addRule := func(w http.ResponseWriter, req *http.Request) {

		start := time.Now()

		// Parse/Handle input
		category := req.FormValue("Category")
		operator := req.FormValue("Operator")
		target := req.FormValue("Target")

		dbconn.AddRule(category, operator, target)

		rules := dbconn.GetRules()

		json.NewEncoder(w).Encode(rules)

		fmt.Println("Adding Rule: " + time.Since(start).String())
	}
	mux.HandleFunc("/addRule", addRule)

	getRules := func(w http.ResponseWriter, req *http.Request) {

		rules := dbconn.GetRules()

		json.NewEncoder(w).Encode(rules)

	}
	mux.HandleFunc("/getRules", getRules)

	// API for submitting transaction files
	updateRule := func(w http.ResponseWriter, req *http.Request) {
		start := time.Now()

		// Create json type
		type UpdateTransactionRequest struct {
			Value    string `json:"value"`
			Id       int    `json:"id"`
			Property string `json:"property"`
		}

		// Parse Input
		var body UpdateTransactionRequest
		err := json.NewDecoder(req.Body).Decode(&body)
		if err != nil {
			fmt.Println("Error parsing the HTTP request")
			log.Fatal(err)
		}
		defer req.Body.Close()

		value := body.Value
		id := body.Id
		property := body.Property

		// Call DB to update the transaction
		dbconn.UpdateRule(value, id, property)
		fmt.Println("Updating Transaction: " + time.Since(start).String())

	}
	mux.HandleFunc("/updateRule", updateRule)
	fmt.Println(http.ListenAndServe(":8080", mux))
}
