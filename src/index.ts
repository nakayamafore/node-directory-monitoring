'use strict'
const chokidar = require('chokidar')
import { createWorker } from 'tesseract.js'

const watcher = chokidar.watch('./', {
  ignored: /[\/\\]\./,
  persistent: true,
})
const worker = createWorker({
  logger: (m: any) => console.log(m),
})
//イベント定義
watcher.on('ready', async () => {
  //スタンバイ状態
  console.log('ready watching...')

  //ファイルを追加したとき
  watcher.on('add', async (path: string) => {
    console.log(path + ' added.')
    await worker.load()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    const {
      data: { text },
    } = await worker.recognize(path)
    console.log(text)
  })

  //ファイルの編集
  watcher.on('change', (path: string) => {
    console.log(path + ' changed.')
  })
})
