// Order Delete
let buttonOrderDelete = document.querySelectorAll('[button-order-delete]')
if (buttonOrderDelete) {
  let formOrderDelete = document.querySelector('[form-order-delete]')
  if (formOrderDelete) {
    for (let button of buttonOrderDelete) {
      button.addEventListener('click', (e) => {
        if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
          let id = e.target.dataset.id;
          let path = formOrderDelete.dataset.path;
          formOrderDelete.action = `${path}/${id}?_method=DELETE`
          formOrderDelete.submit()
        }
      })
    }
  }
}
