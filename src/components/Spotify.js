import React, { Component, Fragment } from 'react';
import axios from 'axios';
import '../App.css';
import querystring from 'query-string';
import Lyrics from './Lyrics';
import Header from './layout/Header';
export class Spotify extends Component {
  constructor(props) {
    super(props);

    this.state = {
      refresh_token: '',
      expires_in: 0,
      access_token: '',
      currently: {
        song: 'None',
        artist: 'None',
        image: '',
        duration: 0,
        time_left: 0,
        current_time: 0,
        lyrics: [],
        songChange: false
      }
    };
  }

  componentDidMount() {
    const params = querystring.parse(window.location.search);
    let access_token = params.access_token;
    let refresh_token = params.refresh_token;
    let expires_in = params.expires_in;
    this.setState({
      access_token: access_token,
      refresh_token: refresh_token,
      expires_in: parseInt(expires_in)
    });
    if (this.state.access_token) this.setArtistAndSong(access_token);

    const interval = setInterval(() => {
      if (this.state.access_token)
        this.setArtistAndSong(this.state.access_token);
    }, 1000);
    const refreshToken = setInterval(() => {
      if (this.state.refresh_token)
        axios
          .get(
            `http://localhost:8888/refresh_token?refresh_token=${this.state.refresh_token}`
          )
          .then(res => {
            console.log(res);
            this.setState({
              access_token: res.data
                ? res.data.access_token
                : this.state.access_token
            });
          });
    }, 3600 * 1000);
    return () => {
      clearInterval(interval);
      clearInterval(refreshToken);
    };
  }

  async setArtistAndSong(access_token) {
    let prevSong = this.state.currently.song;
    await axios
      .get(`https://api.spotify.com/v1/me/player?access_token=${access_token}`)
      .then(res => {
        if (res && res.status === 204) {
          // Not listening
          this.setState({ song: 'None', artist: 'None' });
        } else if (res && res.status === 200) {
          // console.log(res.data);
          this.setState({
            ...this.state,
            currently: {
              ...this.state.currently,
              songChange: prevSong !== res.data.item.name ? true : false,
              song: res.data.item.name,
              artist: res.data.item.artists[0].name,
              image: res.data.item.album.images[0].url,
              duration: res.data.item.duration_ms,
              current_time: res.data.progress_ms,
              time_left: res.data.item.duration_ms - res.data.progress_ms
            }
          });
        }
      })
      .catch(e => console.error(e));
    this.printTime(this.state.time_left);
    console.log(
      'Polling... ' +
        this.state.currently.artist +
        ' - ' +
        this.state.currently.song
    );
  }

  printTime(t) {
    let time = t;
    let minutes = Math.floor(time / 60000);
    let seconds = ((time % 60000) / 1000).toFixed(0);
    let fMinutes = minutes > 9 ? minutes : '0' + minutes;
    let fSeconds = seconds > 9 ? seconds : '0' + seconds;
    return fMinutes + ':' + fSeconds;
  }

  render() {
    return (
      <div>
        <Header
          access_token={this.state.access_token}
          refresh_token={this.state.refresh_token}
        />

        <div className="h-100 container">
          {!this.state.access_token ? (
            <div className="row justify-content-center h-100 align-items-center">
              <a href="http://localhost:8888/login">
                <button className="button-class grow">
                  Login With Spotify
                </button>
              </a>
            </div>
          ) : (
            <Fragment>
              <div className="col-12">
                <h1>Currently Playing:</h1>

                <p>Song Name: {this.state.currently.song}</p>
                <p>Artist Name: {this.state.currently.artist}</p>
                <p>
                  Current: {this.printTime(this.state.currently.current_time)} /{' '}
                  {this.printTime(this.state.currently.duration)} /{' '}
                  {this.printTime(this.state.currently.time_left)}
                </p>
              </div>
              <div className="row align-items-start">
                <img
                  className="col-6 img-fluid p-4"
                  src={this.state.currently.image}
                  alt=""
                />
                <Lyrics
                  songChange={this.state.currently.songChange}
                  songName={this.state.currently.song}
                  artistName={this.state.currently.artist}
                />
              </div>
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}

export default Spotify;
