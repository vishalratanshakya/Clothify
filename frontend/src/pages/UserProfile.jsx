import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ChevronLeft,
  ShoppingBag
} from 'lucide-react'

const UserProfile = () => {
  const navigate = useNavigate()
  const { token, backendUrl, currency } = useContext(ShopContext)
  const [userData, setUserData] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: ''
  })

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/user-profile/profile', {
        headers: { token }
      })
      
      if (response.data.success) {
        setUserData(response.data.user)
        setFormData({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          street: response.data.user.street || '',
          city: response.data.user.city || '',
          state: response.data.user.state || '',
          zipcode: response.data.user.zipcode || '',
          country: response.data.user.country || ''
        })
      }
    } catch (error) {
      console.log('Error fetching user data:', error)
      toast.error('Failed to load user data')
    }
  }

  // Update user profile
  const updateProfile = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/user-profile/update', formData, {
        headers: { token }
      })
      
      if (response.data.success) {
        setUserData(response.data.user)
        setIsEditing(false)
        toast.success('Profile updated successfully!')
      } else {
        toast.error(response.data.message || 'Failed to update profile')
      }
    } catch (error) {
      console.log('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false)
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        street: userData.street || '',
        city: userData.city || '',
        state: userData.state || '',
        zipcode: userData.zipcode || '',
        country: userData.country || ''
      })
    }
  }

  // Fetch user orders
  const fetchUserOrders = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/order/userorders', {}, {
        headers: { token }
      })
      
      if (response.data.success) {
        setOrders(response.data.orders.reverse()) // Latest orders first
      }
    } catch (error) {
      console.log('Error fetching orders:', error)
      toast.error('Failed to load orders')
    }
  }

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchUserData(),
        fetchUserOrders()
      ])
      setLoading(false)
    }
    
    if (token) {
      loadData()
    }
  }, [token])

  // Get status icon and color
  const getStatusInfo = (status) => {
    const statusMap = {
      'Order Placed': { icon: Clock, color: 'text-blue-600 bg-blue-100' },
      'Processing': { icon: Package, color: 'text-yellow-600 bg-yellow-100' },
      'Shipped': { icon: Truck, color: 'text-purple-600 bg-purple-100' },
      'Delivered': { icon: CheckCircle, color: 'text-green-600 bg-green-100' },
      'Cancelled': { icon: XCircle, color: 'text-red-600 bg-red-100' }
    }
    
    return statusMap[status] || { icon: Clock, color: 'text-gray-600 bg-gray-100' }
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderDetails(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account and track your orders</p>
      </div>

      {/* User Information Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              {userData?.image ? (
                <img src={userData.image} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-gray-400" />
              )}
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          // Edit Form
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{formData.email || 'Not provided'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your street address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your city"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your state"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="zipcode"
                    value={formData.zipcode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your postal code"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={cancelEdit}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateProfile}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          // Display Mode
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <div className="flex items-center mt-1">
                  <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {userData?.firstName && userData?.lastName 
                      ? `${userData.firstName} ${userData.lastName}` 
                      : 'Not provided'
                    }
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <div className="flex items-center mt-1">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{userData?.email || 'Not provided'}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <div className="flex items-center mt-1">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{userData?.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Street Address</label>
                <div className="flex items-center mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{userData?.street || 'Not provided'}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">City</label>
                <div className="flex items-center mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{userData?.city || 'Not provided'}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">State & Postal Code</label>
                <div className="flex items-center mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {userData?.state && userData?.zipcode 
                      ? `${userData.state}, ${userData.zipcode}`
                      : userData?.state || userData?.zipcode || 'Not provided'
                    }
                  </span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Country</label>
                <div className="flex items-center mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{userData?.country || 'Not provided'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
          <div className="flex items-center text-sm text-gray-500">
            <ShoppingBag className="w-4 h-4 mr-1" />
            {orders.length} Orders
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">You haven't placed any orders. Start shopping to see your orders here.</p>
            <button 
              onClick={() => navigate('/collection')}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon
              
              return (
                <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm text-gray-500">Order ID</span>
                          <h3 className="font-semibold text-gray-900">#{order._id.slice(-8)}</h3>
                        </div>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(order.date)}
                        </div>
                        <div className="flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {order.items?.length || 0} Items
                        </div>
                        <div className="font-semibold text-gray-900">
                          Total: {currency}{order.amount}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <img 
                            key={index}
                            src={item.image[0]} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded border border-gray-200"
                          />
                        ))}
                        {order.items?.length > 3 && (
                          <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-600">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Order Info */}
                <div className="border-b pb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Order ID:</span>
                      <p className="font-medium">#{selectedOrder._id.slice(-8)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Order Date:</span>
                      <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusInfo(selectedOrder.status).color}`}>
                        {React.createElement(getStatusInfo(selectedOrder.status).icon, { className: 'w-3 h-3 mr-1' })}
                        {selectedOrder.status}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Amount:</span>
                      <p className="font-medium">{currency}{selectedOrder.amount}</p>
                    </div>
                  </div>
                </div>
                
                {/* Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <img 
                          src={item.image[0]} 
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded border border-gray-200"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.name}</h5>
                          <p className="text-sm text-gray-500">Size: {item.size} | Quantity: {item.quantity}</p>
                          <p className="text-sm font-medium text-gray-900">{currency}{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Shipping Address */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Shipping Address</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p>{selectedOrder.address?.firstName} {selectedOrder.address?.lastName}</p>
                    <p>{selectedOrder.address?.street}</p>
                    <p>{selectedOrder.address?.city}, {selectedOrder.address?.state} {selectedOrder.address?.zipcode}</p>
                    <p>{selectedOrder.address?.country}</p>
                    <p>{selectedOrder.address?.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
