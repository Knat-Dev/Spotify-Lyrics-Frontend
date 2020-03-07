import React, { Component, Fragment } from 'react';
import axios from 'axios';
import '../App.css';
import querystring from 'query-string';
import Lyrics from './Lyrics';
import Header from './layout/Header';
// let backened = 'https://spotify-app-1.herokuapp.com';
let backened = 'http://localhost:8888';
let frontend = 'http://localhost:3000';
// let frontend = 'https://spotify-lyrics-83aca.firebaseapp.com';

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
        songChange: false,
        showTimeLeft: true
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
            `${backened}/refresh_token?refresh_token=${this.state.refresh_token}`
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
              <a href={`${frontend}/login`}>
                <button className="button-class grow">
                  Login With Spotify
                </button>
              </a>
            </div>
          ) : (
            <Fragment>
              <div className="col-12">
                <h1>Currently Playing:</h1>

                <p className="text-muted">
                  {' - '}Song Name: {this.state.currently.song}
                </p>
                <p className="text-muted">
                  {' - '}Artist Name: {this.state.currently.artist}
                </p>
                <p
                  className="text-muted"
                  onClick={() => {
                    this.setState({
                      ...this.state,
                      currently: {
                        ...this.state.currently,
                        showTimeLeft: !this.state.currently.showTimeLeft
                      }
                    });
                  }}
                >
                  {' - '}Currently:{' '}
                  {this.state.currently.showTimeLeft
                    ? this.printTime(this.state.currently.time_left)
                    : this.printTime(this.state.currently.current_time) +
                      '/' +
                      this.printTime(this.state.currently.duration)}
                </p>
              </div>
              <div className="row align-items-start justify-content-center">
                <div className="col-lg-6 col-sm-8">
                  <img
                    className="img-fluid"
                    src={this.state.currently.image}
                    alt=""
                  />
                  <h3 className="mb-5 text-center text-muted">
                    {this.state.currently.song !== 'None'
                      ? this.state.currently.song +
                        ' - ' +
                        this.state.currently.artist
                      : ''}
                  </h3>
                </div>
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
