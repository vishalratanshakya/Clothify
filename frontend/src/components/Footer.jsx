import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Logo from './Logo'

const Footer = () => {
  const navigate = useNavigate()

  const handleLinkClick = (path) => {
    navigate(path)
    window.scrollTo(0, 0)
  }

  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
            <Logo className="mb-5 w-32" />
            <p className='w-full md:w-2/3 text-gray-600'>
            Elevate your wardrobe with our curated collection of contemporary essentials. Where innovative design meets sustainable fashion, creating pieces that tell your unique story with every wear.
            </p>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>COMPANY</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li><button onClick={() => handleLinkClick('/')} className='hover:text-black transition-colors text-left w-full'>Home</button></li>
                <li><button onClick={() => handleLinkClick('/about')} className='hover:text-black transition-colors text-left w-full'>About us</button></li>
                <li><button onClick={() => handleLinkClick('/contact')} className='hover:text-black transition-colors text-left w-full'>Contact</button></li>
                <li><button onClick={() => handleLinkClick('/privacy')} className='hover:text-black transition-colors text-left w-full'>Privacy policy</button></li>
            </ul>
        </div>

        <div>
            <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
            <ul className='flex flex-col gap-1 text-gray-600'>
                <li className='font-medium'>Our Store</li>
                <li>Ghaziabad Crossing Republic</li>
                <li>9084410891</li>
                <li>clothifyofficial@gmail.com</li>
            </ul>
        </div>

      </div>

        <div>
            <hr />
            <p className='py-5 text-sm text-center'>Copyright 2024@ Clothify.com - All Right Reserved.</p>
        </div>

    </div>
  )
}

export default Footer
