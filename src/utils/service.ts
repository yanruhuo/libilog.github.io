import AV from 'leancloud-storage'
import { Cloud, Issue, QueryParams, IssueLabel, Hot } from '@/type'
import config from '@/config'

const GITHUB_API = 'https://api.github.com/repos'
const CLOUD_API = 'https://service-05sqjlii-1306208233.gz.apigw.tencentcs.com/cloud'

const { username, repository, token } = config.github
const blog = `${GITHUB_API}/${username}/${repository}`
const access_token = `token ${token.join('')}`
const isDev = process.env.NODE_ENV === 'development'

const githubQuery = async <T>(api: string): Promise<T> => {
  try {
    const response = await fetch(api, {
      method: 'GET',
      headers: { Authorization: access_token },
    })
    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      const error = new Error(response.statusText)
      return Promise.reject(error)
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const queryIssues = async ({
  page = 1,
  pageSize = 10,
  state = 'open',
  filter = '',
}: QueryParams): Promise<Array<Issue>> => {
  const api = `${blog}/issues?state=${state}&page=${page}&per_page=${pageSize}${filter}`
  return githubQuery(api)
}

export const queryIssue = async (number: string): Promise<Issue> => {
  const api = `${blog}/issues/${number}?state=open`
  return githubQuery(api)
}

export const queryIssueByLabel = async (label: IssueLabel): Promise<Array<Issue>> => {
  const api = `${blog}/issues?state=closed&labels=${label}`
  return githubQuery(api)
}

export const queryArchive = async (page: number = 1): Promise<Array<Issue>> => queryIssues({ page, state: 'open' })

export const queryInspiration = async (page: number = 1): Promise<Array<Issue>> =>
  queryIssues({ page, state: 'closed', filter: '&labels=inspiration' })

export const queryCloud = async (): Promise<Cloud> => {
  try {
    const response = await fetch(CLOUD_API)
    if (response.ok) {
      const data: Cloud = await response.json()
      return data
    } else {
      const error = new Error(response.statusText)
      return Promise.reject(error)
    }
  } catch (error) {
    return Promise.reject(error)
  }
}

export const queryHot = async (ids: Array<number>): Promise<any> => {
  return new Promise((resolve) => {
    if (isDev) return resolve([])
    const query = new AV.Query('Counter')
    query.containedIn('id', ids)
    query
      .find()
      .then((res) => {
        const hot: Hot = {}
        res.forEach((o) => {
          const attributes = o.toJSON()
          hot[attributes['id']] = attributes['time']
        })
        resolve(hot)
      })
      .catch(console.error)
  }).catch(console.error)
}

export const increaseHot = (id: number, title: string): Promise<any> => {
  return new Promise((resolve) => {
    if (isDev) return resolve(1)
    const query = new AV.Query('Counter')
    const Counter = AV.Object.extend('Counter')
    query.equalTo('id', id)
    query
      .find()
      .then((res) => {
        if (res.length > 0) {
          // 已存在则返回热度
          const counter = res[0] as any
          counter
            .increment('time', 1)
            .save(null, { fetchWhenSave: true })
            .then((counter: { get: (arg0: string) => any }) => {
              const time = counter.get('time')
              resolve(time)
            })
            .catch(console.error)
        } else {
          // 不存在则新建
          const newcounter = new Counter()
          newcounter.set('title', title)
          newcounter.set('id', id)
          newcounter.set('time', 1)
          newcounter.set('site', window.location.href)
          newcounter
            .save()
            .then(() => resolve(1))
            .catch(console.error)
        }
      })
      .catch(console.error)
  }).catch(console.error)
}

export const visitorStatistics = async (referrer: string): Promise<void> => {
  return new Promise<void>((resolve) => {
    if (isDev) return resolve()
    const query = new AV.Query('Visitor')
    const Visitor = AV.Object.extend('Visitor')
    query.equalTo('referrer', referrer)
    query
      .first()
      .then((res) => {
        if (res) {
          res
            // @ts-ignore
            .increment('time', 1)
            .save(null, { fetchWhenSave: true })
            .then(resolve)
            .catch(console.error)
        } else {
          const newVisitor = new Visitor()
          newVisitor.set('referrer', referrer)
          newVisitor.set('time', 1)
          newVisitor
            .save()
            .then(() => resolve())
            .catch(console.error)
        }
      })
      .catch(console.error)
  }).catch(console.error)
}
