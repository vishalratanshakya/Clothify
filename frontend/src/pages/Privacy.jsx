import React from 'react'
import Title from '../components/Title'

const Privacy = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'PRIVACY'} text2={'POLICY'} />
      </div>

      <div className='my-10 flex flex-col gap-8 text-gray-600'>
        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Information We Collect</h2>
          <p className='mb-4'>At Clothify, we collect information to provide better services to our customers. The types of information we collect include:</p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Personal information (name, email, phone number, address)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Shopping preferences and browsing history</li>
            <li>Device and usage information</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>How We Use Your Information</h2>
          <p className='mb-4'>We use the information we collect to:</p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Process and fulfill your orders</li>
            <li>Provide customer support</li>
            <li>Send you promotional offers and updates</li>
            <li>Improve our products and services</li>
            <li>Prevent fraudulent transactions</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Information Sharing</h2>
          <p className='mb-4'>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except:</p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>To trusted service providers who assist us in operating our website</li>
            <li>When required by law or to protect our rights</li>
            <li>To protect against fraud or illegal activities</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.</p>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Cookies</h2>
          <p className='mb-4'>We use cookies to enhance your experience on our website. Cookies help us:</p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Remember your preferences</li>
            <li>Understand how you use our site</li>
            <li>Provide personalized content</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Your Rights</h2>
          <p className='mb-4'>You have the right to:</p>
          <ul className='list-disc pl-6 space-y-2'>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </div>

        <div>
          <h2 className='text-xl font-semibold mb-4 text-gray-800'>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <p className='mt-2'>
            Email: clothifyofficial@gmail.com<br />
            Phone: 9084410891<br />
            Address: Ghaziabad Crossing Republic
          </p>
        </div>

        <div className='mt-8 p-4 bg-gray-100 rounded-lg'>
          <p className='text-sm text-center'>
            <strong>Last Updated:</strong> March 2024<br />
            This Privacy Policy may be updated from time to time to reflect changes in our practices.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Privacy
