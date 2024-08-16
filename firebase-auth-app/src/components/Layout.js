import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, Box, CssBaseline, Tooltip, Dialog, DialogContent, DialogTitle, Typography as MuiTypography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

function Layout() {
    const [userData, setUserData] = useState({ email: '', fName: '', lName: '' });
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data from local storage
        const email = localStorage.getItem('userEmail');
        const fName = localStorage.getItem('userFName');
        const lName = localStorage.getItem('userLName');

        if (email && fName && lName) {
            setUserData({ email, fName, lName });
        }
    }, []);

    const handleIconClick = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleLogout = () => {
        // Clear user session (e.g., remove user data from local storage)
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userFName');
        localStorage.removeItem('userLName');
        // Redirect to login page
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'purple'
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="menu"
                        edge="start"
                        sx={{ marginRight: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        AnswerHub
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Tooltip title={`${userData.fName} ${userData.lName}`}>
                        <IconButton
                            color="inherit"
                            aria-label="user"
                            edge="end"
                            onClick={handleIconClick}
                        >
                            <AccountCircleIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Logout">
                        <IconButton
                            color="inherit"
                            aria-label="logout"
                            edge="end"
                            onClick={handleLogout}
                        >
                            <ExitToAppIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                anchor="left"
                sx={{
                    width: 50,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 70,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar />
                <List>
                    <ListItem button component={Link} to="/home">
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                    </ListItem>
                    <ListItem button component={Link} to="calendar">
                        <ListItemIcon>
                            <EventNoteIcon />
                        </ListItemIcon>
                    </ListItem>
                    <ListItem button component={Link} to="teacher">
                        <ListItemIcon>
                            <SchoolIcon />
                        </ListItemIcon>
                    </ListItem>
                    <ListItem button component={Link} to="student">
                        <ListItemIcon>
                            <PeopleIcon />
                        </ListItemIcon>
                    </ListItem>
                </List>
            </Drawer>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: 30,
                    transition: 'margin 0.3s ease',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>PROFILE</DialogTitle>
                <DialogContent>
                    <MuiTypography variant="body1">
                        Name: {userData.fName} {userData.lName}
                    </MuiTypography>
                    <MuiTypography variant="body1">
                        Email: {userData.email}
                    </MuiTypography>
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default Layout;
