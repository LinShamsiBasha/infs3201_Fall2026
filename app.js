import PromptSync from "prompt-sync"
import fs from 'fs/promises'
const prompt = PromptSync()

function showMenu() {
    console.log("1. Show laundry services")
    console.log("2. View customer orders")
    console.log("3. Update order status")
    console.log("4. Create new order")
    console.log("5. Exit")
}


let choice = ''
while (choice != "5") {

    showMenu()
    choice = prompt("What is your choice?")
   
    

}





