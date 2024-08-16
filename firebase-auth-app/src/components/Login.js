import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, CssBaseline, Grid, Link, Fade, Slide } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
    palette: {
        primary: {
            main: '#9c27b0', // Purple color
        },
        secondary: {
            main: '#000000', // Black color
        },
        background: {
            default: 'white', // Background color
        },
        text: {
            primary: '#9c27b0', // Purple text color
        },
    },
    typography: {
        h3: {
            color: 'purple', // Purple color for the header
            fontWeight: 'bold', // Bold text for the header
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    color: '#ffffff',
                    textTransform: 'none', // Remove uppercase transformation
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: '#9c27b0',
                    fontWeight: 'bold', // Bold text for the link
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& label.Mui-focused': {
                        color: '#9c27b0', // Purple label color when focused
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#9c27b0', // Purple border color
                        },
                        '&:hover fieldset': {
                            borderColor: '#9c27b0', // Purple border color on hover
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#9c27b0', // Purple border color when focused
                        },
                    },
                },
            },
        },
    },
});

function Login() {
    const [details, setDetails] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const { email, password } = details;

        try {
            const res = await fetch("https://answerhub-auth-3b821-default-rtdb.firebaseio.com/register.json");
            const data = await res.json();
            
            const user = Object.values(data).find(user => user.email === email && user.password === password);

            if (user) {
                setError('');
                // Store user details in local storage
                localStorage.setItem('userEmail', email); // Store email in local storage
                localStorage.setItem('userFName', user.fName); // Store first name in local storage
                localStorage.setItem('userLName', user.lName); // Store last name in local storage
                navigate('/home'); // Redirect to home page
            } else {
                setError('Invalid email or password');
            }
        } catch (error) {
            setError('An error occurred');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Fade in timeout={1000}>
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h3">
                            AnswerHub
                        </Typography>
                        <br></br><br></br>
                        <Slide direction="up" in timeout={1000}>
                            <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                                    InputLabelProps={{ style: { color: '#9c27b0' } }}
                                    InputProps={{ style: { color: '#9c27b0' } }}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    onChange={(e) => setDetails({ ...details, password: e.target.value })}
                                    InputLabelProps={{ style: { color: '#9c27b0' } }}
                                    InputProps={{ style: { color: '#9c27b0' } }}
                                />
                                {error && (
                                    <Typography color="error" variant="body2">
                                        {error}
                                    </Typography>
                                )}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Sign In
                                </Button>
                                <Grid container justifyContent="center">
                                    <Grid item>
                                        <Link href="/" variant="body2">
                                            {"Don't have an account? Sign Up"}
                                        </Link>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Slide>
                    </Box>
                </Container>
            </Fade>
        </ThemeProvider>
    );
}

export default Login;
