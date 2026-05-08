package user

import (
	"encoding/json"
	"strings"
)

type Rule struct {
	category string
	operator string
	target   string
	id       int
}

func NewRule(category string, operator string, target string, id int) Rule {
	return Rule{category: category, operator: operator, target: target, id: id}
}

func (rule Rule) Category() string {
	return rule.category
}

func (rule Rule) Operator() string {
	return rule.operator
}

func (rule Rule) Target() string {
	return rule.target
}

func (rule Rule) Id() int {
	return rule.id
}

func (rule Rule) Check(transaction Transaction) bool {
	switch rule.operator {

	case "Contains":
		if strings.Contains(transaction.name, rule.target) {
			return true
		}
	}

	return false
}

func (rule Rule) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Category string `json:"category"`
		Operator string `json:"operator"`
		Target   string `json:"target"`
		Id       int    `json:"id"`
	}{
		Category: rule.Category(),
		Operator: rule.Operator(),
		Target:   rule.Target(),
		Id:       rule.Id(),
	})
}
