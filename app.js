import PromptSync from "prompt-sync"
import fs from 'fs/promises'
const prompt = PromptSync()

/**
 * Displays the main menu options to the user.
 */
function showMenu() {
    console.log("1. Show laundry services")
    console.log("2. View customer orders")
    console.log("3. Update order status")
    console.log("4. Create new order")
    console.log("5. Exit")
}



/**
 * Reads the laundry services from the services JSON file
 * and displays all available services.
 */
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
            console.log (
                order.orderId.padEnd(14) +
                order.orderDate.padEnd(16) +
                order.status.padEnd(18) +
                total.toFixed(2)
            )
}

        console.log()

    } catch (error) {
        console.log("Error reading services.")
    }
}


/**
 * Asks the user for a customer ID and displays all orders
 * belonging to that customer.
 */
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

        console.log(
            "Order ID".padEnd(14) +
            "Order Date".padEnd(16) +
            "Status".padEnd(18) +
            "Total"
        )

        console.log(
            "--------".padEnd(14) +
            "----------".padEnd(16) +
            "--------".padEnd(18) +
            "-------"
        )

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
                    order.orderId.padEnd(14) +
                    order.orderDate.padEnd(16) +
                    order.status.padEnd(18) +
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



/**
 * Asks the user for an order ID and updates the order status
 * if the new status is valid and allowed.
 */
async function updateOrderStatus() {

    try {
        
        let data = await fs.readFile("orders.json", "utf-8")
        let orders = JSON.parse(data)

        
        let orderId = prompt("Enter order ID: ")

        let order = null

        for (let o of orders) {
            if (o.orderId === orderId) {
                order = o
            }
        }

        
        if (order === null) {
            console.log("Order does not exist.")
            return
        }

        
        console.log("Current status: " + order.status)

        let newStatus = prompt("Enter new status: ")

        let statuses = ["Received", "Washing", "Ready", "Delivered"]

        let currentPosition = -1
        let newPosition = -1

        for (let i = 0; i < statuses.length; i++) {

            if (statuses[i] === order.status) {
                currentPosition = i
            }

            if (statuses[i] === newStatus) {
                newPosition = i
            }
        }

        if (newPosition === -1) {
            console.log("New status not accepted")
            return
        }

        if (newPosition <= currentPosition) {
            console.log("New status not accepted")
            return
        }

        order.status = newStatus

        let updatedData = JSON.stringify(orders, null, 4)

        await fs.writeFile("orders.json", updatedData)

        console.log("Order status updated")

    } catch (error) {
        console.log("Error updating order status.")
    }
}


/**
 * Creates a new laundry order for an existing customer
 * and saves the new order to the orders JSON file.
 */
async function createNewOrder() {

    try {
        let customerData = await fs.readFile("customers.json", "utf-8")
        let orderData = await fs.readFile("orders.json", "utf-8")
        let serviceData = await fs.readFile("services.json", "utf-8")

        let customers = JSON.parse(customerData)
        let orders = JSON.parse(orderData)
        let services = JSON.parse(serviceData)

        let customerId = prompt("Enter customer ID: ")

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

        let highestNumber = 0

        for (let order of orders) {

            let number = Number(order.orderId.substring(1))

                if (number > highestNumber) {
                    highestNumber = number
                }
            }

        let nextNumber = highestNumber + 1
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








       
        let today = new Date()
        let orderDate = today.toISOString().split("T")[0]

        let status = "Received"


        let items = []
        let total = 0

        while (true) {

            let serviceId = prompt(
                "Enter service ID (blank to finish): "
            )

            if (serviceId === "") {
                break
            }

            let selectedService = null

            for (let service of services) {
                if (service.serviceId === serviceId) {
                    selectedService = service
                }
            }

            if (selectedService === null) {
                console.log("Service does not exist.")
                continue
            }

            let quantity = Number(prompt("Enter quantity: "))

            if (quantity <= 0 || isNaN(quantity)) {
                console.log("Invalid quantity.")
                continue
            }


            items.push({
                serviceId: serviceId,
                quantity: quantity
            })

            total = total + (quantity * selectedService.price)
        }


        if (items.length === 0) {
            console.log("Order must contain at least one service.")
            return
        }

        let newOrder = {
            orderId: orderId,
            customerId: customerId,
            orderDate: orderDate,
            status: status,
            items: items
        }

        orders.push(newOrder)

        let updatedData = JSON.stringify(orders, null, 4)

        await fs.writeFile("orders.json", updatedData)

        console.log()
        console.log("Order " + orderId + " created")
        console.log("Total price: " + total.toFixed(2) + " QAR")

    } catch (error) {
        console.log("Error creating order.")
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