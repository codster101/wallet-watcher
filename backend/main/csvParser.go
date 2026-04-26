package main

import (
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"strconv"
	"strings"
	"time"

	"github.com/codster101/wallet-watcher/user"
)

func ParseCSV(format string, file multipart.File) []user.Transaction {
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

	if format == "card" {
		transactions = parseFile(lines, 2, 5, 3, 0)
	} else if format == "bank-account" {
		transactions = parseFile(lines, 2, 3, 0, 1)
	}

	// for _, line := range lines {
	// 	// For each row split into fields
	// 	fields := strings.Split(line, ",")
	// 	if len(fields) < 2 {
	// 		continue
	// 	}
	//
	// 	//Format date string
	// 	const csvLayout = "01/02/2006"
	// 	date, err := time.Parse(csvLayout, fields[0])
	// 	if err != nil {
	// 		fmt.Println("Error: unrecognized date format. Expected mm/dd/yyyy")
	// 		log.Fatal(err)
	// 	}
	//
	// 	// Assign the proper fields to a new Transaction
	// 	amt, err := strconv.ParseFloat(fields[5], 64)
	// 	if err != nil {
	// 		fmt.Println("Error: cannot parse amount from file to float")
	// 		log.Fatal(err)
	// 	}
	//
	// 	var t user.Transaction
	// 	if amt < 0 {
	// 		t = user.NewTransaction(fields[2], -amt, fields[3], date)
	// 	} else {
	// 		t = user.NewTransaction(fields[2], amt, "Income", date)
	// 	}
	//
	// 	// user.PrintTransaction(t)
	//
	// 	// Add the new Transaction to the list
	// 	transactions = append(transactions, t)
	// }

	return transactions
}

func parseFile(lines []string, nameCol int, amountCol int, categoryCol int, dateCol int) []user.Transaction {
	var transactions []user.Transaction

	for _, line := range lines {
		// For each row split into fields
		fields := strings.Split(line, ",")
		if len(fields) < 2 {
			continue
		}

		//Format date string
		const csvLayout = "01/02/2006"
		date, err := time.Parse(csvLayout, fields[dateCol])
		if err != nil {
			fmt.Println("Error: unrecognized date format. Expected mm/dd/yyyy")
			log.Fatal(err)
		}

		// Assign the proper fields to a new Transaction
		amt, err := strconv.ParseFloat(fields[amountCol], 64)
		if err != nil {
			fmt.Println("Error: cannot parse amount from file to float")
			log.Fatal(err)
		}

		var t user.Transaction
		if amt < 0 {
			t = user.NewTransaction(fields[nameCol], -amt, fields[categoryCol], date)
		} else {
			t = user.NewTransaction(fields[nameCol], amt, "Income", date)
		}

		// user.PrintTransaction(t)

		// Add the new Transaction to the list
		transactions = append(transactions, t)
	}

	return transactions
}
