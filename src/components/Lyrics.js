import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Lyrics(props) {
  // let backened = 'https://spotify-app-1.herokuapp.com';
  let backened = 'http://localhost:8888';

  const [lyrics, setLyrics] = useState(['Loading...']);

  useEffect(() => {
    let song = props.songName;
    if (song && song.indexOf('/') >= 0) song = song.replace('/', ' ').trim();

    async function getLyrics() {
      if (props.songChange) {
        await axios
          .get(`${backened}/${props.artistName}/${song}`)
          .then(res => {
            let lyrics = res.data.lyrics;
            setLyrics(lyrics);
          })
          .catch(e => console.error(e));
      }
    }
    getLyrics();
  });

  return (
    <div className="p-4 text-center col-6">
      <h1 className="mb-4">
        {props.artistName !== 'None' ? props.artistName + "'s" : ''} Lyrics
      </h1>
      {lyrics.map((line, index) => {
        if (line.length > 0) return <p key={index}>{line}</p>;
        else return <br key={index}></br>;
      })}
    </div>
  );
}

export default Lyrics;
