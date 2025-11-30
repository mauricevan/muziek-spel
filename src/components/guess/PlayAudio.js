import React, { useState, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

const PlayAudio = ({ idx, mp3, playing, setPlaying, previewDuration = 30 }) => {
    const [id, setId] = useState("");
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef(null);
    const soundRef = useRef(null);
    const mp3Ref = useRef(mp3);
    
    // Check if mp3 is valid
    const isValidAudio = mp3 && typeof mp3 === 'string' && mp3.trim() !== '';

    // Create or update Howl instance when mp3 changes
    useEffect(() => {
        // Clean up previous sound if mp3 changed
        if (soundRef.current && mp3Ref.current !== mp3) {
            soundRef.current.unload();
            soundRef.current = null;
        }

        // Create new sound if needed
        if (!soundRef.current && mp3) {
            // Validate that mp3 is a valid URL string
            if (!mp3 || typeof mp3 !== 'string' || mp3.trim() === '') {
                console.warn('Invalid or empty audio URL provided');
                return;
            }
            
            mp3Ref.current = mp3;
            soundRef.current = new Howl({
                src: [mp3],
                format: ["mp3"],
                loop: false,
                volume: 0.1,
                html5: true,
                onload: function() {
                    console.log('Audio loaded:', mp3);
                },
                onloaderror: function(id, error) {
                    console.error('Failed to load audio:', error, 'URL:', mp3);
                    setPlaying({});
                },
                onend: function() {
                    setPlaying({});
                    setProgress(0);
                    if (progressInterval.current) {
                        clearInterval(progressInterval.current);
                    }
                }
            });
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            if (soundRef.current) {
                soundRef.current.unload();
                soundRef.current = null;
            }
        };
    }, [mp3, setPlaying]);

    const handlePlay = () => {
        if (!soundRef.current) return;
        
        if (Object.values(playing).includes(true)) {
            Howler.stop();
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        }
        setPlaying({ [idx]: true });
        setProgress(0);
        const playId = soundRef.current.play();
        setId(playId);

        // Auto-stop after preview duration
        const startTime = Date.now();
        const duration = previewDuration * 1000;

        progressInterval.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (elapsed >= duration) {
                soundRef.current.stop();
                setPlaying({});
                setProgress(0);
                clearInterval(progressInterval.current);
            }
        }, 100);
    };

    const handlePause = (id) => {
        if (!soundRef.current) return;
        
        setPlaying({});
        soundRef.current.pause(id);
        setProgress(0);
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
        }
    };

    // If no valid audio URL, show message instead of button
    if (!isValidAudio) {
        return (
            <Box style={{ width: "100%" }}>
                <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    style={{ textAlign: "center", padding: "8px" }}
                >
                    No preview available
                </Typography>
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
