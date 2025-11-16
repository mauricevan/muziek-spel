import React, { useState, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";
import { FaPlay, FaPause, FaMusic, FaExclamationTriangle } from 'react-icons/fa';

const PlayAudio = ({ idx, mp3, playing, setPlaying, previewDuration = 30 }) => {
    const [id, setId] = useState("");
    const [progress, setProgress] = useState(0);
    const [loadError, setLoadError] = useState(false);
    const progressInterval = useRef(null);
    const mountedRef = useRef(false);
    const [volume, setVolume] = useState(
        Number(localStorage.getItem("audioVolume")) || 0.7
    );

    const [sound] = useState(
        new Howl({
            src: [mp3],
            format: ["mp3"],
            loop: false,
            volume: volume,
            html5: true,
            onload: function() {
                console.log('Audio loaded:', mp3);
                if (mountedRef.current) {
                    setLoadError(false);
                }
            },
            onloaderror: function(id, error) {
                console.error('Failed to load audio:', error, 'URL:', mp3);
                if (mountedRef.current) {
                    setLoadError(true);
                    setPlaying({});
                }
            },
            onplayerror: function(id, error) {
                console.error('Failed to play audio:', error, 'URL:', mp3);
                if (mountedRef.current) {
                    setLoadError(true);
                    setPlaying({});
                }
            },
            onend: function() {
                if (mountedRef.current) {
                    setPlaying({});
                    setProgress(0);
                }
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
            }
        })
    );

    useEffect(() => {
        // Mark component as mounted
        mountedRef.current = true;

        return () => {
            // Mark component as unmounted
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        // Update volume when it changes globally
        sound.volume(volume);
    }, [volume, sound]);

    useEffect(() => {
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
            sound.unload();
        };
    }, [sound]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.code === 'Space' && idx === 0) { // Only first audio responds to space
                e.preventDefault();
                if (playing[idx]) {
                    handlePause(id);
                } else {
                    handlePlay();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [playing, idx, id]);

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
            if (!mountedRef.current) {
                clearInterval(progressInterval.current);
                return;
            }

            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (elapsed >= duration) {
                sound.stop();
                if (mountedRef.current) {
                    setPlaying({});
                    setProgress(0);
                }
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
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 flex items-center justify-center opacity-50">
                <div className="text-center">
                    <FaExclamationTriangle className="text-gray-400 text-3xl mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No preview</p>
                </div>
            </div>
        );
    }

    const isPlaying = playing[idx];

    return (
        <div className="relative">
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 ${
                isPlaying ? 'ring-4 ring-blue-500 shadow-2xl scale-105' : 'hover:shadow-xl'
            }`}>
                {/* Play/Pause Button */}
                <button
                    onClick={isPlaying ? () => handlePause(id) : handlePlay}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 focus-visible-ring ${
                        isPlaying
                            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105'
                    }`}
                    aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                >
                    {isPlaying ? (
                        <>
                            <FaPause className="text-xl" />
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <FaPlay className="text-xl" />
                            <span>Play {idx > 0 ? `${idx + 1}` : ''}</span>
                        </>
                    )}
                </button>

                {/* Progress Bar */}
                {isPlaying && (
                    <div className="mt-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-100 relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                            </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>{Math.floor((progress / 100) * previewDuration)}s</span>
                            <span>{previewDuration}s</span>
                        </div>
                    </div>
                )}

                {/* Visual Indicator */}
                {isPlaying && (
                    <div className="flex items-center justify-center gap-1 mt-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="w-1 bg-blue-500 rounded-full animate-pulse"
                                style={{
                                    height: `${Math.random() * 20 + 10}px`,
                                    animationDelay: `${i * 0.1}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Keyboard Hint */}
            {idx === 0 && !isPlaying && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg animate-bounce-slow">
                    Space ⌨️
                </div>
            )}
        </div>
    );
};

export default PlayAudio;
