import { Artist } from '@/types/artist';

export const artists: Artist[] = [
  {
    id: 1,
    name: 'The Midnight',
    image: 'https://f4.bcbits.com/img/0017910770_10.jpg',
    bio: 'The Midnight is an American electronic music duo formed in 2012 in Los Angeles, California. Their music is influenced by 1980s culture, video games, and films.',
    genres: ['Synthwave', 'Electronic', 'Rock'],
    country: 'USA',
    social: {
      spotify: 'https://open.spotify.com/artist/2NFrAuh8RQdQoS7iYFbckw',
      instagram: 'https://instagram.com/themidnightofficial',
      facebook: 'https://facebook.com/TheMidnightOfficial',
      twitter: 'https://twitter.com/TheMidnightLA'
    },
    releases: [1, 4, 7, 15, 18]
  },
  {
    id: 2,
    name: 'Tycho',
    image: 'https://media.pitchfork.com/photos/5929a7d7ea9e61561daa56a6/1:1/w_600/178c4698.jpg',
    bio: 'Tycho is an American ambient music project led by Scott Hansen as primary composer, songwriter and producer.',
    genres: ['Ambient', 'Electronic', 'Downtempo'],
    country: 'USA',
    social: {
      spotify: 'https://open.spotify.com/artist/5oOhM2DFWab8XhSdQiITry',
      instagram: 'https://instagram.com/tychomusic',
      twitter: 'https://twitter.com/tychomusic'
    },
    releases: [2, 5, 8, 16]
  },
  {
    id: 3,
    name: 'Bonobo',
    image: 'https://f4.bcbits.com/img/0025425243_10.jpg',
    bio: 'Bonobo is the stage name of British musician, producer and DJ Simon Green. His music ranges from trip hop to ambient to electronic.',
    genres: ['Electronic', 'Downtempo', 'Trip Hop'],
    country: 'UK',
    social: {
      spotify: 'https://open.spotify.com/artist/0cmWgDlu9CwTgxPhf403hb',
      instagram: 'https://instagram.com/si_bonobo',
      facebook: 'https://facebook.com/bonobomusic',
      twitter: 'https://twitter.com/sibonobo'
    },
    releases: [3, 6, 9, 17]
  },
  {
    id: 4,
    name: 'Ludovico Einaudi',
    image: 'https://www.classical-music.com/wp-content/uploads/2020/10/Ludovico-Einaudi-scaled.jpg',
    bio: 'Ludovico Einaudi is an Italian pianist and composer. His music is ambient, meditative, and often minimalist, incorporating elements of classical, pop, rock, and folk music.',
    genres: ['Classical', 'Contemporary', 'Minimal'],
    country: 'Italy',
    social: {
      spotify: 'https://open.spotify.com/artist/2uFUBdaVGtyMqckSeCl0Qj',
      instagram: 'https://instagram.com/ludovicoeinaudi',
      facebook: 'https://facebook.com/ludovicoeinaudi'
    },
    releases: [10, 11, 12, 13, 14, 19]
  }
]; 