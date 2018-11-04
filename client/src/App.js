import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import SpotifyWebApi from 'spotify-web-api-js';
import { Jumbotron, Button, Media, Col, Container, Row } from 'reactstrap';
import Streamgraph from './components/StreamGraph.js'

const spotifyApi = new SpotifyWebApi({clientId : 'cc4b59d921b646e2a2a55fe4c409e8ab', clientSecret : '0568ba6224d846acaa1969dd646f25f1'});

class App extends Component {
  constructor(){
    super();
  const params = this.getHashParams();
  const token = params.access_token;
  this.nextSongo = this.nextSongo.bind(this);
  this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  this.setNextSongFalse = this.setNextSongFalse.bind(this);

  if (token) {
    spotifyApi.setAccessToken(token);
  }
  this.state = {
    width : 0,
    height : 0,
    isPlaying: false,
    nextSong: false,
    loggedIn: token ? true : false,
    nowPlaying: { name: '', albumArt: '', songId: ''},
    attributes: {energy: '', loudness: '', majmin: '', tempo : '', happiness : ''}
  }
}

  setNextSongFalse() {
    this.setState({nextSong: false});
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
              albumArt: response.item.album.images[0].url,
              songId : response.item.id
            }
        }, this.getAudioFeatures(this.state.nowPlaying.songId));
      })
  }

  getAudioFeatures(song) {
    spotifyApi.getAudioFeaturesForTrack(song)
      .then((response) => {
        this.setState({
          attributes: {
              energy: response.energy,
              loudness: response.loudness,
              majmin: response.mode,
              tempo: response.tempo,
              happiness: response.valence
          }
        });
      })
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  printToken(){
    console.log(this.token)
  }

  nextSongo(){
    spotifyApi.skipToNext()
    this.setState({nextSong: true, isPlaying: true});
    setTimeout(() => this.getNowPlaying(), 1000)
  }

  pauseSongo(){
    spotifyApi.pause()
    this.setState({
      isPlaying: false
    })
  }
  playSongo(){
    spotifyApi.play()
    this.setState({
      isPlaying: true
    }, console.log(this.state))
  }
  prevSongo(){
    spotifyApi.skipToPrevious()
    setTimeout(() => this.getNowPlaying(), 1000)
  }


  render() {
    return (
      <div className="App">
      <Jumbotron>
    <h1 >
    {!this.state.loggedIn && <a href='http://localhost:8888' > Login to Spotify </a>}
    {this.state.loggedIn && <h1> MoodBox </h1>}

    </h1>
    <p className="lead">See what you hear.</p>
    <div> { this.state.loggedIn &&
      <Button outline color="primary" onClick={() => {this.nextSongo(); this.getNowPlaying();}}>
        Previous Song
      </Button>
    }

    { this.state.loggedIn && this.state.isPlaying &&
      <Button outline color="primary" onClick={() => {this.pauseSongo(); this.getNowPlaying();}}>
        ❚❚
      </Button>
    }
    { this.state.loggedIn && !this.state.isPlaying &&
      <Button outline color="primary" onClick={() => {this.playSongo(); this.getNowPlaying();}}>
        ►
      </Button>
    }

    { this.state.loggedIn &&
      <Button outline color="primary" onClick={() => {this.nextSongo(); this.getNowPlaying();}}>
        Next Song
      </Button>
    }</div>

    <hr className="my-2" />

    {this.state.loggedIn && <Streamgraph
      width = {this.state.width * 0.9}
      height = {this.state.height * .8}
      majorMinor = {!!this.state.attributes.majmin}
      happy = {this.state.attributes.happiness > 0.5 ? 1 : 0}
      nextSong = {this.state.nextSong}
      setNextSong = {this.setNextSongFalse}
    />}

    <br/>
    <p>

          {this.state.loggedIn && this.state.nowPlaying.name && <div>
            Now Playing: { this.state.nowPlaying.name }
          </div>}
          { this.state.loggedIn &&
            <Button outline color="primary" onClick={() => this.getNowPlaying()}>
              Now Playing
            </Button>
          }
          </p>
    <p className="lead">

  </p>
  </Jumbotron>
    </div>
  );
}
}

export default App;
