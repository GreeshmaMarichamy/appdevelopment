import React, { useState, useEffect } from 'react';
import {Typography,Card,CardContent,CardActions,Button,Dialog,DialogActions,DialogContent,
    DialogContentText,DialogTitle, TextField, Grid,Box,IconButton,Container,CssBaseline,Snackbar,Alert} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ref, push, remove, onValue, query, orderByChild, equalTo } from 'firebase/database';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from './firebasec';

function Teacher() {
    const [open, setOpen] = useState(false);
    const [className, setClassName] = useState('');
    const [subject, setSubject] = useState('');
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            setEmail(userEmail);
            fetchClasses(userEmail);
        } else {
            window.location.href = '/login';
        }
    }, []);

    const fetchClasses = (userEmail) => {
        const classesRef = query(ref(db, 'classes'), orderByChild('email'), equalTo(userEmail));
        onValue(classesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const parsedClasses = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setClasses(parsedClasses);
            } else {
                setClasses([]);
            }
        });
    };

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setError('');
    };

    const handleCreate = async (e) => {
        e.preventDefault();

        if (!className || !subject) {
            setError('Class name and subject are required');
            return;
        }

        try {
            const classNameRef = query(ref(db, 'classes'), orderByChild('className'), equalTo(className));
            onValue(classNameRef, async (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setError('A class with this name already exists');
                } else {
                    const generateCode = () => Math.floor(10000 + Math.random() * 90000).toString();
                    const classCode = generateCode();

                    try {
                        const classRef = ref(db, 'classes');
                        await push(classRef, {
                            className,
                            subject,
                            email,
                            code: classCode
                        });
                        setClassName('');
                        setSubject('');
                        setOpen(false);
                    } catch (error) {
                        setError(`An error occurred while creating the class: ${error.message}`);
                    }
                }
            }, { onlyOnce: true });
        } catch (error) {
            setError(`An error occurred while checking for existing classes: ${error.message}`);
        }
    };

    const handleDelete = async (e, classId, classCode) => {
        e.stopPropagation();
        try {
            const classRef = ref(db, `classes/${classId}`);
            const tasksRef = ref(db, `tasks/${classCode}`);

            await remove(tasksRef);
            await remove(classRef);
        } catch (error) {
            console.error("Error deleting class or tasks:", error.message);
        }
    };

    const handleClassClick = (classCode) => {
        navigate(`/home/task/${classCode}`);
    };

    const handleCodeClick = (code) => {
        navigator.clipboard.writeText(code);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    return (
        <Container component="main" maxWidth="s">
            <CssBaseline />
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    mt: 4
                }}
            >
                <Typography variant="h4" gutterBottom sx={{ ml: 45}}>
                    Manage Classes
                </Typography>
                
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleClickOpen}
                   sx={{ mb: 2, backgroundColor: "purple",
                    width: '150px', ml: 51}} // Set a specific width
                >
                     Create Class
                </Button>

                <br></br>
                <Grid container spacing={2} sx={{ mt: 2, ml: -15 }}>
                    {classes.map(({ id, className, subject, code }) => (
                        <Grid item key={id} xs={12} sm={6} md={4}>
                            <Card sx={{ cursor: 'pointer',boxShadow: 3,
                                borderRadius: 2}} onClick={() => handleClassClick(code)}>
                                <CardContent>
                                    <Typography variant="h6">{className}</Typography>
                                    <Typography variant="body2">{subject}</Typography>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCodeClick(code);
                                        }}
                                    >
                                        Class Code: {code}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <IconButton
                                        aria-label="delete"
                                        size="small"
                                        onClick={(e) => handleDelete(e, id, code)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Create a new class</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            To create a new class, please enter the class name and subject here.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Class Name"
                            type="text"
                            fullWidth
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Subject"
                            type="text"
                            fullWidth
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">Cancel</Button>
                        <Button onClick={handleCreate} color="primary">Create</Button>
                    </DialogActions>
                </Dialog>
            </Box>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Class code copied to clipboard!
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default Teacher;
