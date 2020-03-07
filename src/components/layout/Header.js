/* eslint-disable react/jsx-no-comment-textnodes */
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Header(props) {
  let url = 'http://localhost:3000';
  const [user, setUser] = useState({
    display_name: '',
    url: '',
    image: '',
    shouldSet: true
  });

  useEffect(() => {
    async function getUserInfo() {
      axios
        .get(`https://api.spotify.com/v1/me?access_token=${props.access_token}`)
        .then(result => {
          console.log(result);
          if (result)
            setUser({
              display_name: result.data.display_name,
              url: result.data.external_urls.spotify,
              image: result.data.images[0].url,
              shouldSet: false
            });
        });
    }
    if (props.access_token && user.shouldSet) getUserInfo();
  });

  return (
    <nav className="mb-1 navbar navbar-expand-lg navbar-dark secondary-color lighten-1">
      <a
        className="navbar-brand"
        href={`${url}?access_token=${props.access_token}&refresh_token=${props.refresh_token}`}
      >
        <i className="fab fa-spotify"></i>Spotify Lyrics Fetcher
      </a>
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#navbarSupportedContent-555"
        aria-controls="navbarSupportedContent-555"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      {user.display_name ? (
        <div
          className="collapse navbar-collapse"
          id="navbarSupportedContent-555"
        >
          <ul className="navbar-nav ml-auto nav-flex-icons">
            <li className="nav-item dropdown">
              <a
                className="p-0 nav-link dropdown-toggle"
                id="navbarDropdownMenuLink-55"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <img alt="" src={user.image} className="avatar"></img>
              </a>
              <div className="mt-2 dropdown-menu dropdown-menu-right dropdown-secondary">
                <p className="dropdown-item" href="#">
                  {user.display_name}
                </p>
                <p className="dropdown-item" href="#">
                  <a href={user.url}>Go to Spotify..</a>
                </p>
              </div>
            </li>
          </ul>
        </div>
      ) : (
        ''
      )}
    </nav>
  );
}
