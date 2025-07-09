/// <reference types="vite/client" />

// 為 stats-js 添加模組聲明
declare module 'stats-js/build/stats.js' {
  export default class Stats {
    constructor()
    begin(): void
    end(): void
    update(): void
    setMode(mode: number): void
    dom: HTMLElement
  }
}
