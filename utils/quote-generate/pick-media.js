// utils/quote-generate/pick-media.js
//
// Shared media selection for the main bubble and the reply preview.
//
// `media` arrives either as a single object or as an array of files. Both call
// sites must agree on two things: which entry to use, and which dialect to read
// off it. base64 comes first — it is already in hand, while a file_id costs a
// Bot API round-trip and only resolves for files our own token can see.

function pickMediaSource (media, crop) {
  if (!Array.isArray(media)) return media
  if (media.length > 1) return crop ? media[1] : media[media.length - 1]
  return media[0]
}

function mediaDialect (source) {
  if (source && source.base64) return { type: 'base64', value: source.base64 }
  if (source && source.url) return { type: 'url', value: source.url }
  return { type: 'id', value: source }
}

function mediaFileId (source) {
  if (!source) return null
  if (typeof source === 'string') return source
  return source.fileId || source.file_id || null
}

module.exports = { pickMediaSource, mediaDialect, mediaFileId }
