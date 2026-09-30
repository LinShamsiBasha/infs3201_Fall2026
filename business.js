import {
    getServices,
    findCustomer,
    findService,
    findOrdersByCustomer,
    findOrder,
    getNextOrderId,
    createOrder,
    updateOrder
} from './persistence.js'

/**
 * Gets all available laundry services.
 * @returns {Array} The available services.
 */
export async function getLaundryServices() {
    return await getServices()
}

/**
 * Gets customer information.
 * @param {String} customerId The customer ID.
 * @returns {Object|null} The customer or null.
 */
export async function getCustomer(customerId) {
    return await findCustomer(customerId)
}

/**
 * Calculates the pricing information for an order.
 * @param {Object} order The order.
 * @returns {Object} The calculated pricing information.
 */
export async function calculateOrderPrice(order) {
    let subtotal = 0

    for (let item of order.items) {
        let service = await findService(item.serviceId)

        if (service !== null) {
            subtotal = subtotal + (service.price * item.quantity)
        }
    }

    let adjustedServiceCharge = subtotal

    if (subtotal < 25) {
        adjustedServiceCharge = 25
    }

    let minimumAdjustment = adjustedServiceCharge - subtotal

    let deliveryCharge = 0

    if (subtotal < 50) {
        deliveryCharge = 10
    }

    let finalTotal = adjustedServiceCharge + deliveryCharge

    return {
        subtotal: subtotal,
        minimumAdjustment: minimumAdjustment,
        deliveryCharge: deliveryCharge,
        finalTotal: finalTotal
    }
}

/**
 * Gets a customer's orders and calculates their totals.
 * @param {String} customerId The customer ID.
 * @returns {Array} The customer's orders with pricing information.
 */
export async function getCustomerOrders(customerId) {
    let orders = await findOrdersByCustomer(customerId)
    let result = []

    for (let order of orders) {
        let price = await calculateOrderPrice(order)

        result.push({
            orderId: order.orderId,
            orderDate: order.orderDate,
            status: order.status,
            total: price.finalTotal
        })
    }

    return result
}

/**
 * Changes an order's status if the change is allowed.
 * @param {String} orderId The order ID.
 * @param {String} newStatus The requested new status.
 * @returns {Boolean} True when successful, otherwise false.
 */
export async function changeOrderStatus(orderId, newStatus) {
    let order = await findOrder(orderId)

    if (order === null) {
        return false
    }

    let statuses = ['Received', 'Washing', 'Ready', 'Delivered']

    let currentPosition = statuses.indexOf(order.status)
    let newPosition = statuses.indexOf(newStatus)

    if (newPosition === -1 || newPosition <= currentPosition) {
        return false
    }

    order.status = newStatus

    await updateOrder(order)

    return true
}

/**
 * Gets an order.
 * @param {String} orderId The order ID.
 * @returns {Object|null} The order or null.
 */
export async function getOrder(orderId) {
    return await findOrder(orderId)
}

/**
 * Gets information about a service.
 * @param {String} serviceId The service ID.
 * @returns {Object|null} The service or null.
 */
export async function getServiceInformation(serviceId) {
    return await findService(serviceId)
}


/**
 * Gets all information needed to display an invoice.
 * @param {String} orderId The order ID.
 * @returns {Object|null} The invoice information or null if not found.
 */
export async function getInvoice(orderId) {
    let order = await findOrder(orderId)

    if (order === null) {
        return null
    }

    let customer = await findCustomer(order.customerId)

    if (customer === null) {
        return null
    }

    let invoiceItems = []

    for (let item of order.items) {
        let service = await findService(item.serviceId)

        if (service === null) {
            return null
        }

        let lineTotal = service.price * item.quantity

        invoiceItems.push({
            name: service.name,
            quantity: item.quantity,
            unitPrice: service.price,
            lineTotal: lineTotal
        })
    }

    let price = await calculateOrderPrice(order)

    return {
        orderId: order.orderId,
        orderDate: order.orderDate,
        status: order.status,
        customerName: customer.name,
        items: invoiceItems,
        subtotal: price.subtotal,
        minimumAdjustment: price.minimumAdjustment,
        deliveryCharge: price.deliveryCharge,
        finalTotal: price.finalTotal
    }
}













/**
 * Creates a new order.
 * @param {String} customerId The customer ID.
 * @param {Array} items The selected order items.
 * @returns {Object} Information about the newly created order.
 */
export async function addNewOrder(customerId, items) {
    let orderId = await getNextOrderId()

    let today = new Date()
    let orderDate = today.toISOString().substring(0, 10)

    let order = {
        orderId: orderId,
        customerId: customerId,
        orderDate: orderDate,
        status: 'Received',
        items: items
    }

    await createOrder(order)

    let price = await calculateOrderPrice(order)

    return {
        orderId: orderId,
        total: price.finalTotal
    }
}
