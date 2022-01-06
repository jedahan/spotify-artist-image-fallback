import fetch from 'node-fetch'

const id = process.argv[2]
if (!id) throw new Error('missing spotify artist id, add to args')

const spotifyClientId = process.env.SPOTIFY_CLIENT_ID
const spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET
if (!(spotifyClientId?.length && spotifyClientSecret?.length)) throw new Error('missing creds')


const basicToken = Buffer
  .from(`${spotifyClientId}:${spotifyClientSecret}`)
  .toString('base64')

let token: string = ''

interface Token { access_token: string }
const isToken = (response: any): response is Token => "access_token" in response
interface Artist { images: { url: string }[] }
const isArtist = (response: any): response is Artist => "images" in response

const artistImageFallback = async (id: string) => {
  if (!token) token = await getToken()

  const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })

  const json = await response.json()

  if (isArtist(json)) return json.images[0].url
}

const getToken = async () => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    headers: {
      Authorization: `Basic ${basicToken}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    body: 'grant_type=client_credentials',
  })

  const json = await response.json()

  if (isToken(json)) return json.access_token

  return ''
}


artistImageFallback(id).then(url => console.log(url))