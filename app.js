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
        await updateOrderStatus()
    }
    else if (choice === "4") {
        await createNewOrder()
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

async function updateOrderStatus() {

    try {
        // Read orders.json
        let data = await fs.readFile("orders.json", "utf-8")
        let orders = JSON.parse(data)

        // Ask for order ID
        let orderId = prompt("Enter order ID: ")

        // Find the order
        let order = null

        for (let o of orders) {
            if (o.orderId === orderId) {
                order = o
            }
        }

        // Check if order exists
        if (order === null) {
            console.log("Order does not exist.")
            return
        }

        // Display current status
        console.log("Current status: " + order.status)

        // Ask for new status
        let newStatus = prompt("Enter new status: ")

        // The statuses in the correct order
        let statuses = ["Received", "Washing", "Ready", "Delivered"]

        let currentPosition = -1
        let newPosition = -1

        // Find the position of the current status
        for (let i = 0; i < statuses.length; i++) {

            if (statuses[i] === order.status) {
                currentPosition = i
            }

            if (statuses[i] === newStatus) {
                newPosition = i
            }
        }

        // Check if new status is valid
        if (newPosition === -1) {
            console.log("New status not accepted")
            return
        }

        // Check if user is trying to move backwards
        if (newPosition <= currentPosition) {
            console.log("New status not accepted")
            return
        }

        // Update the status
        order.status = newStatus

        // Convert the array back into JSON text
        let updatedData = JSON.stringify(orders, null, 4)

        // Save it back into orders.json
        await fs.writeFile("orders.json", updatedData)

        console.log("Order status updated")

    } catch (error) {
        console.log("Error updating order status.")
    }
}

async function createNewOrder() {

    try {
        // Read all files that we need
        let customerData = await fs.readFile("customers.json", "utf-8")
        let orderData = await fs.readFile("orders.json", "utf-8")
        let serviceData = await fs.readFile("services.json", "utf-8")

        let customers = JSON.parse(customerData)
        let orders = JSON.parse(orderData)
        let services = JSON.parse(serviceData)

        // 1. Ask for customer ID
        let customerId = prompt("Enter customer ID: ")

        // Check if customer exists
        let customerExists = false

        for (let customer of customers) {
            if (customer.customerId === customerId) {
                customerExists = true
            }
        }

        if (customerExists === false) {
            console.log("Customer does not exist.")
            return
        }

        // 2. Generate the next order ID
        let nextNumber = orders.length + 1
        let orderId = ""

        if (nextNumber < 10) {
            orderId = "O00" + nextNumber
        }
        else if (nextNumber < 100) {
            orderId = "O0" + nextNumber
        }
        else {
            orderId = "O" + nextNumber
        }

        // 3. Get today's date
        let today = new Date()
        let orderDate = today.toISOString().split("T")[0]

        // New orders start as Received
        let status = "Received"

        // 4. Add services
        let items = []
        let total = 0

        while (true) {

            let serviceId = prompt(
                "Enter service ID (blank to finish): "
            )

            // Blank means the user is finished
            if (serviceId === "") {
                break
            }

            // Find the service
            let selectedService = null

            for (let service of services) {
                if (service.serviceId === serviceId) {
                    selectedService = service
                }
            }

            // 5. Check service ID
            if (selectedService === null) {
                console.log("Service does not exist.")
                continue
            }

            let quantity = Number(prompt("Enter quantity: "))

            if (quantity <= 0 || isNaN(quantity)) {
                console.log("Invalid quantity.")
                continue
            }

            // Add item to the order
            items.push({
                serviceId: serviceId,
                quantity: quantity
            })

            // 6. Calculate total
            total = total + (quantity * selectedService.price)
        }

        // Must have at least one service
        if (items.length === 0) {
            console.log("Order must contain at least one service.")
            return
        }

        // Create the new order
        let newOrder = {
            orderId: orderId,
            customerId: customerId,
            orderDate: orderDate,
            status: status,
            items: items
        }

        // Add it to the orders array
        orders.push(newOrder)

        // 7. Save to orders.json
        let updatedData = JSON.stringify(orders, null, 4)

        await fs.writeFile("orders.json", updatedData)

        console.log()
        console.log("Order " + orderId + " created")
        console.log("Total price: " + total.toFixed(2) + " QAR")

    } catch (error) {
        console.log("Error creating order.")
    }
}