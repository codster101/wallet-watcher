package user

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"
)

type Transaction struct {
	name     string
	amount   float64
	category string
	date     time.Time
	id       int
}

// Constructors
func NewTransaction(name string, amount float64, category string, date time.Time) Transaction {
	return Transaction{name: name, amount: amount, category: category, date: date}
}

func NewTransactionWithId(name string, amount float64, category string, date time.Time, id int) Transaction {
	return Transaction{name: name, amount: amount, category: category, date: date, id: id}
}

// Getters
func (t Transaction) Name() string {
	return t.name
}

func (t Transaction) Amount() float64 {
	return t.amount
}

func (t Transaction) Category() string {
	return t.category
}

func (t *Transaction) SetCategory(name string) {
	t.category = name
}

func (t Transaction) Date() string {
	return t.date.Format(time.DateOnly)
}

func (t Transaction) Id() int {
	return t.id
}

// Transaction methods
func (t Transaction) PrintTransaction() {
	fmt.Printf("Name:%s\nAmount: %f\nCategory: %s\nDate:%s\n", t.name, t.amount, t.category, t.Date())
}

func (t Transaction) TransactionToJson() string {

	return `{
		"id": "` + strconv.Itoa(t.id) + `", 
		"name": "` + t.name + `", 
		"amount": ` + strconv.FormatFloat(t.amount, 'f', 2, 64) + `, 
		"category": "` + t.category + `", 
		"date": "` + t.Date() + `"}`
}

func (t Transaction) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Id       int     `json:"id"`
		Name     string  `json:"name"`
		Amount   float64 `json:"amount"`
		Category string  `json:"category"`
		Date     string  `json:"date"`
	}{
		Id:       t.Id(),
		Name:     t.Name(),
		Amount:   t.Amount(),
		Category: t.Category(),
		Date:     t.Date(),
	})
}

// Returns the month as a number 1-12
func (t Transaction) GetMonthInt() int {
	return int(t.date.Month())
}
