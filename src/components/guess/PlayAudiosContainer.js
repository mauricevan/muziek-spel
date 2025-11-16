import React, { useState } from "react";
import PlayAudio from "./PlayAudio";
import Box from "@material-ui/core/Box";

const PlayAudiosContainer = ({ songs, previewDuration = 30 }) => {
    const [playing, setPlaying] = useState({ 0: false, 1: false, 2: false });

    return (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          style={{gap: "1rem"}}
        >
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
        </Box>
    );
};

export default PlayAudiosContainer;
