import React, { useState, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";

const PlayAudio = ({ idx, mp3, playing, setPlaying, previewDuration = 30 }) => {
    const [id, setId] = useState("");
    const [progress, setProgress] = useState(0);
    const [loadError, setLoadError] = useState(false);
    const progressInterval = useRef(null);
    const [sound] = useState(
        new Howl({
            src: [mp3],
            format: ["mp3"],
            loop: false,
            volume: 0.1,
            html5: true,
            onload: function() {
                console.log('Audio loaded:', mp3);
                setLoadError(false);
            },
            onloaderror: function(id, error) {
                console.error('Failed to load audio:', error, 'URL:', mp3);
                setLoadError(true);
                setPlaying({});
            },
            onplayerror: function(id, error) {
                console.error('Failed to play audio:', error, 'URL:', mp3);
                setLoadError(true);
                setPlaying({});
            },
            onend: function() {
                setPlaying({});
                setProgress(0);
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
            }
        })
    );

    useEffect(() => {
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            sound.unload();
        };
    }, [sound]);

    const handlePlay = () => {
        if (Object.values(playing).includes(true)) {
            Howler.stop();
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        }
        setPlaying({ [idx]: true });
        setProgress(0);
        const playId = sound.play();
        setId(playId);

        // Auto-stop after preview duration
        const startTime = Date.now();
        const duration = previewDuration * 1000;

        progressInterval.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (elapsed >= duration) {
                sound.stop();
                setPlaying({});
                setProgress(0);
                clearInterval(progressInterval.current);
            }
        }, 100);
    };

    const handlePause = (id) => {
        setPlaying({});
        sound.pause(id);
        setProgress(0);
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
    };

    // Don't render button if mp3 is null or if there was a load error
    if (!mp3 || loadError) {
        return (
            <Box style={{ width: "100%" }}>
                <Button
                    disabled
                    variant="outlined"
                    style={{ width: "100%", opacity: 0.5 }}
                >
                    No preview
                </Button>
            </Box>
        );
    }

    return (
        <Box style={{ width: "100%" }}>
            {!playing[idx] && (
                <Button
                    onClick={handlePlay}
                    variant="outlined"
                    color="primary"
                    style={{ width: "100%" }}
                >
                    play
                </Button>
            )}
            {playing[idx] && (
                <>
                    <Button
                        onClick={() => handlePause(id)}
                        variant="outlined"
                        color="primary"
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                    >
                        pause
                    </Button>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        style={{ height: "6px", borderRadius: "3px" }}
                    />
                </>
            )}
        </Box>
    );
};

export default PlayAudio;
