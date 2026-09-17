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
 * Formats a single service into a padded column string for display.
 *
 * @param {Object} service The service object to format.
 * @returns {String} The formatted line representing the service.
 */
function formatServiceLine(service) {
    return service.serviceId.padEnd(12) +
        service.name.padEnd(30) +
        service.unit.padEnd(12) +
        service.price.toFixed(2)
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
            console.log(formatServiceLine(service))
        }

        console.log()

    } catch (error) {
        console.log("Error reading services.")
    }
}

/**
 * Searches a list of customers for one matching the given customer ID.
 *
 * @param {Array} customers The list of customer objects to search.
 * @param {String} customerId The customer ID to search for.
 * @returns {Object|null} The matching customer, or null if not found.
 */
function findCustomerById(customers, customerId) {
    for (let c of customers) {
        if (c.customerId === customerId) {
            return c
        }
    }
    return null
}

/**
 * Searches a list of services for one matching the given service ID.
 *
 * @param {Array} services The list of service objects to search.
 * @param {String} serviceId The service ID to search for.
 * @returns {Object|null} The matching service, or null if not found.
 */
function findServiceById(services, serviceId) {
    for (let service of services) {
        if (service.serviceId === serviceId) {
            return service
        }
    }
    return null
}

/**
 * Calculates the total price of an order based on its items and the
 * current service prices.
 *
 * @param {Object} order The order whose total should be calculated.
 * @param {Array} services The list of available services and prices.
 * @returns {Number} The total price of the order.
 */
function calculateOrderTotal(order, services) {
    let total = 0

    for (let item of order.items) {
        let service = findServiceById(services, item.serviceId)

        if (service !== null) {
            total = total + (item.quantity * service.price)
        }
    }

    return total
}

/**
 * Formats a single order into a padded column string for display.
 *
 * @param {Object} order The order to format.
 * @param {Number} total The pre-calculated total price of the order.
 * @returns {String} The formatted line representing the order.
 */
function formatOrderLine(order, total) {
    return order.orderId.padEnd(14) +
        order.orderDate.padEnd(16) +
        order.status.padEnd(18) +
        total.toFixed(2)
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

        let customer = findCustomerById(customers, customerId)

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
                let total = calculateOrderTotal(order, services)
                console.log(formatOrderLine(order, total))
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
 * Searches a list of orders for one matching the given order ID.
 *
 * @param {Array} orders The list of order objects to search.
 * @param {String} orderId The order ID to search for.
 * @returns {Object|null} The matching order, or null if not found.
 */
function findOrderById(orders, orderId) {
    for (let o of orders) {
        if (o.orderId === orderId) {
            return o
        }
    }
    return null
}

/**
 * Determines whether moving an order from one status to another is
 * allowed. Statuses must progress forward through the sequence
 * Received, Washing, Ready, Delivered and can never move backwards.
 *
 * @param {String} currentStatus The order's current status.
 * @param {String} newStatus The status the order would move to.
 * @returns {Boolean} True if the transition is allowed, false otherwise.
 */
function isStatusTransitionValid(currentStatus, newStatus) {
    let statuses = ["Received", "Washing", "Ready", "Delivered"]

    let currentPosition = -1
    let newPosition = -1

    for (let i = 0; i < statuses.length; i++) {

        if (statuses[i] === currentStatus) {
            currentPosition = i
        }

        if (statuses[i] === newStatus) {
            newPosition = i
        }
    }

    if (newPosition === -1) {
        return false
    }

    if (newPosition <= currentPosition) {
        return false
    }

    return true
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

        let order = findOrderById(orders, orderId)

        if (order === null) {
            console.log("Order does not exist.")
            return
        }

        console.log("Current status: " + order.status)

        let newStatus = prompt("Enter new status: ")

        if (isStatusTransitionValid(order.status, newStatus) === false) {
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
 * Generates the next order ID based on the highest existing order
 * number, zero-padded to three digits.
 *
 * @param {Array} orders The list of existing orders.
 * @returns {String} The next order ID to use.
 */
function generateNextOrderId(orders) {
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

    return orderId
}

/**
 * Prompts the user to add one or more service items to an order,
 * validating each service ID and quantity entered.
 *
 * @param {Array} services The list of available services.
 * @returns {Object} An object containing the collected items array
 * and the running total price.
 */
function collectOrderItems(services) {
    let items = []
    let total = 0

    while (true) {

        let serviceId = prompt("Enter service ID (blank to finish): ")

        if (serviceId === "") {
            break
        }

        let selectedService = findServiceById(services, serviceId)

        if (selectedService === null) {
            console.log("Service does not exist.")
            continue
        }

        let quantity = Number(prompt("Enter quantity: "))

        if (quantity <= 0 || isNaN(quantity)) {
            console.log("Invalid quantity.")
            continue
        }

        items.push(
            {
                serviceId: serviceId,
                quantity: quantity
            }
        )

        total = total + (quantity * selectedService.price)
    }

    return { items: items, total: total }
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

        if (findCustomerById(customers, customerId) === null) {
            console.log("Customer does not exist.")
            return
        }

        let orderId = generateNextOrderId(orders)

        let today = new Date()
        let orderDate = today.toISOString().split("T")[0]

        let status = "Received"

        let result = collectOrderItems(services)

        if (result.items.length === 0) {
            console.log("Order must contain at least one service.")
            return
        }

        let newOrder = {
            orderId: orderId,
            customerId: customerId,
            orderDate: orderDate,
            status: status,
            items: result.items
        }

        orders.push(newOrder)

        let updatedData = JSON.stringify(orders, null, 4)

        await fs.writeFile("orders.json", updatedData)

        console.log()
        console.log("Order " + orderId + " created")
        console.log("Total price: " + result.total.toFixed(2) + " QAR")

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