package dbconn

import (
	"database/sql"
	"fmt"
	"github.com/codster101/wallet-watcher/user"
	"github.com/go-sql-driver/mysql"
	"log"
	"os"
	"time"
)

var db *sql.DB

func ConnectToDB() {
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

func AddTransaction(transaction user.Transaction) {
	_, err := db.Exec("INSERT INTO Transactions (Name, Amount, Category, Date) VALUES(?, ?, ?, ?)",
		transaction.Name(), transaction.Amount(), transaction.Category(), transaction.Date())
	if err != nil {
		fmt.Println("Error Adding Transaction")
		log.Fatal(err)
	}

	// Check if the category of the new transaction exists in the categories db
	row := db.QueryRow("SELECT Name FROM Categories WHERE Name = ?", transaction.Category())

	var (
		name string
	)

	// If there was the category was not found in the database then add it
	if err := row.Scan(&name); err == sql.ErrNoRows {
		_, err1 := db.Exec("INSERT INTO Categories (Name, Amount) VALUES(?, ?)",
			transaction.Category(), 0.0)
		if err1 != nil {
			fmt.Println("Error Adding Category")
			log.Fatal(err)
		}
	} else if err != nil {
		fmt.Println("Error reading row")
		log.Fatal(err)
	}

}

func AddTransactions(transactions []user.Transaction) {
	for _, t := range transactions {
		AddTransaction(t)
	}
}

func GetAllTransactions() []user.Transaction {
	results, err := db.Query("SELECT * FROM Transactions")
	if err != nil {
		fmt.Println("Error Getting All Transactions")
		log.Fatal(err)
	}
	defer results.Close()

	var transactions []user.Transaction
	for results.Next() {
		// Create Transaction
		var (
			name     string
			amount   float64
			category string
			dateStr  string
			id       int
		)

		if err := results.Scan(&name, &amount, &category, &dateStr, &id); err != nil {
			fmt.Println("Error parsing row")
			log.Fatal(err)
		}

		//Format date string
		date, err := time.Parse(time.DateOnly, dateStr)
		if err != nil {
			fmt.Println("Error: unrecognized date format. Expected yyyy-mm-dd")
			log.Fatal(err)
		}

		// Add transaction to output list
		transactions = append(transactions, user.NewTransactionWithId(name, amount, category, date, id))
	}
	if err := results.Err(); err != nil {
		fmt.Println("Error traversing queried rows")
		log.Fatal(err)
	}

	return transactions
}

func GetTransactionsInMonth(month time.Month) []user.Transaction {
	results, err := db.Query("SELECT * FROM Transactions Where MONTH(Date) = ?", int(month))
	if err != nil {
		fmt.Println("Error Getting Transactions in month " + month.String())
		log.Fatal(err)
	}
	defer results.Close()

	var transactions []user.Transaction
	for results.Next() {
		// Create Transaction
		var (
			name     string
			amount   float64
			category string
			dateStr  string
			id       int
		)

		if err := results.Scan(&name, &amount, &category, &dateStr, &id); err != nil {
			fmt.Println("Error parsing row")
			log.Fatal(err)
		}

		//Format date string
		date, err := time.Parse(time.DateOnly, dateStr)
		if err != nil {
			fmt.Println("Error: unrecognized date format. Expected yyyy-mm-dd")
			log.Fatal(err)
		}

		// Add transaction to output list
		transactions = append(transactions, user.NewTransactionWithId(name, amount, category, date, id))
	}
	if err := results.Err(); err != nil {
		fmt.Println("Error traversing queried rows")
		log.Fatal(err)
	}

	return transactions
}

func GetAllCategories() []*user.Category {
	results, err := db.Query("SELECT * FROM Categories")
	if err != nil {
		fmt.Println("Error Getting All Categories")
		log.Fatal(err)
	}
	defer results.Close()

	var categories []*user.Category
	for results.Next() {
		var (
			name   string
			budget float64
			id     int
		)

		if err := results.Scan(&name, &budget, &id); err != nil {
			fmt.Println("Error parsing row")
			log.Fatal(err)
		}

		categories = append(categories, user.NewCategory(name, budget, id, 0))
	}
	if err := results.Err(); err != nil {
		fmt.Println("Error traversing queried rows")
		log.Fatal(err)
	}

	return categories
}
