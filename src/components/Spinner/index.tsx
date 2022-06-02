import React from 'react'
import './index.css'
import Loading from '@/assets/images/loading.png'

type GenshinProps = {}

const Genshin: React.FC<GenshinProps> = () => {
  return (
    <div className="flex justify-center items-center mt-28 mb-24">
      <div className="spinner">
        <img className="prospect" src={Loading} alt="Loading..."></img>
        <div className="background">
          <img src={Loading} alt="Loading..."></img>
        </div>
      </div>
    </div>
  )
}

export default Genshin
