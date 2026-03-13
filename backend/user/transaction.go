package user

import (
	"fmt"
	"strconv"
)

type Transaction struct {
	Name     string
	Amount   float64
	Category string
	Date     string
	Id       int64
}

func PrintTransaction(t Transaction) {
	fmt.Printf("Name:%s\nAmount: %f\nCategory: %s\nDate:%s\n", t.Name, t.Amount, t.Category, t.Date)
}

func TransactionToJson(t Transaction) string {

	// const layout = "2026-Jan-01"
	// date, err := time.Parse(time.DateOnly, t.Date)
	// if err != nil {
	// 	fmt.Println("Error parsing the input value")
	// 	log.Fatal(err)
	// }

	return `{"name": "` + t.Name + `", "amount": ` + strconv.FormatFloat(t.Amount, 'f', 2, 64) + `, "category": "` + t.Category + `", "date": "` + t.Date + `"}`
}
