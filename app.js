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
        await viewCustomerOrders()
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





async function viewCustomerOrders() {

    try {
        
        let customerData = await fs.readFile("customers.json", "utf-8")
        let orderData = await fs.readFile("orders.json", "utf-8")
        let serviceData = await fs.readFile("services.json", "utf-8")

        
        let customers = JSON.parse(customerData)
        let orders = JSON.parse(orderData)
        let services = JSON.parse(serviceData)

        let customerId = prompt("Enter customer ID: ")

        
        let customer = null

        for (let c of customers) {
            if (c.customerId === customerId) {
                customer = c
            }
        }

        
        if (customer === null) {
            console.log("Customer does not exist.")
            return
        }

        console.log()
        console.log("Orders for " + customer.name)
        console.log()

        console.log("Order ID     Order Date     Status          Total")
        console.log("--------     ----------     --------        -------")

        let orderFound = false

        
        for (let order of orders) {

            if (order.customerId === customerId) {

                orderFound = true

                let total = 0

              
                for (let item of order.items) {

                    
                    for (let service of services) {

                        if (item.serviceId === service.serviceId) {

                            total = total + (item.quantity * service.price)

                        }
                    }
                }

                console.log(
                    order.orderId + "         " +
                    order.orderDate + "     " +
                    order.status + "        " +
                    total.toFixed(2)
                )
            }
        }

        if (orderFound === false) {
            console.log("This customer has no orders.")
        }

        console.log()

    } catch (error) {
        console.log("Error reading customer orders.")
    }
}