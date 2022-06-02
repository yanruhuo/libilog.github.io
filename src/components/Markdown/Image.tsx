import React, { useState, useEffect } from 'react'
import { ComponentPropsWithoutRef, ComponentType, ReactMarkdownProps } from 'react-markdown/lib/ast-to-react'
import clsx from 'clsx'
import Spinner from '@/components/Spinner'
import { fileCDN } from '@/utils/format'
import { useLoading } from '@/utils/hook'

type ImageProps = ComponentPropsWithoutRef<'img'> & ReactMarkdownProps

type ImageComponent = ComponentType<ImageProps>

const Image: ImageComponent = ({ src = '', alt = '' }) => {
  const [loading, setloading] = useState(true)
  const delay = useLoading()
  const cdnSrc = fileCDN(src)

  useEffect(() => {
    const img = new window.Image()
    img.onload = async () => {
      await delay()
      setloading(false)
    }
    img.src = cdnSrc
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cdnSrc])

  return (
    <>
      <img className={clsx('img-zoomable m-auto fade rounded shadow-md', loading && 'hidden')} src={cdnSrc} alt={alt} />
      {loading && <Spinner />}
      {alt && <span className="block mt-2 text-center italic">◭ {alt}</span>}
    </>
  )
}

export default Image
