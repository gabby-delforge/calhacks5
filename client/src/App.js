import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi({clientId : 'cc4b59d921b646e2a2a55fe4c409e8ab', clientSecret : '0568ba6224d846acaa1969dd646f25f1'});

class App extends Component {
  constructor(){
    super();
  const params = this.getHashParams();
  const token = params.access_token;
  console.log(params)

  if (token) {
    spotifyApi.setAccessToken(token);
  }
  this.state = {
    loggedIn: token ? true : false,
    nowPlaying: { name: 'Not Checked', albumArt: '' }
  }
}

  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }

  getNowPlaying(){
    spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        this.setState({
          nowPlaying: { 
              name: response.item.name, 
              albumArt: response.item.album.images[0].url
            }
        });
      })
  }

  printToken(){
    console.log(this.token)
  }

  nextSongo(){
      spotifyApi.skipToNext()
  }

  render() {
  return (
    <div className="App">
      <a href='http://localhost:8888' > Login to Spotify </a>
      <div>
        Now Playing: { this.state.nowPlaying.name }
      </div>
      <div>
        <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
      </div>

      { this.state.loggedIn &&
        <button onClick={() => this.getNowPlaying()}>
          Check Now Playing
        </button>
      }
      { this.state.loggedIn &&
        <button onClick={this.nextSongo}>
          Next Song
        </button>
      }

    </div>
  );
}
}

export default App;
