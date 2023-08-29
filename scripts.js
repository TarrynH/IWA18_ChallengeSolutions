import { state, createOrderData, updateDragging } from './data.js'
import { html, createOrderHtml, updateDraggingHtml, moveToColumn } from './view.js'


/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event 
 */
const handleDragOver = (event) => {
    event.preventDefault();
    const path = event.path || event.composedPath()
    let column = null

    for (const element of path) {
        const { area } = element.dataset
        if (area) {
            column = area
            break;
        }
    }

    if (!column) return
    updateDragging({ over: column })
    updateDraggingHtml({ over: column })
}


const handleDragStart = (event) => {
    state.dragging.source = state.dragging.over
}

const handleDragEnd = (event) => {
    event.preventDefault()
    const dragging = event.target.closest('.order')
    const id = dragging.dataset.id
    const moved = state.dragging.over 
    moveToColumn(id, moved)
}

/**
 * Function that opens a help overlay when the "help"/? button is clicked, and closes the overlay when the "close" button is clicked.
 * @param {*} event 
 */
const handleHelpToggle = (event) => {
    const {target} = event
    if (target === html.other.help) {
        html.help.overlay.show()
    } else if (target === html.help.cancel) {
        html.help.overlay.close()
    }
}

/**
 * Function that opens an order overlay when the "Add Order" button is clicked, and closes the overlay when the "cancel" button is clicked. When either 
 * button is clicked, it resets the order information so the order overlay is blank when the "Add Order" button is clicked on again.
 * @param {*} event 
 */
const handleAddToggle = (event) => {
    const {target} = event
    if (target === html.other.add) {
        html.add.overlay.show()
    } else if (target === html.add.cancel) {
        html.add.overlay.close()
        html.add.form.reset() 
    }
}

const handleAddSubmit = (event) => {
    event.preventDefault()

    const order = {
        title: html.add.title.value,
        table: html.add.table.value,
        column: 'ordered',
    }

    const orderData = createOrderData(order)
    const orderHtml = createOrderHtml(orderData)
    const columnContainer = document.querySelector(`[data-column="${order.column}"]`)

    columnContainer.appendChild(orderHtml)

    html.add.overlay.close()
    html.add.form.reset()
}

const handleEditToggle = (event) => {
    const {target} = event

    const openEdit = document.querySelector('.order')
    if (target === openEdit) {
        html.edit.overlay.show()
    } else if (target === html.edit.cancel) {
        html.edit.overlay.close()
    }
}

const handleEditSubmit = (event) => {
    event.preventDefault()

    const order = document.querySelector('.order')
    order.remove()

    const editOrder = {
        title: html.edit.title.value,
        table: html.edit.table.value,
        column: html.edit.column.value
    }

    const editData = createOrderData(editOrder)
    const editHtml = createOrderHtml(editData)
    const columnContainer = document.querySelector(`[data-column= ${editOrder.column}]`)

    columnContainer.appendChild(editHtml)
    html.edit.overlay.close()
}

const handleDelete = (event) => {
    const {target} = event
    const order = document.querySelector('.order')

    if (target === html.edit.delete) {
        order.remove()
    }
    html.edit.overlay.close()
}


html.add.cancel.addEventListener('click', handleAddToggle)
html.other.add.addEventListener('click', handleAddToggle)
html.add.form.addEventListener('submit', handleAddSubmit)

html.other.grid.addEventListener('click', handleEditToggle)
html.edit.cancel.addEventListener('click', handleEditToggle)
html.edit.form.addEventListener('submit', handleEditSubmit)
html.edit.delete.addEventListener('click', handleDelete)

html.help.cancel.addEventListener('click', handleHelpToggle)
html.other.help.addEventListener('click', handleHelpToggle)

for (const htmlColumn of Object.values(html.columns)) {
    htmlColumn.addEventListener('dragstart', handleDragStart)
    htmlColumn.addEventListener('dragend', handleDragEnd)
}

for (const htmlArea of Object.values(html.area)) {
    htmlArea.addEventListener('dragover', handleDragOver)
}