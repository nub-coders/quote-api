// Self-check for media selection precedence. Run: node test-pick-media.js
//
// Regression: array-form media ignored inline base64 entirely — the old code
// tested `message.media.base64` on the array itself (always undefined), so
// `[{base64}]` fell through to the file_id branch and rendered nothing.

const assert = require('assert')
const { pickMediaSource, mediaDialect, mediaFileId } = require('./utils/quote-generate/pick-media')

const B = 'aGVsbG8='

// base64 wins over file_id, object form
assert.deepStrictEqual(mediaDialect({ base64: B, file_id: 'F' }), { type: 'base64', value: B })
// ...and array form (the bug)
assert.deepStrictEqual(mediaDialect(pickMediaSource([{ base64: B, file_id: 'F' }], false)),
  { type: 'base64', value: B })
assert.deepStrictEqual(mediaDialect(pickMediaSource({ base64: B }, false)), { type: 'base64', value: B })

// base64 also beats url
assert.strictEqual(mediaDialect({ base64: B, url: 'http://x' }).type, 'base64')
// url still beats file_id when no base64
assert.deepStrictEqual(mediaDialect({ url: 'http://x', file_id: 'F' }), { type: 'url', value: 'http://x' })
// file_id when it is all we have
assert.deepStrictEqual(mediaDialect(pickMediaSource([{ file_id: 'F' }], false)),
  { type: 'id', value: { file_id: 'F' } })

// entry selection: last file, or the second when cropping
assert.deepStrictEqual(pickMediaSource([{ id: 1 }, { id: 2 }, { id: 3 }], false), { id: 3 })
assert.deepStrictEqual(pickMediaSource([{ id: 1 }, { id: 2 }, { id: 3 }], true), { id: 2 })
assert.deepStrictEqual(pickMediaSource([{ id: 1 }], true), { id: 1 })

// input must not be mutated (a payload is reshaped once per retry)
const arr = [{ id: 1 }, { id: 2 }]
pickMediaSource(arr, false)
assert.strictEqual(arr.length, 2, 'pickMediaSource must not mutate its input')

// file id extraction, including the bare-string form
assert.strictEqual(mediaFileId('RAW'), 'RAW')
assert.strictEqual(mediaFileId({ file_id: 'F' }), 'F')
assert.strictEqual(mediaFileId({ fileId: 'F' }), 'F')
assert.strictEqual(mediaFileId(undefined), null)
assert.strictEqual(mediaFileId({}), null)

// empty / missing media must not throw
assert.deepStrictEqual(mediaDialect(pickMediaSource([], false)), { type: 'id', value: undefined })
assert.deepStrictEqual(mediaDialect(pickMediaSource(undefined, false)), { type: 'id', value: undefined })

console.log('pick-media: all assertions passed')
