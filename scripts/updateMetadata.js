import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import https from 'https'
import glob from 'glob'

const baseDir = path.join(__dirname, '..')

const metaDir = path.join(baseDir, 'meta')
if (!fs.existsSync(metaDir)) {
  fs.mkdirSync(metaDir)
}

const avatarDir = path.join(metaDir, 'avatar')
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir)
}

const metaData = require(path.join(baseDir, 'songs/info.json'))

metaData.songs = metaData.songs || {}

const songInfos = glob.sync(path.join(baseDir, 'songs', '*/song.json'))
songInfos.forEach(filename => {
  const parts = filename.split('/')
  const songKey = parts[parts.length - 2]
  const info = require(filename)
  metaData.songs[songKey] = {info, tracks: {}}

  const trackInfos = glob.sync(path.join(baseDir, 'songs', songKey, '*/package.json'))
  trackInfos.forEach(filename => {
    const parts = filename.split('/')
    const trackKey = parts[parts.length - 2]
    const info = require(filename)
    const authorEmail = info.author && info.author.email
    if (!authorEmail) {
      return
    }
    const avatarPath = path.join(avatarDir, authorEmail + '.png')
    if (!fs.existsSync(avatarPath)) {
      const emailHash = crypto.createHash('md5').update(authorEmail.toLowerCase()).digest('hex')
      const avatarFile = fs.createWriteStream(avatarPath)
      const avatarURL = 'https://secure.gravatar.com/avatar/' + emailHash + '?s=128'
      console.log('fetching', avatarURL)
      https.get(avatarURL, response => response.pipe(avatarFile))
    }

    metaData.songs[songKey].tracks[trackKey] = info
  })
})

const metaDataPath = path.join(metaDir, 'data.json')
fs.writeFileSync(metaDataPath, JSON.stringify(metaData))
