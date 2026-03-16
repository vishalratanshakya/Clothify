import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>

      <div className='text-2xl text-center pt-8 border-t'>
          <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
          <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
          <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
              <p>Fashion Forward was born from a passion for contemporary style and a vision to make premium fashion accessible to everyone. Our journey began with a simple belief: that clothing should not only look good but feel good, empowering individuals to express their unique identity through every piece they wear.</p>
              <p>Since our inception, we've dedicated ourselves to curating collections that blend timeless elegance with modern trends. From everyday essentials to statement pieces, each item in our store is carefully selected to ensure quality, comfort, and style that stands the test of time.</p>
              <b className='text-gray-800'>Our Mission</b>
              <p>Our mission at Fashion Forward is to inspire confidence through fashion. We believe that the right outfit can transform not just how you look, but how you feel. We're committed to providing exceptional pieces that help you tell your story, express your personality, and step into every moment with confidence.</p>
          </div>
      </div>

      <div className=' text-xl py-4'>
          <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Premium Quality:</b>
            <p className=' text-gray-600'>We source only the finest fabrics and materials, ensuring every piece meets our exacting standards for quality, durability, and comfort.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Trendsetting Designs:</b>
            <p className=' text-gray-600'>Our collections are carefully curated to feature the latest trends while maintaining timeless appeal, keeping you stylish season after season.</p>
          </div>
          <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
            <b>Personalized Service:</b>
            <p className=' text-gray-600'>Our fashion experts are here to help you find the perfect pieces that complement your style, ensuring you look and feel your best.</p>
          </div>
      </div>

      <NewsletterBox/>
      
    </div>
  )
}

export default About
