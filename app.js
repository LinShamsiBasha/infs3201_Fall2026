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




async function showServices() {
    try {
        let data = await fs.readFile("services.json", "utf-8")

        let services = JSON.parse(data)

        console.log()
        console.log(
            "Service ID".padEnd(12) +
            "Service".padEnd(30) +
            "Unit".padEnd(12) +
            "Price"
        )

        console.log(
            "----------".padEnd(12) +
            "----------------------------".padEnd(30) +
            "--------".padEnd(12) +
            "-------"
        )

        for (let service of services) {
            console.log(
                service.serviceId.padEnd(12) +
                service.name.padEnd(30) +
                service.unit.padEnd(12) +
                service.price.toFixed(2)
            )
        }

        console.log()

    } catch (error) {
        console.log("Error reading services.")
    }
}



let choice = ""

while (choice !== "5") {

    showMenu()

    choice = prompt("What is your choice> ")

    if (choice === "1") {
        await showServices()
    }
    else if (choice === "2") {
        console.log("View customer orders")
    }
    else if (choice === "3") {
        console.log("Update order status")
    }
    else if (choice === "4") {
        console.log("Create new order")
    }
    else if (choice === "5") {
        console.log("Goodbye!")
    }
    else {
        console.log("Invalid choice. Please enter a number from 1 to 5.")
    }

}





