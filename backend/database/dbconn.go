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
