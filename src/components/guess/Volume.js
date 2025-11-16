import React, { useState, useEffect } from "react";
import { Howler } from "howler";
import { FaVolumeDown, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import throttle from "lodash/throttle";

const Volume = () => {
    const [volume, setVolume] = useState(
        Number(localStorage.getItem("audioVolume")) || 0.7
    );

    const handleChange = throttle((newValue) => {
        const volumeValue = Number(newValue);
        setVolume(volumeValue);
        Howler.volume(volumeValue);
        localStorage.setItem("audioVolume", volumeValue);
    }, 15);

    useEffect(() => {
        // Set initial volume
        Howler.volume(volume);
    }, []);

    const VolumeIcon = volume === 0 ? FaVolumeMute : volume < 0.5 ? FaVolumeDown : FaVolumeUp;

    return (
        <div className="w-full">
            <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300 text-center">
                🔊 Volume: {Math.round(volume * 100)}%
            </label>
            <div className="flex items-center gap-4">
                <VolumeIcon className="text-gray-600 dark:text-gray-400 text-xl flex-shrink-0" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleChange(e.target.value)}
                    className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    aria-label="Volume slider"
                />
                <FaVolumeUp className="text-gray-600 dark:text-gray-400 text-xl flex-shrink-0" />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <button
                    onClick={() => handleChange(0)}
                    className="hover:text-blue-500 transition-colors"
                >
                    Mute
                </button>
                <button
                    onClick={() => handleChange(0.5)}
                    className="hover:text-blue-500 transition-colors"
                >
                    50%
                </button>
                <button
                    onClick={() => handleChange(1)}
                    className="hover:text-blue-500 transition-colors"
                >
                    Max
                </button>
            </div>
        </div>
    );
};

export default Volume;
