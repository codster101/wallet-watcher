package user

import (
	"time"
)

type Transaction struct {
	Name     string
	Amount   float64
	Category string
	Date     time.Time
}

//
// func ImportTransaction(name string) Transaction {
// 	return name
// }
