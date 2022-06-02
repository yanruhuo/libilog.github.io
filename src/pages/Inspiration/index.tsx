import React, { useState, useEffect, useRef, MouseEvent } from 'react'
import clsx from 'clsx'
import AOS from 'aos'
import { Issue } from '@/type'
import { parseTime } from '@/utils'
import { queryInspiration } from '@utils/service'
import { useLoading } from '@/utils/hook'
import Loading from '@components/Loading'
import Markdown from '@/components/Markdown'
import Comment from '@/components/Comment'
import styles from './index.module.css'

type InspirationProps = {}

const Inspiration: React.FC<InspirationProps> = () => {
  const loading = useLoading()
  const [page, setPage] = useState(1)
  const [issues, setIssues] = useState<Array<Issue>>([])
  const maskRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const hoverRef = useRef<any>(null)
  const timerRef = useRef<number>()
  const loadingRef = useRef<boolean>(false)
  const finishedRef = useRef<boolean>(false)
  const [maskHeight, setMaskHeight] = useState(0)
  const [maskTop, setMaskTop] = useState(0)

  const handleQuery = () => {
    loadingRef.current = true
    queryInspiration(page)
      .then(async (data) => {
        if (page === 1) {
          await loading()
        }

        if (data.length) {
          setIssues([...issues, ...data])
        } else {
          finishedRef.current = true
        }

        if (maskHeight === 0) {
          setTimeout(() => {
            const target = listRef.current?.firstChild
            if (target) {
              calcMaskPos(target)
            }
          }, 100)
        }
      })
      .catch(console.error)
      .finally(() => {
        loadingRef.current = false
      })
  }

  useEffect(() => {
    handleQuery()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const calcMaskPos = (target: any) => {
    const { clientHeight, offsetTop } = target
    const paddingTop = document.documentElement.clientWidth > 1024 ? 3 * 16 : 2 * 16
    const realTop = offsetTop + paddingTop
    if (maskHeight === clientHeight && maskTop === realTop) return
    setMaskHeight(clientHeight)
    setMaskTop(realTop)
  }

  const handleMask = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault()
    hoverRef.current = e.currentTarget
    calcMaskPos(e.currentTarget)
  }

  const handleScroll = () => {
    clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      if (hoverRef.current) {
        calcMaskPos(hoverRef.current)
      }
    }, 100)

    // load more
    if (loadingRef.current || finishedRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement
    if (scrollTop + clientHeight > scrollHeight - 100) {
      loadingRef.current = true // fix frequent loading
      setPage((page) => page + 1)
    }
  }

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: 'ease',
      debounceDelay: 50,
      throttleDelay: 100,
      offset: 50,
    })

    window.addEventListener('scroll', handleScroll, false)
    return () => window.removeEventListener('scroll', handleScroll, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="page">
      {issues.length === 0 ? (
        <Loading />
      ) : (
        <div className="fade">
          <div
            ref={maskRef}
            className={clsx(
              styles.mask,
              'pointer-events-none absolute top-0 left-0 w-full rounded transform transition-all ease-in-out duration-300',
            )}
            style={{
              height: `${maskHeight}px`,
              transform: `translateY(${maskTop}px)`,
            }}
          ></div>
          <div ref={listRef} className="relative space-y-4">
            {issues.map((issue) => {
              return (
                <article
                  key={issue.id}
                  className="cursor-pointer sm:px-4 py-4 tracking-wide"
                  data-aos="fade-left"
                  onMouseOver={handleMask}
                  onMouseEnter={handleMask}
                >
                  <div className="flex">
                    <h3 className="text-xl italic mr-2 mb-2">{issue.title}</h3>/
                    <span className="ml-2">{parseTime(issue.created_at)}</span>
                  </div>
                  <Markdown className={styles['inspiration-md']} content={issue.body} />
                </article>
              )
            })}
          </div>
          <Comment title="灵感" />
        </div>
      )}
    </div>
  )
}

export default Inspiration
