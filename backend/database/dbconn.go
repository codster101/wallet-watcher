package dbconn

import (
	"database/sql"
	"fmt"
	"github.com/codster101/wallet-watcher/user"
	"github.com/go-sql-driver/mysql"
	"log"
	"os"
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
		transaction.Name, transaction.Amount, transaction.Category, transaction.Date)
	if err != nil {
		fmt.Println("Error Adding Transaction")
		log.Fatal(err)
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
		t := user.Transaction{}
		if err := results.Scan(&t.Name, &t.Amount, &t.Category, &t.Date, &t.Id); err != nil {
			fmt.Println("Error parsing row")
			log.Fatal(err)
		}

		// Add transaction to output list
		transactions = append(transactions, t)
	}
	if err := results.Err(); err != nil {
		fmt.Println("Error traversing queried rows")
		log.Fatal(err)
	}

	return transactions
}
