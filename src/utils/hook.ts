import { useState } from 'react'

export const useLoading = (duration: number = 1000) => {
  const [startTime] = useState(new Date().getTime())

  const loading = () =>
    new Promise<void>((resolve) => {
      const interval = duration - (new Date().getTime() - startTime)
      if (interval > 0) {
        setTimeout(resolve, interval)
      } else {
        resolve()
      }
    })

  return loading
}
