package main

import "net/http"

func main() {
	server := http.Server{
		Addr:    ":3000",
		Handler: http.FileServer(http.Dir("static")),
	}

	server.ListenAndServe()
}
