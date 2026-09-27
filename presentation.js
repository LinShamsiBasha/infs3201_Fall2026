import promptSync from 'prompt-sync'

import {
    getLaundryServices,
    getCustomer,
    getCustomerOrders,
    getOrder,
    getServiceInformation,
    changeOrderStatus,
    addNewOrder
} from './business.js'

const prompt = promptSync()

/**
 * Displays all laundry services.
 * @returns {void}
 */
async function showLaundryServices() {
    let services = await getLaundryServices()

    console.log()
    console.log('Service ID Service                    Unit    Price')
    console.log('---------- -------------------------- ------- ------')

    for (let service of services) {
        console.log(
            `${service.serviceId.padEnd(10)} ` +
            `${service.name.padEnd(26)} ` +
            `${service.unit.padEnd(5)} ` +
            `${service.price.toFixed(2).padStart(8)}`
        )
    }

    console.log()
}

/**
 * Displays all orders belonging to a customer.
 * @returns {void}
 */
async function showCustomerOrders() {
    let customerId = prompt('Enter customer ID: ')

    let customer = await getCustomer(customerId)

    if (customer === null) {
        console.log('**** customer not found')
        return
    }

    let orders = await getCustomerOrders(customerId)

    console.log(`Orders for ${customer.name}`)
    console.log('Order ID  Order Date  Status      Total')
    console.log('--------  ----------  ----------- -----')

    for (let order of orders) {
        console.log(
            `${order.orderId.padEnd(8)}  ` +
            `${order.orderDate.padEnd(10)}  ` +
            `${order.status.padEnd(11)} ` +
            `${order.total.toFixed(2).padStart(5)}`
        )
    }
}

/**
 * Allows the user to change an order's status.
 * @returns {void}
 */
async function updateStatus() {
    let orderId = prompt('Enter order ID: ')

    let order = await getOrder(orderId)

    if (order === null) {
        console.log('**** order not found')
        return
    }

    console.log(`Current status: ${order.status}`)

    let newStatus = prompt('Enter new status: ')

    let result = await changeOrderStatus(orderId, newStatus)

    if (result === false) {
        console.log('New status not accepted')
    }
    else {
        console.log('Status updated')
    }
}

/**
 * Allows the user to create a new order.
 * @returns {void}
 */
async function createNewOrder() {
    let customerId = prompt('Enter customer ID: ')

    let customer = await getCustomer(customerId)

    if (customer === null) {
        console.log('**** customer not found')
        return
    }

    let items = []

    while (true) {
        let serviceId = prompt('Enter service ID (blank to finish): ')

        if (serviceId === '') {
            break
        }

        let service = await getServiceInformation(serviceId)

        if (service === null) {
            console.log('**** service not found')
            continue
        }

        let quantity = Number(prompt('Enter quantity: '))

        if (quantity <= 0 || isNaN(quantity)) {
            console.log('**** invalid quantity')
            continue
        }

        items.push({
            serviceId: serviceId,
            quantity: quantity
        })
    }

    if (items.length === 0) {
        console.log('**** order must contain at least one service')
        return
    }

    let result = await addNewOrder(customerId, items)

    console.log(`Order ${result.orderId} created`)
    console.log(`Total price: ${result.total.toFixed(2)} QAR`)
}

/**
 * Displays the menu and gets a valid selection.
 * @returns {Number} The selected menu option.
 */
function showMenu() {
    while (true) {
        console.log('1. Show laundry services')
        console.log('2. View customer orders')
        console.log('3. Update order status')
        console.log('4. Create new order')
        console.log('5. Exit')
        console.log()

        let selection = Number(prompt('What is your choice> '))

        if (selection >= 1 && selection <= 5) {
            return selection
        }

        console.log('*** Invalid input.. try again! ***')
    }
}

while (true) {
    let option = showMenu()

    if (option === 1) {
        await showLaundryServices()
    }
    else if (option === 2) {
        await showCustomerOrders()
    }
    else if (option === 3) {
        await updateStatus()
    }
    else if (option === 4) {
        await createNewOrder()
    }
    else {
        break
    }
}

console.log('Thank you')