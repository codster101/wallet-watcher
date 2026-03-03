package main

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/go-sql-driver/mysql"
)

var db *sql.DB

func connectToDB() {
	fmt.Println("Connecting to DB")
	// Capture connection properties.
	cfg := mysql.NewConfig()
	cfg.User = os.Getenv("DBUSER")
	cfg.Passwd = os.Getenv("DBPASS")
	cfg.Net = "tcp"
	cfg.Addr = os.Getenv("DBADDR")
	cfg.DBName = "Finance"

	// Get a database handle.
	var err error
	db, err = sql.Open("mysql", cfg.FormatDSN())
	if err != nil {
		fmt.Println("Error Formatting Config")
		log.Fatal(err)
	}

	pingErr := db.Ping()
	if pingErr != nil {
		fmt.Println("Error Pinging DB")
		log.Fatal(pingErr)
	}
	fmt.Println("Connected!")
}

func main() {

	fmt.Println("Wassup")

	connectToDB()

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("./frontend/dist/")))

	helloHandler := func(w http.ResponseWriter, req *http.Request) {
		fmt.Println("hello handler")
	}

	mux.HandleFunc("/hello", helloHandler)

	manualTransactionInput := func(w http.ResponseWriter, req *http.Request) {
		// Parse/Handle input
		name := req.FormValue("TransactionName")
		amount := req.FormValue("TransactionAmount")
		category := req.FormValue("TransactionCategory")
		date := req.FormValue("TransactionDate")

		fmt.Printf("%s , %s, %s, %s", name, amount, category, date)
		// Add input to db
		_, err := db.Exec("INSERT INTO Transactions (Name, Amount, Category, Date) VALUES(?, ?, ?, ?)", name, amount, category, date)
		if err != nil {
			fmt.Println(err.Error())
		}
	}
	mux.HandleFunc("/addTransaction", manualTransactionInput)

	getTransactions := func(w http.ResponseWriter, req *http.Request) {
		io.WriteString(w, "[{\"name\": \"Cody\"}, {\"name\": \"Kenzie\"}]")
	}
	mux.HandleFunc("/getTransactions", getTransactions)

	fmt.Println(http.ListenAndServe(":8080", mux))
}
