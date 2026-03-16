package main

import (
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"strings"
	"time"

	"github.com/codster101/wallet-watcher/user"
)

func ParseCSV(file multipart.File) []user.Transaction {
	fileContents, err := io.ReadAll(file)
	if err != nil {
		fmt.Println("Error reading file contents")
		log.Fatal(err)
	}
	fileString := string(fileContents)
	// fmt.Println(fileString)

	var transactions []user.Transaction

	//Split into rows
	lines := strings.Split(fileString, "\n")
	lines = lines[1:]

	for i, line := range lines {
		// For each row split into fields
		fields := strings.Split(line, ",")
		if len(fields) < 2 {
			continue
		}

		//Format date string
		const csvLayout = "01/02/2006"
		date, err := time.Parse(csvLayout, fields[0])
		if err != nil {
			fmt.Println("Error: unrecognized date format. Expected mm/dd/yyyy")
			log.Fatal(err)
		}

		// Assign the proper fields to a new Transaction
		t := user.Transaction{Name: fields[2], Amount: float64(i), Category: fields[3], Date: date.Format(time.DateOnly)}

		// user.PrintTransaction(t)

		// Add the new Transaction to the list
		transactions = append(transactions, t)
	}

	return transactions
}
