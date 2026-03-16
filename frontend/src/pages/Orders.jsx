import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Orders = () => {

  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([])
  const [deletingOrderId, setDeletingOrderId] = useState(null)

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })
      console.log('Orders response:', response.data)
      
      if (response.data.success) {
        let allOrdersItem = []
        response.data.orders.map((order) => {
          console.log('Processing order:', order)
          order.items.map((item) => {
            item['status'] = order.status
            item['payment'] = order.payment
            item['paymentMethod'] = order.paymentMethod
            item['date'] = order.date
            item['orderId'] = order._id
            console.log('Order item with ID:', item.orderId)
            allOrdersItem.push(item)
          })
        })
        setOrderData(allOrdersItem.reverse())
      }

    } catch (error) {
      console.log('Load order data error:', error)
    }
  }

  const deleteOrder = async (orderId) => {
    try {
      console.log('Attempting to delete order:', orderId)
      const response = await axios.post(backendUrl + '/api/order/delete', { orderId }, { headers: { token } })
      
      console.log('Delete order response:', response.data)
      
      if (response.data.success) {
        toast.success('Your order has been cancelled successfully.')
        loadOrderData() // Reload orders to remove the deleted one
      } else {
        toast.error(response.data.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.log('Delete order error:', error.response?.data || error.message)
      const errorMessage = error.response?.data?.message || 'Failed to cancel order'
      toast.error(errorMessage)
    }
  }

  const handleDeleteClick = (orderId) => {
    setDeletingOrderId(orderId)
  }

  const confirmDelete = () => {
    if (deletingOrderId) {
      deleteOrder(deletingOrderId)
      setDeletingOrderId(null)
    }
  }

  const cancelDelete = () => {
    setDeletingOrderId(null)
  }

  useEffect(() => {
    loadOrderData()
  }, [token])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Placed':
        return 'bg-yellow-500'
      case 'Packing':
        return 'bg-blue-500'
      case 'Shipped':
        return 'bg-purple-500'
      case 'Out for Delivery':
        return 'bg-orange-500'
      case 'Delivered':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {orderData.map((item, index) => (
          <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div className='flex items-start gap-6 text-sm'>
              <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
              <div>
                <p className='sm:text-base font-medium'>{item.name}</p>
                <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                  <p>{currency}{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className='mt-1'>Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span></p>
                <p className='mt-1'>Payment: <span className='text-gray-400'>{item.paymentMethod}</span></p>
              </div>
            </div>
            <div className='md:w-1/2 flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <p className={`min-w-2 h-2 rounded-full ${getStatusColor(item.status)}`}></p>
                <p className='text-sm md:text-base'>{item.status}</p>
              </div>
              <div className='flex gap-2'>
                {(() => {
                  console.log('Order item status check:', {
                    status: item.status,
                    normalized: item.status ? item.status.trim().toLowerCase() : '',
                    shouldShow: item.status && item.status.trim().toLowerCase() === 'order placed',
                    orderId: item.orderId
                  })
                  return item.status && item.status.trim().toLowerCase() === 'order placed'
                })() && (
                  <button
                    onClick={() => handleDeleteClick(item.orderId)}
                    className='border px-4 py-2 text-sm font-medium rounded-sm bg-red-50 text-red-600 hover:bg-red-100 border-red-300'
                  >
                    Cancel Order
                  </button>
                )}
                <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingOrderId && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg max-w-sm w-full mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Cancel Order</h3>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={cancelDelete}
                className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
              >
                No, Keep Order
              </button>
              <button
                onClick={confirmDelete}
                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
