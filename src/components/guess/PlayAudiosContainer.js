import React, { useState } from "react";
import PlayAudio from "./PlayAudio";

const PlayAudiosContainer = ({ songs, previewDuration = 30 }) => {
    const [playing, setPlaying] = useState({ 0: false, 1: false, 2: false });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {songs.map((song, idx) => (
                song && (
                    <PlayAudio
                        key={idx}
                        idx={idx}
                        mp3={song.preview_url}
                        playing={playing}
                        setPlaying={setPlaying}
                        previewDuration={previewDuration}
                    />
                )
            ))}
        </div>
    );
};

export default PlayAudiosContainer;
