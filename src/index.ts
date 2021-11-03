'use strict'
import chokidar from 'chokidar'
import { createWorker } from 'tesseract.js'
import io from 'socket.io-client'
const socket = io('http://localhost:7000')
const watcher = chokidar.watch('./', {
  ignored: /[\/\\]\./,
  persistent: true,
})

//イベント定義
socket.on('connect', () => {
  console.log(`connect`)
  watcher.on('ready', async () => {
    //スタンバイ状態
    console.log('ready watching...')

    //ファイルを追加したとき
    watcher.on('add', async (path: string) => {
      console.log('added: ' + path)
      const worker = createWorker({
        logger: (m: any) => {},
      })
      await worker.load()
      await worker.loadLanguage('eng')
      await worker.initialize('eng')
      const {
        data: { text },
      } = await worker.recognize(path)

      // 不要な改行を削除
      const trimed = text.replace(/([^\.;:>!{])\r?\n/g, '$1')
      console.log(' socket.emit: ' + path)
      socket.emit('message', trimed)
    })

    //ファイルの編集
    watcher.on('change', (path: string) => {
      // console.log(path + ' changed.')
    })
  })
})
