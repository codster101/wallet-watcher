package user

import "encoding/json"

type Category struct {
	name   string
	budget float64
	id     int
	spent  [12]float64
}

func NewCategory(name string, budgetAmt float64, id int, spentAmt [12]float64) Category {
	return Category{name: name, budget: budgetAmt, id: id, spent: spentAmt}
}

func (c Category) Name() string {
	return c.name
}

func (c Category) Budget() float64 {
	return c.budget
}

func (c Category) Spent() [12]float64 {
	return c.spent
}

func (c *Category) AddToSpent(amount float64, month int) {
	c.spent[month] += amount
}

func (c Category) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Name   string      `json:"name"`
		Budget float64     `json:"budget"`
		Spent  [12]float64 `json:"spent"`
	}{
		Name:   c.Name(),
		Budget: c.Budget(),
		Spent:  c.Spent(),
	})
}
