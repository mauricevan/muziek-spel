import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getTokenFromUrl } from '../services/auth';
import LoadingSpinner from './shared/LoadingSpinner';

const Callback = () => {
    const history = useHistory();

    useEffect(() => {
        const token = getTokenFromUrl();

        if (token) {
            console.log('Successfully authenticated with Spotify!');
            // Redirect back to home page
            history.push('/');
        } else {
            console.error('Failed to get token from URL');
            // Redirect to home with error
            history.push('/?error=auth_failed');
        }
    }, [history]);

    return <LoadingSpinner />;
};

export default Callback;
