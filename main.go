package main

import (
	"net/http"
)

// // Define a custom parsing function to find and replace dynamic placeholders
// func parseTemplate(tmpl string, data map[string]interface{}) string {
// 	// Find placeholders like {count}
// 	for key, value := range data {
// 		placeholder := fmt.Sprintf("{%s}", key)
// 		tmpl = strings.ReplaceAll(tmpl, placeholder, fmt.Sprintf("%v", value))
// 	}
// 	return tmpl
// }

// func main() {
// 	// Sample template with dynamic binding
// 	tmpl := `<template>
//                 <p>{count}</p>
//                 <button r-on:click="increment()">Increment</button>
//              </template>`

// 	// Dynamic data (can come from server or client state)
// 	data := map[string]interface{}{
// 		"count": 5,
// 	}

// 	// Parse and render the template
// 	parsedTemplate := parseTemplate(tmpl, data)
// 	fmt.Println(parsedTemplate)
// }

func main() {
	server := http.Server{
		Addr:    ":3000",
		Handler: http.FileServer(http.Dir("static")),
	}

	println("HTTP server listening on http://localhost:3000/")
	server.ListenAndServe()
}
