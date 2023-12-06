export type Data = SuccessData | ErrorData

export interface SuccessData {
  status: number
  headerTime: number
  bodyTime: number
  totalTime: number
  coldStart: boolean
  headers: Array<[string, string]>
  url: string
}

export interface ErrorData {
  error: string
}
