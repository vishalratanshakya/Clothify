import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const Verify = () => {
    const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
    const [searchParams, setSearchParams] = useSearchParams()
    const [loading, setLoading] = useState(true)
    
    const success = searchParams.get('success')
    const session_id = searchParams.get('session_id')

    const verifyPayment = async () => {
        try {
            if (!token) {
                navigate('/login')
                return
            }

            // For Stripe, we need to verify with session_id
            const response = await axios.post(backendUrl + '/api/order/verifyStripe', { 
                success, 
                session_id 
            }, { headers: { token } })

            if (response.data.success) {
                toast.success(response.data.message)
                setCartItems({})
                navigate('/orders')
            } else {
                toast.error(response.data.message)
                navigate('/cart')
            }

        } catch (error) {
            console.log(error)
            toast.error('Payment verification failed. Order not placed.')
            navigate('/cart')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        verifyPayment()
    }, [token])

    if (loading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4'></div>
                    <p className='text-lg'>Verifying payment...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='text-center'>
                <p>Redirecting...</p>
            </div>
        </div>
    )
}

export default Verify