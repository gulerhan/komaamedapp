export type SpotifyTrack = {
  id: string;
  title: string;
  album: string;
  cover: string;
};

export const spotifyArtistId = '7JSWeBX8NSPIy0bbNnp9Gc';

export const spotifyTracks: SpotifyTrack[] = [
  {
    id: '7rh3vXWGnVHtJf3BQLjFQL',
    title: 'Hoy Memo',
    album: 'Dergûş',
    cover: '/albums/dergus.jpg',
  },
  {
    id: '3ofwKL3ekRfPkpuZjfooq1',
    title: 'Çume Cızire',
    album: 'Dergûş',
    cover: '/albums/dergus.jpg',
  },
  {
    id: '6e4CXk0ifN5htO4vbz1VlK',
    title: 'Tesi',
    album: 'Dergûş',
    cover: '/albums/dergus.jpg',
  },
  {
    id: '0CmACsAwXsiqdCxhuwoB77',
    title: 'Amedîye',
    album: 'Dergûş',
    cover: '/albums/dergus.jpg',
  },
  {
    id: '5LSCVWiTH3ffBX9kZ5o2g1',
    title: 'Zerde',
    album: 'Dergûş',
    cover: '/albums/dergus.jpg',
  },
  {
    id: '6KNVB227n1rTMcIaMfszVX',
    title: 'Hay Nık Na',
    album: 'Dergûş',
    cover: '/albums/dergus.jpg',
  },
  {
    id: '7BcaxlTKQ9f3hI8iJhAznO',
    title: 'Kulîlka Azadî',
    album: 'Kulîlka Azadî',
    cover: '/albums/kulilka-azadi.jpg',
  },
  {
    id: '02F201aI36p9lEWaUiuG8P',
    title: 'Helîm Can',
    album: 'Agir û Mirov',
    cover: '/albums/agir-u-mirov.jpg',
  },
  {
    id: '1qPGZIniVz64yr8TRBrdhw',
    title: 'Îro Dîsa',
    album: 'Agir û Mirov',
    cover: '/albums/agir-u-mirov.jpg',
  },
  {
    id: '2AXThYanZqnNzdgTV0oWwC',
    title: 'Barane',
    album: 'Agir û Mirov',
    cover: '/albums/agir-u-mirov.jpg',
  },
  {
    id: '164xhoFu6oVCIYk1LUHgCW',
    title: 'Çıyayên Me',
    album: 'Agir û Mirov',
    cover: '/albums/agir-u-mirov.jpg',
  },
  {
    id: '1JEGggRcW1lREzQLlbm3s5',
    title: 'Destana Sılopi',
    album: 'Kulîlka Azadî',
    cover: '/albums/kulilka-azadi.jpg',
  },
];

export function spotifyTrackUri(id: string) {
  return `spotify:track:${id}`;
}

export function spotifyTrackUrl(id: string) {
  return `https://open.spotify.com/track/${id}`;
}
