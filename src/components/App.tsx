import React, { useState, Suspense, lazy } from "react";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";

import { Route, Switch } from "react-router-dom";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { ScoreProvider } from "../contexts/ScoreContext";
import { ErrorBoundary, LoadingSpinner } from "./common";
import type { GameConfig, Genre } from "../types";

// Lazy load routes for code splitting
const Guess = lazy(() => import("./Guess"));
const Home = lazy(() => import("./Home"));
const Results = lazy(() => import("./Results"));
const Callback = lazy(() => import("./Callback"));
const Login = lazy(() => import("./Login"));
const Lobby = lazy(() => import("./Lobby"));

const theme = createTheme({
    palette: {
        type: 'dark',
        primary: {
            main: '#00e5ff', // Cyan Neon
            contrastText: '#000',
        },
        secondary: {
            main: '#d500f9', // Purple Neon
            contrastText: '#fff',
        },
        background: {
            default: '#0a0a12', // Very dark blue/black
            paper: '#161622', // Slightly lighter dark blue
        },
        text: {
            primary: '#ffffff',
            secondary: '#b0b0c3',
        },
        action: {
            hover: 'rgba(255, 255, 255, 0.08)',
        }
    },
    typography: {
        fontFamily: '"Outfit", "Circular Std", "Helvetica Neue", Helvetica, Arial, sans-serif',
        h1: {
            fontWeight: 800,
            fontSize: '3rem',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(45deg, #00e5ff 30%, #d500f9 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            fontSize: '0.875rem',
        },
        button: {
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderRadius: 8,
        },
    },
    shape: {
        borderRadius: 12,
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                body: {
                    backgroundImage: 'radial-gradient(circle at 50% 0%, #2a1a4a 0%, #0a0a12 70%)',
                    backgroundAttachment: 'fixed',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: '#0a0a12',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#333',
                        borderRadius: '4px',
                    },
                },
            },
        },
        MuiButton: {
            root: {
                borderRadius: 12,
                padding: '12px 24px',
                transition: 'all 0.3s ease',
            },
            containedPrimary: {
                background: 'linear-gradient(45deg, #00e5ff 30%, #00b8d4 90%)',
                boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
                '&:hover': {
                    boxShadow: '0 6px 25px rgba(0, 229, 255, 0.6)',
                    transform: 'translateY(-2px)',
                },
            },
            containedSecondary: {
                background: 'linear-gradient(45deg, #d500f9 30%, #aa00ff 90%)',
                boxShadow: '0 4px 20px rgba(213, 0, 249, 0.4)',
                '&:hover': {
                    boxShadow: '0 6px 25px rgba(213, 0, 249, 0.6)',
                    transform: 'translateY(-2px)',
                },
            },
            outlinedPrimary: {
                borderWidth: 2,
                '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(0, 229, 255, 0.08)',
                },
            },
        },
        MuiPaper: {
            root: {
                backgroundImage: 'none',
            },
            elevation1: {
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(22, 22, 34, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
            },
            elevation3: {
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(22, 22, 34, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
            },
        },
        MuiLinearProgress: {
            root: {
                height: 10,
                borderRadius: 5,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            barColorPrimary: {
                background: 'linear-gradient(90deg, #00e5ff 0%, #d500f9 100%)',
            },
        },
    },
});

const App: React.FC = () => {
    const [config, setConfig] = useState<GameConfig>(() => {
        const savedGenre = localStorage.getItem("selectedGenre") as Genre | null;
        return {
            selectedGenre: savedGenre || "pop",
            qtySongs: Number(localStorage.getItem("qtySongs")) || 1,
            qtyArtists: Number(localStorage.getItem("qtyArtists")) || 2,
            previewDuration: Number(localStorage.getItem("previewDuration")) || 30,
        };
    });

    return (
        <ErrorBoundary>
            <ScoreProvider>
                <div style={{ display: "flex", height: "100%", minHeight: "100vh" }}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        <Container
                            maxWidth="sm"
                            style={{ 
                                marginTop: "auto", 
                                marginBottom: "auto",
                                paddingTop: "2rem",
                                paddingBottom: "2rem",
                                position: "relative",
                                zIndex: 1
                            }}
                        >
                        <Suspense fallback={<LoadingSpinner />}>
                            <Switch>
                                <Route exact path="/callback">
                                    <Callback />
                                </Route>
                                <Route exact path="/login">
                                    <Login />
                                </Route>
                                <Route exact path="/lobby">
                                    <Lobby />
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
                        </Suspense>
                        </Container>
                    </ThemeProvider>
                </div>
            </ScoreProvider>
        </ErrorBoundary>
    );
};

export default App;

