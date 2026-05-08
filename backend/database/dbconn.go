package dbconn

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/codster101/wallet-watcher/user"
	"github.com/go-sql-driver/mysql"
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

func GetAllTransactionsInCategory(category string) []user.Transaction {
	results, err := db.Query("SELECT * FROM Transactions WHERE Category = ?", category)
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

func GetTransactionsInMonth(month int) []user.Transaction {
	results, err := db.Query("SELECT * FROM Transactions Where MONTH(Date) = ?", month)
	if err != nil {
		fmt.Println("Error Getting Transactions in month " + time.Month(month).String())
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

func GetAllCategories() []user.Category {
	results, err := db.Query("SELECT * FROM Categories")
	if err != nil {
		fmt.Println("Error Getting All Categories")
		log.Fatal(err)
	}
	defer results.Close()

	var categories []user.Category
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

		categories = append(categories, user.NewCategory(name, budget, id, [12]float64{}))
	}
	if err := results.Err(); err != nil {
		fmt.Println("Error traversing queried rows")
		log.Fatal(err)
	}

	return categories
}

func UpdateTransaction(value string, id int, property string) {
	query := "UPDATE Transactions SET " + property + "= ? WHERE Id = ?"
	result, err := db.Exec(query, value, id)
	if err != nil {
		fmt.Println("Error Updating Transaction")
		log.Fatal(err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		fmt.Println("Error Updating Transaction")
		log.Fatal(err)
	}
	if rows != 1 {
		fmt.Printf("Expected 1 row affected. %d rows affected\n", rows)
		fmt.Printf("Query: UPDATE Transactions SET Name = %s WHERE Id = %d\n", value, id)
	}
}

func UpdateCategory(name string, amount float64) {
	query := "UPDATE Categories SET Amount= ? WHERE Name= ?"
	result, err := db.Exec(query, amount, name)
	if err != nil {
		fmt.Println("Error Updating Transaction")
		log.Fatal(err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		fmt.Println("Error Updating Transaction")
		log.Fatal(err)
	}
	if rows != 1 {
		fmt.Printf("Expected 1 row affected. %d rows affected\n", rows)
		fmt.Printf("UPDATE Categories SET Amount= %f WHERE Name= %s\n", amount, name)
	}
}

func DeleteTransaction(ids []int) {
	if len(ids) == 0 {
		return
	}

	placeholders := make([]string, len(ids))
	arguments := make([]any, len(ids))

	for i, id := range ids {
		placeholders[i] = "?"
		arguments[i] = id
	}

	query := fmt.Sprintf("DELETE FROM Transactions WHERE Id IN (%s)", strings.Join(placeholders, ", "))
	result, err := db.Exec(query, arguments...)
	if err != nil {
		fmt.Println("Error Deleting Transactions")
		fmt.Println(placeholders)
		fmt.Println(arguments...)
		log.Fatal(err)
	}

	rows, err := result.RowsAffected()
	// if err != nil {
	// 	fmt.Println("Error Updating Transaction")
	// 	log.Fatal(err)
	// }
	if rows != 1 {
		fmt.Printf("Expected 1 row affected. %d rows affected\n", rows)
		// fmt.Printf("Query: UPDATE Transactions SET Name = %s WHERE Id = %d\n", value, id)
	}

}

func AddRule(category string, operator string, target string) int {

	result, err := db.Exec("INSERT INTO Rules (Category, Operator, Target) VALUES(?, ?, ?)", category, operator, target)
	if err != nil {
		fmt.Println("Error Adding Rule")
		log.Fatal(err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		fmt.Println("Error Retrieving Id of New Rule")
		log.Fatal(err)
	}

	return int(id)

}

func GetRules() []user.Rule {

	results, err := db.Query("SELECT * FROM Rules")
	if err != nil {
		fmt.Println("Error Getting All Rules")
		log.Fatal(err)
	}
	defer results.Close()

	var rules []user.Rule
	for results.Next() {
		var (
			category string
			operator string
			target   string
			id       int
		)

		if err := results.Scan(&category, &operator, &target, &id); err != nil {
			fmt.Println("Error parsing row")
			log.Fatal(err)
		}

		rules = append(rules, user.NewRule(category, operator, target, id))
	}
	if err := results.Err(); err != nil {
		fmt.Println("Error traversing queried rows")
		log.Fatal(err)
	}

	return rules

}
