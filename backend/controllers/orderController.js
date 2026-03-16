import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharge = 10

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
    key_id : process.env.RAZORPAY_KEY_ID,
    key_secret : process.env.RAZORPAY_KEY_SECRET,
})

// Placing orders using COD Method
const placeOrder = async (req,res) => {
    
    try {
        
        console.log('Place order request body:', req.body);
        console.log('Request headers:', req.headers);
        
        const { userId, items, amount, address} = req.body;

        console.log('Extracted values:', { userId, itemsCount: items?.length, amount, hasAddress: !!address });

        if (!userId) {
            console.log('ERROR: userId is missing from request body');
            return res.json({success:false, message: 'userId is required. Please login again.'});
        }

        // Check if userId is valid (not admin user)
        if (userId.startsWith('admin_')) {
            console.log('ERROR: Admin users cannot place orders');
            return res.json({success:false, message: 'Admin users cannot place orders. Please login as a customer.'});
        }

        const orderData = {
            userId,
            items,
            address,
            amount,
            paymentMethod:"COD",
            payment:false,
            date: Date.now()
        }

        console.log('Creating order with data:', orderData);

        const newOrder = new orderModel(orderData)
        await newOrder.save()

        console.log('Order saved successfully:', newOrder._id);

        // Only clear cart for regular users, not admin users
        if (!userId.startsWith('admin_')) {
            await userModel.findByIdAndUpdate(userId,{cartData:{}})
        }

        res.json({success:true,message:"Order Placed"})


    } catch (error) {
        console.log('Error in placeOrder:', error)
        res.json({success:false,message:error.message})
    }

}

