import React, { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    CardActions,
    CardContent,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Grid,
    Box,
    Container,
    CssBaseline,
    Snackbar,
    Alert,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { ref, push, onValue, query, orderByChild, equalTo, remove } from 'firebase/database';
import { db } from './firebasec';
import { useNavigate } from 'react-router-dom';

function Student() {
    const [open, setOpen] = useState(false);
    const [classCode, setClassCode] = useState('');
    const [studentName, setStudentName] = useState('');
    const [joinedClasses, setJoinedClasses] = useState([]);
    const [email, setEmail] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [deleteClassId, setDeleteClassId] = useState(null);
    const [confirmationText, setConfirmationText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            setEmail(userEmail);
            fetchJoinedClasses(userEmail);
        } else {
            window.location.href = '/login';
        }
    }, []);

    const fetchJoinedClasses = async (userEmail) => {
        try {
            const joinedClassesRef = query(ref(db, 'joinclass'), orderByChild('email'), equalTo(userEmail));
            onValue(joinedClassesRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const parsedJoinedClasses = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    setJoinedClasses(parsedJoinedClasses);
                } else {
                    setJoinedClasses([]);
                }
            });
        } catch (error) {
            console.error('Error fetching joined classes:', error.message);
            setSnackbarMessage('Error fetching joined classes');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleJoin = async (e) => {
        e.preventDefault();

        if (!classCode || !studentName) {
            setSnackbarMessage('Class code and name are required');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        try {
            const classRef = query(ref(db, 'classes'), orderByChild('code'), equalTo(classCode));
            onValue(classRef, async (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const classData = Object.values(data)[0];
                    const joinClassRef = query(ref(db, 'joinclass'), orderByChild('classCode'), equalTo(classCode));
                    let classExists = false;
                    onValue(joinClassRef, (snap) => {
                        const joinData = snap.val();
                        if (joinData) {
                            classExists = Object.values(joinData).some(c => c.classCode === classCode && c.email === email);
                        }
                    });

                    if (classExists) {
                        setSnackbarMessage('You have already joined this class');
                        setSnackbarSeverity('error');
                    } else {
                        await push(ref(db, 'joinclass'), {
                            classCode,
                            className: classData.className,
                            classSubject:classData.subject,
                            studentName,
                            email,
                        });
                        setClassCode('');
                        setStudentName('');
                        setOpen(false);
                        setSnackbarMessage('Successfully joined the class');
                        setSnackbarSeverity('success');
                    }
                } else {
                    setSnackbarMessage('Invalid class code');
                    setSnackbarSeverity('error');
                }
                setSnackbarOpen(true);
            }, { onlyOnce: true });
        } catch (error) {
            setSnackbarMessage(`An error occurred: ${error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleClassClick = (classCode) => {
        navigate(`/home/studenttask/${classCode}`);
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleDeleteClick = (e, classId) => {
        e.stopPropagation();
        setDeleteClassId(classId);
        setConfirmDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (confirmationText === 'CONFIRM') {
            try {
                const joinClassRef = ref(`db, joinclass/${deleteClassId}`);
                await remove(joinClassRef);
                setConfirmDialogOpen(false);
                setConfirmationText('');
                setSnackbarMessage('Class removed successfully');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                fetchJoinedClasses(email); // Refresh the list of joined classes
            } catch (error) {
                setSnackbarMessage(`Error deleting class: ${error.message}`);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        } else {
            setSnackbarMessage('Please type "CONFIRM" to proceed');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
        setConfirmationText('');
    };

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
                    Join a  Class
                </Typography>
                <Button variant="contained" color="secondary" onClick={handleClickOpen} sx={{ backgroundColor: 'purple', color: 'white',width: '50px', ml: 52 }}>
                    Join 
                </Button>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                    {joinedClasses.map(({ id, classCode, className,classSubject }) => (
                        <Grid item key={id} xs={10} sm={5} md={3}>
                            <Card sx={{ cursor: 'pointer',boxShadow: 3,
                                borderRadius: 2 }} onClick={() => handleClassClick(classCode)}>
                                <CardContent>
                                    <Typography variant="h5">{className}</Typography>
                                    <Typography variant="h8">{classSubject}</Typography>
                                </CardContent>
                                <CardActions>
                                    <IconButton
                                        aria-label="delete"
                                        size="small"
                                        onClick={(e) => handleDeleteClick(e, id)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Dialog open={open} onClose={handleClose}>
                    <DialogTitle>Join a New Class</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Class Code"
                            type="text"
                            fullWidth
                            value={classCode}
                            onChange={(e) => setClassCode(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            label="Your Name"
                            type="text"
                            fullWidth
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">Cancel</Button>
                        <Button onClick={handleJoin} color="primary">Join</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            To confirm the deletion, please type "CONFIRM" below.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Type CONFIRM"
                            type="text"
                            fullWidth
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleConfirmDialogClose} color="primary">Cancel</Button>
                        <Button onClick={handleConfirmDelete} color="primary">Delete</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
}

export default Student;