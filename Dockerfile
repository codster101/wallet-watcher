FROM golang:1.25

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download

ENV DBUSER=BudgetApp
ENV DBPASS=M0n3yB@gs


COPY . .
RUN go build -v -o /usr/local/bin/app ./...

CMD ["app"]
