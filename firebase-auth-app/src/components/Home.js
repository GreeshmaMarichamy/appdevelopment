import React, { useEffect, useState } from 'react';
import { Typography, Box, Button } from '@mui/material';

const Home = () => {
    const [username, setUsername] = useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            const email = localStorage.getItem('userEmail');

            if (email) {
                try {
                    const res = await fetch("https://answerhub-auth-3b821-default-rtdb.firebaseio.com/register.json");
                    const data = await res.json();

                    const user = Object.values(data).find(user => user.email === email);
                    if (user) {
                        setUsername(`${user.fName} ${user.lName}`);
                    }
                } catch (error) {
                    console.error('Failed to fetch user details:', error);
                }
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <div>
            <Box
                sx={{
                    backgroundColor: 'black',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '70vh',
                    width: '70vw',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    padding: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    '@keyframes fadeIn': {
                        from: {
                            opacity: 0,
                        },
                        to: {
                            opacity: 1,
                        },
                    },
                    '@keyframes slideUp': {
                        from: {
                            transform: 'translateY(20px)',
                            opacity: 0,
                        },
                        to: {
                            transform: 'translateY(0)',
                            opacity: 1,
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        animation: 'fadeIn 2s ease-in-out',
                    }}
                >
                    <Typography
                        variant="h2"
                        component="div"
                        sx={{
                            mb: 2,
                            animation: 'fadeIn 2s ease-in-out',
                        }}
                    >
                        Welcome to AnswerHub
                    </Typography>
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            mb: 4,
                            animation: 'slideUp 1.5s ease-out',
                        }}
                    >
                        Your gateway to exam answers and educational resources.
                    </Typography>
                    <Button variant="contained" color="secondary" size="large">
                        Get Started
                    </Button>
                </Box>
            </Box>
        </div>
    );
}

export default Home;
