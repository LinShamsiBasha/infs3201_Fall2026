import fs from 'fs/promises'

/**
 * Gets all laundry services.
 * @returns {Array} The list of services.
 */
export async function getServices() {
    let raw = await fs.readFile('services.json')
    let services = JSON.parse(raw)
    return services
}

/**
 * Finds a customer using their customer ID.
 * @param {String} customerId The customer ID.
 * @returns {Object|null} The customer or null if not found.
 */
export async function findCustomer(customerId) {
    let raw = await fs.readFile('customers.json')
    let customers = JSON.parse(raw)

    for (let customer of customers) {
        if (customer.customerId === customerId) {
            return customer
        }
    }

    return null
}

/**
 * Finds a service using its service ID.
 * @param {String} serviceId The service ID.
 * @returns {Object|null} The service or null if not found.
 */
export async function findService(serviceId) {
    let raw = await fs.readFile('services.json')
    let services = JSON.parse(raw)

    for (let service of services) {
        if (service.serviceId === serviceId) {
            return service
        }
    }

    return null
}

/**
 * Gets all orders belonging to a customer.
 * @param {String} customerId The customer ID.
 * @returns {Array} The customer's orders.
 */
export async function findOrdersByCustomer(customerId) {
    let raw = await fs.readFile('orders.json')
    let orders = JSON.parse(raw)
    let result = []

    for (let order of orders) {
        if (order.customerId === customerId) {
            result.push(order)
        }
    }

    return result
}

/**
 * Finds an order using its order ID.
 * @param {String} orderId The order ID.
 * @returns {Object|null} The order or null if not found.
 */
export async function findOrder(orderId) {
    let raw = await fs.readFile('orders.json')
    let orders = JSON.parse(raw)

    for (let order of orders) {
        if (order.orderId === orderId) {
            return order
        }
    }

    return null
}

/**
 * Gets the next available order ID.
 * @returns {String} The next order ID.
 */
export async function getNextOrderId() {
    let raw = await fs.readFile('orders.json')
    let orders = JSON.parse(raw)
    let maxId = 0

    for (let order of orders) {
        let id = Number(order.orderId.substring(1))

        if (id > maxId) {
            maxId = id
        }
    }

    return 'O' + String(maxId + 1).padStart(3, '0')
}

/**
 * Adds a new order to the orders file.
 * @param {Object} newOrder The new order.
 * @returns {void}
 */
export async function createOrder(newOrder) {
    let raw = await fs.readFile('orders.json')
    let orders = JSON.parse(raw)

    orders.push(newOrder)

    let result = JSON.stringify(orders, null, 4)
    await fs.writeFile('orders.json', result)
}

/**
 * Updates an existing order.
 * @param {Object} updatedOrder The order containing the updated information.
 * @returns {void}
 */
export async function updateOrder(updatedOrder) {
    let raw = await fs.readFile('orders.json')
    let orders = JSON.parse(raw)

    for (let order of orders) {
        if (order.orderId === updatedOrder.orderId) {
            order.status = updatedOrder.status
        }
    }

    let result = JSON.stringify(orders, null, 4)
    await fs.writeFile('orders.json', result)
}