import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';
import { Jumbotron, Button } from 'reactstrap';
import * as d3 from "d3";

const spotifyApi = new SpotifyWebApi({clientId : 'cc4b59d921b646e2a2a55fe4c409e8ab', clientSecret : '0568ba6224d846acaa1969dd646f25f1'});

class App extends Component {
  constructor(){
    super();
  const params = this.getHashParams();
  const token = params.access_token;
  this.nextSongo = this.nextSongo.bind(this);
  console.log(params)

  if (token) {
    spotifyApi.setAccessToken(token);
  }
  this.state = {
    loggedIn: token ? true : false,
    nowPlaying: { name: '', albumArt: '' }
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

  async getNowPlaying(){
    const response = await spotifyApi.getMyCurrentPlaybackState();
    this.setState({
      nowPlaying: {
        name: response.item.name,
        albumArt: response.item.album.images[0].url
        }
      }); 
  }

  printToken(){
    console.log(this.token)
  }

  nextSongo(){
    spotifyApi.skipToNext()
      .then((response) => (
        this.getNowPlaying()
      ));
  }

  pauseSongo(){
    spotifyApi.pause()
      .then((response) => (
        this.getNowPlaying()
      ));
  }

  prevSongo(){
    spotifyApi.skipToPrevious()
      .then((response) => (
        this.getNowPlaying()
      ));
  }

  render() {
    this.getNowPlaying()
    return (
      <div className="App">
      <Jumbotron>
    <h1 className="display-3">
    {!this.state.loggedIn && <a href='http://localhost:8888' > Login to Spotify </a>}
    {this.state.loggedIn && <h1> WELCOME! </h1>}

    </h1>
    <p className="lead">Listen to music with your friends.</p>
    <hr className="my-2" />
    <p>      <div>
            <img src={this.state.nowPlaying.albumArt} style={{ height: 150 }}/>
          </div>

          <div>
            Now Playing: { this.state.nowPlaying.name }
          </div>
          </p>
    <p className="lead">
    <div> { this.state.loggedIn &&
      <Button outline color="primary" onClick={() => {this.nextSongo(); this.getNowPlaying();}}>
        Previous Song
      </Button>
    }
    { this.state.loggedIn &&
      <Button outline color="primary" onClick={() => {this.pauseSongo(); this.getNowPlaying();}}>
        ❚❚
      </Button>
    }{ this.state.loggedIn &&
      <Button outline color="primary" onClick={() => {this.nextSongo(); this.getNowPlaying();}}>
        Next Song
      </Button>
    }</div>
   
    { this.state.loggedIn &&
      <Button outline color="primary" onClick={() => this.getNowPlaying()}>
        Now Playing
      </Button>
    }

  </p>
  </Jumbotron>
    </div>
  );
}
}

export default App;