// Placing orders using Stripe Method - Create Stripe session only, not database order
const placeOrderStripe = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body
        const { origin } = req.headers;

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name:item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name:'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        // Create session with order data in metadata
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true`,
            cancel_url:  `${origin}/verify?success=false`,
            line_items,
            mode: 'payment',
            metadata: {
                userId: userId,
                orderData: JSON.stringify({userId, items, amount, address})
            }
        })

        res.json({success:true,session_url:session.url});

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Verify Stripe - Create order only after successful payment
const verifyStripe = async (req,res) => {
    try {
        const { success, session_id } = req.body

        if (success === "true") {
            // Retrieve the session to get order data
            const session = await stripe.checkout.sessions.retrieve(session_id)
            
            if (session.payment_status === 'paid') {
                // Parse order data from metadata
                const orderData = JSON.parse(session.metadata.orderData)
                
                // Create order in database only after successful payment
                const newOrder = new orderModel({
                    userId: orderData.userId,
                    items: orderData.items,
                    address: orderData.address,
                    amount: orderData.amount,
                    paymentMethod: "Stripe",
                    payment: true, // Payment is successful
                    date: Date.now()
                })
                
                await newOrder.save()
                await userModel.findByIdAndUpdate(orderData.userId, {cartData: {}})
                
                res.json({ success: true, message: "Payment Successful! Order placed." })
            } else {
                res.json({ success: false, message: 'Payment failed. Order was not placed.' })
            }
        } else {
            res.json({ success: false, message: 'Payment cancelled. Order was not placed.' })
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Placing orders using Razorpay Method - Create Razorpay order only, not database order
const placeOrderRazorpay = async (req,res) => {
    try {
        
        const { userId, items, amount, address} = req.body

        // Create Razorpay order without saving to database
        // Generate a short receipt ID (max 40 characters)
        const safeUserId = userId ? userId.slice(-8) : 'unknown'
        const receipt = `temp_${safeUserId}_${Date.now().toString().slice(-6)}`
        
        const options = {
            amount: amount * 100,
            currency: currency.toUpperCase(),
            receipt: receipt
        }

        console.log('Creating Razorpay order with receipt:', receipt)

        await razorpayInstance.orders.create(options, (error,order)=>{
            if (error) {
                console.log('Razorpay order creation error:', error)
                return res.json({success:false, message: error})
            }
            // Return Razorpay order with order data for later use
            console.log('Razorpay order created successfully:', order.id)
            res.json({success:true,order, orderData: {userId, items, amount, address}})
        })

    } catch (error) {
        console.log('Razorpay placement error:', error)
        res.json({success:false,message:error.message})
    }
}

const verifyRazorpay = async (req,res) => {
    try {
        
        const { userId, razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body

        console.log('Razorpay verification request:', {
            userId,
            razorpay_order_id,
            razorpay_payment_id,
            hasOrderData: !!orderData
        })

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        console.log('Razorpay order info:', {
            id: orderInfo.id,
            status: orderInfo.status,
            amount: orderInfo.amount,
            receipt: orderInfo.receipt
        })
        
        if (orderInfo.status === 'paid') {
            console.log('Payment successful, creating order...')
            // Create order in database only after successful payment
            const newOrder = new orderModel({
                userId: orderData.userId,
                items: orderData.items,
                address: orderData.address,
                amount: orderData.amount,
                paymentMethod: "Razorpay",
                payment: true, // Payment is successful
                date: Date.now()
            })
            
            await newOrder.save()
            await userModel.findByIdAndUpdate(userId, {cartData: {}})
            
            console.log('Order created successfully:', newOrder._id)
            res.json({ success: true, message: "Payment Successful! Order placed." })
        } else {
            console.log('Payment failed or cancelled, order not created')
            // Payment failed - no order was created, so nothing to delete
            res.json({ success: false, message: 'Payment failed or cancelled. Order was not placed.' });
        }

    } catch (error) {
        console.log('Razorpay verification error:', error)
        res.json({success:false,message:error.message})
    }
}

// All Orders data for Admin Panel
const allOrders = async (req,res) => {

    try {
        
        console.log('Admin requesting all orders...');
        const orders = await orderModel.find({})
        console.log('Found orders:', orders.length);
        
        if (orders.length > 0) {
            console.log('Sample order:', {
                id: orders[0]._id,
                userId: orders[0].userId,
                amount: orders[0].amount,
                status: orders[0].status,
                date: orders[0].date
            });
        }
        
        res.json({success:true,orders})

    } catch (error) {
        console.log('Error in allOrders:', error)
        res.json({success:false,message:error.message})
    }

}

// User Order Data For Forntend
const userOrders = async (req,res) => {
    try {
        
        const { userId } = req.body

        const orders = await orderModel.find({ userId })
        res.json({success:true,orders})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// update order status from Admin Panel
const updateStatus = async (req,res) => {
    try {
        
        const { orderId, status } = req.body

        await orderModel.findByIdAndUpdate(orderId, { status })
        res.json({success:true,message:'Status Updated'})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

// Delete order for user (only if status is "Order Placed" or payment is false)
const deleteOrder = async (req,res) => {
    try {
        
        const { orderId } = req.body
        console.log('Delete order request received:', { orderId })
        
        // Find the order first
        const order = await orderModel.findById(orderId)
        console.log('Found order:', order ? {
            id: order._id,
            status: order.status,
            payment: order.payment,
            paymentMethod: order.paymentMethod
        } : 'Order not found')
        
        if (!order) {
            console.log('Order not found:', orderId)
            return res.json({success:false,message:'Order not found'})
        }
        
        // Normalize status for comparison (trim spaces and case-insensitive)
        const normalizedStatus = order.status ? order.status.trim().toLowerCase() : ''
        const isOrderPlaced = normalizedStatus === 'order placed'
        
        console.log('Status check:', {
            originalStatus: order.status,
            normalizedStatus: normalizedStatus,
            isOrderPlaced: isOrderPlaced,
            payment: order.payment
        })
        
        // Allow deletion if payment is false (unpaid) or status is "Order Placed"
        if (order.payment === false || isOrderPlaced) {
            await orderModel.findByIdAndDelete(orderId)
            console.log('Order deleted successfully:', orderId)
            res.json({success:true,message:'Your order has been cancelled successfully.'})
        } else {
            console.log('Cannot delete order - already processed:', { status: order.status, payment: order.payment })
            res.json({success:false,message:'Cannot delete order. Order is already being processed.'})
        }

    } catch (error) {
        console.log('Delete order error:', error)
        res.json({success:false,message:error.message})
    }
}

export {verifyRazorpay, verifyStripe ,placeOrder, placeOrderStripe, placeOrderRazorpay, allOrders, userOrders, updateStatus, deleteOrder}