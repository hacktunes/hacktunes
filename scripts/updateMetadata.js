/* eslint-disable no-console */

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
songInfos.forEach(songFilename => {
  const songParts = songFilename.split('/')
  const songKey = songParts[songParts.length - 2]
  const songInfo = require(songFilename)
  metaData.songs[songKey] = { songInfo, tracks: {} }

  const trackInfos = glob.sync(path.join(baseDir, 'songs', songKey, '*/package.json'))
  trackInfos.forEach(trackFilename => {
    const trackParts = trackFilename.split('/')
    const trackKey = trackParts[trackParts.length - 2]
    const trackInfo = require(trackFilename)
    const authorEmail = trackInfo.author && trackInfo.author.email
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

    metaData.songs[songKey].tracks[trackKey] = trackInfo
  })
})

const metaDataPath = path.join(metaDir, 'data.json')
fs.writeFileSync(metaDataPath, JSON.stringify(metaData))
