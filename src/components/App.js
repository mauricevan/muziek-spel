import React, { useState } from "react";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";

import { Route, Switch, Redirect } from "react-router-dom";
import Guess from "./Guess";
import Home from "./Home";
import Results from "./Results";
import Callback from "./Callback";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ScoreProvider } from "../contexts/ScoreContext";

const theme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#1DB954', // Spotify Green
            contrastText: '#fff',
        },
        secondary: {
            main: '#191414', // Spotify Black
            contrastText: '#fff',
        },
        background: {
            default: '#121212',
            paper: '#181818',
        },
        text: {
            primary: '#fff',
            secondary: '#b3b3b3',
        },
    },
    typography: {
        fontFamily: '"Circular Std", "Helvetica Neue", Helvetica, Arial, sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 700,
        },
        button: {
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 500,
        },
    },
    overrides: {
        MuiButton: {
            root: {
                borderRadius: 500, // Pill shape
                padding: '12px 32px',
            },
            containedPrimary: {
                '&:hover': {
                    backgroundColor: '#1ed760',
                },
            },
        },
        MuiPaper: {
            rounded: {
                borderRadius: 16,
            },
        },
    },
});

const App = () => {
    const [config, setConfig] = useState({
        selectedGenre: localStorage.getItem("selectedGenre"),
        qtySongs: Number(localStorage.getItem("qtySongs")) || 1,
        qtyArtists: Number(localStorage.getItem("qtyArtists")) || 2,
        previewDuration: Number(localStorage.getItem("previewDuration")) || 30,
    });

    return (
        <ScoreProvider>
            <div style={{ display: "flex", height: "100%" }}>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Container
                        maxWidth="sm"
                        style={{ marginTop: "auto", marginBottom: "auto" }}
                    >
                        <Switch>
                            <Route exact path="/callback">
                                <Callback />
                            </Route>
                            <Route exact path="/guess">
                                <Guess config={config} />
                            </Route>
                            <Route exact path="/results">
                                <Results />
                            </Route>
                            <Route path="/">
                                <Home config={config} setConfig={setConfig} />
                            </Route>
                        </Switch>
                    </Container>
                </ThemeProvider>
            </div>
        </ScoreProvider>
    );
};

export default App;
