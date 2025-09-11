import { PreloadEvent } from './constant'

export type BasePreloadEventData = {
  payload: PreloadEvent
}
export type PreloadEventData<T = BasePreloadEventData> = {
  data: T
}
