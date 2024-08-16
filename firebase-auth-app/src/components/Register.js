import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Container, CssBaseline, Grid, Link, } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';  // Import keyframes for animations

// Fade-in animation for the form
const fadeIn = keyframes`
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
`;

// Button hover scale animation
const scaleUp = keyframes`
    from {
        transform: scale(1);
    }
    to {
        transform: scale(1.05);
    }
`;

const theme = createTheme({
    palette: {
        primary: {
            main: '#9c27b0', // Purple color
        },
        secondary: {
            main: '#000000', // Black color
        },
        background: {
            default: 'white', // Dark background color
            paper: '#2e2e2e', // Slightly lighter dark background for the paper
        },
        text: {
            primary: '#ffffff', // White text color
            secondary: '#9c27b0', // Purple text color for secondary text
        },
    },
    typography: {
        h3: {
            color: 'purple', // White color for the header
            fontWeight: 'bold', // Bold text for the header
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    color: '#ffffff',
                    textTransform: 'none', // Remove uppercase transformation
                    animation: `${scaleUp} 0.3s ease-in-out`, // Add scale-up animation
                    '&:hover': {
                        animation: `${scaleUp} 0.3s ease-in-out`, // Repeat on hover
                    },
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

function Register() {
    const [details, setDetails] = useState({
        fName: '',
        lName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Validate email format
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Validate password strength
    const isStrongPassword = (password) => {
        return password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
    };

    // Validate name (only letters)
    const isValidName = (name) => {
        return /^[a-zA-Z]+$/.test(name);
    };

    const PostData = async (e) => {
        e.preventDefault();

        const { fName, lName, email, password, confirmPassword } = details;

        // Check if first name and last name are valid
        if (!isValidName(fName) || !isValidName(lName)) {
            setError('Names should only contain letters.');
            return;
        }

        // Check if email is valid
        if (!isValidEmail(email)) {
            setError('Invalid email address.');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        // Check if password is strong enough
        if (!isStrongPassword(password)) {
            setError('Password must be at least 8 characters long and include uppercase, lowercase, numeric, and special characters.');
            return;
        }

        try {
            const res = await fetch("https://answerhub-auth-3b821-default-rtdb.firebaseio.com/register.json", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fName,
                    lName,
                    email,
                    password,
                })
            });

            if (res.ok) {
                setError('');
                navigate('/login'); // Redirect to login page upon successful registration
            } else {
                setError('Registration failed.');
            }
        } catch (error) {
            setError('An error occurred.');
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container component="main" maxWidth="xs" sx={{ animation: `${fadeIn} 1s ease-in-out` }}>
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
                    <Box component="form" onSubmit={PostData} noValidate sx={{ mt: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    autoComplete="fname"
                                    name="firstName"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    onChange={(e) => setDetails({ ...details, fName: e.target.value })}
                                    InputLabelProps={{ style: { color: '#9c27b0' } }}
                                    InputProps={{ style: { color: '#9c27b0' } }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="lname"
                                    onChange={(e) => setDetails({ ...details, lName: e.target.value })}
                                    InputLabelProps={{ style: { color: '#9c27b0' } }}
                                    InputProps={{ style: { color: '#9c27b0' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                                    InputLabelProps={{ style: { color: '#9c27b0' } }}
                                    InputProps={{ style: { color: '#9c27b0' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="new-password"
                                    onChange={(e) => setDetails({ ...details, password: e.target.value })}
                                    InputLabelProps={{ style: { color: '#9c27b0' } }}
                                    InputProps={{ style: { color: '#9c27b0' } }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    fullWidth
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    id="confirmPassword"
                                    autoComplete="new-password"
                                    onChange={(e) => setDetails({ ...details, confirmPassword: e.target.value })}
                                    InputLabelProps={{ style: { color: '#9c27b0' } }}
                                    InputProps={{ style: { color: '#9c27b0' } }}
                                />
                            </Grid>
                            {error && (
                                <Grid item xs={12}>
                                    <Typography color="error" sx={{ textAlign: 'center' }}>{error}</Typography>
                                </Grid>
                            )}
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2, '&:hover': { animation: `${scaleUp} 0.3s ease-in-out` } }} // Button hover animation
                        >
                            Sign Up
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default Register;
