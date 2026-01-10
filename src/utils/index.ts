import type { MaybePromise } from "@shared/type.util"
import { $fetch } from "ofetch"
import { Capacitor } from "@capacitor/core"

export function safeParseString(str: any) {
  try {
    return JSON.parse(str)
  } catch {
    return ""
  }
}

export class Timer {
  private timerId?: any
  private start!: number
  private remaining: number
  private callback: () => MaybePromise<void>

  constructor(callback: () => MaybePromise<void>, delay: number) {
    this.callback = callback
    this.remaining = delay
    this.resume()
  }

  pause() {
    clearTimeout(this.timerId)
    this.remaining -= Date.now() - this.start
  }

  resume() {
    this.start = Date.now()
    clearTimeout(this.timerId)
    this.timerId = setTimeout(this.callback, this.remaining)
  }

  clear() {
    clearTimeout(this.timerId)
  }
}

// 在 Capacitor (Android/iOS) 环境下使用远程 API，否则使用相对路径
// 注意：调用 myFetch 时已包含 /api 前缀，所以这里只需配置服务器根地址
const isNative = Capacitor.isNativePlatform()
const apiBaseURL = isNative ? "https://news.hxh.world" : ""

export const myFetch = $fetch.create({
  timeout: 15000,
  retry: 0,
  baseURL: apiBaseURL,
})

export function isiOS() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod",
  ].includes(navigator.platform)
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}
