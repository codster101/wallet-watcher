package user

import "encoding/json"

type Category struct {
	name   string
	budget float64
	id     int
	spent  float64
}

func NewCategory(name string, budgetAmt float64, id int, spentAmt float64) *Category {
	return &Category{name: name, budget: budgetAmt, id: id, spent: spentAmt}
}

func (c *Category) Name() string {
	return c.name
}

func (c *Category) Budget() float64 {
	return c.budget
}

func (c *Category) Spent() float64 {
	return c.spent
}

func (c *Category) AddToSpent(amount float64) {
	c.spent += amount
}

func (c Category) MarshalJSON() ([]byte, error) {
	return json.Marshal(struct {
		Name   string  `json:"name"`
		Budget float64 `json:"budget"`
		Spent  float64 `json:"spent"`
	}{
		Name:   c.Name(),
		Budget: c.Budget(),
		Spent:  c.Spent(),
	})
}
