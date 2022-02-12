// boardFormDB.columns.sort((a, b) => {
//     return (
//         boardFormDB.columnOder.indexOf(a.id) -
//         boardFormDB.columnOder.indexOf(b.id)
//     )
// })

export const mapOrder = (array, order, key) => {
    array.sort((a, b) => order.indexOf(a[key]) - order.indexOf(b[key]))
    return array
}
