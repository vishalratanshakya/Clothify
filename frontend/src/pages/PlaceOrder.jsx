import React, { useContext, useState } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }

    const initPay = (order, orderData) => {
        console.log('Initializing Razorpay payment:', { order, orderData })
        
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name:'Order Payment',
            description:'Order Payment',
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                console.log('Razorpay payment success response:', response)
                try {
                    // Send order data along with payment response
                    const { data } = await axios.post(backendUrl + '/api/order/verifyRazorpay', {
                        ...response,
                        orderData: orderData
                    }, {headers:{token}})
                    
                    console.log('Razorpay verification response:', data)
                    
                    if (data.success) {
                        toast.success(data.message)
                        navigate('/orders')
                        setCartItems({})
                    } else {
                        toast.error(data.message)
                    }
                } catch (error) {
                    console.log('Razorpay verification error:', error)
                    toast.error('Payment verification failed. Order not placed.')
                }
            },
            modal: {
                ondismiss: function() {
                    console.log('Razorpay payment cancelled by user')
                    toast.error('Payment was cancelled. Order was not placed.')
                },
                escape: true,
                backdropclose: true
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response) {
            console.log('Razorpay payment failed:', response)
            toast.error('Payment failed. Order was not placed.')
        })
        rzp.open()
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {

            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if (itemInfo) {
                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            let orderData = {
                address: formData,
                items: orderItems,
                amount: getCartAmount() + delivery_fee
            }
            

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                    if (response.data.success) {
                        setCartItems({})
                        navigate('/orders')
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe',orderData,{headers:{token}})
                    if (responseStripe.data.success) {
                        const {session_url} = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                case 'razorpay':

                    console.log('Creating Razorpay order with data:', orderData)
                    const responseRazorpay = await axios.post(backendUrl + '/api/order/razorpay', orderData, {headers:{token}})
                    console.log('Razorpay order creation response:', responseRazorpay.data)
                    
                    if (responseRazorpay.data.success) {
                        initPay(responseRazorpay.data.order, responseRazorpay.data.orderData)
                    } else {
                        toast.error(responseRazorpay.data.message || 'Failed to create Razorpay order')
                    }

                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-6 w-full sm:max-w-[480px]'>

                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>
                
                {/* Name Fields */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-700'>Full Name *</label>
                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='firstName' 
                            value={formData.firstName} 
                            className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                            type="text" 
                            placeholder='First name' 
                        />
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='lastName' 
                            value={formData.lastName} 
                            className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                            type="text" 
                            placeholder='Last name' 
                        />
                    </div>
                </div>
                
                {/* Email Field */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-700'>Email Address *</label>
                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='email' 
                        value={formData.email} 
                        className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                        type="email" 
                        placeholder='your.email@example.com' 
                    />
                </div>
                
                {/* Street Address */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-700'>Street Address *</label>
                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='street' 
                        value={formData.street} 
                        className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                        type="text" 
                        placeholder='123 Main Street, Apartment 4B' 
                    />
                </div>
                
                {/* City and State */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-700'>City & State</label>
                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='city' 
                            value={formData.city} 
                            className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                            type="text" 
                            placeholder='City *' 
                        />
                        <input 
                            onChange={onChangeHandler} 
                            name='state' 
                            value={formData.state} 
                            className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                            type="text" 
                            placeholder='State' 
                        />
                    </div>
                </div>
                
                {/* Zipcode and Country */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-700'>Postal Code & Country *</label>
                    <div className='flex gap-3'>
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='zipcode' 
                            value={formData.zipcode} 
                            className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                            type="text" 
                            placeholder='Pincode/Zipcode *' 
                        />
                        <input 
                            required 
                            onChange={onChangeHandler} 
                            name='country' 
                            value={formData.country} 
                            className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                            type="text" 
                            placeholder='Country *' 
                        />
                    </div>
                </div>
                
                {/* Phone Number */}
                <div className='flex flex-col gap-2'>
                    <label className='text-sm font-medium text-gray-700'>Phone Number *</label>
                    <input 
                        required 
                        onChange={onChangeHandler} 
                        name='phone' 
                        value={formData.phone} 
                        className='border border-gray-300 rounded py-3 px-4 w-full text-base focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent' 
                        type="tel" 
                        placeholder='+91 98765 43210' 
                    />
                </div>
            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>

                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>
                    <Title text1={'PAYMENT'} text2={'METHOD'} />
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('razorpay')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'razorpay' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.razorpay_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PlaceOrder
