import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, push, remove } from 'firebase/database';
import {
    Container, CssBaseline, Typography, TextField, Button, Grid, Dialog, DialogActions, DialogContent,
    DialogTitle, Card, CardContent, CardActions, IconButton, Snackbar, Alert, Box, List, ListItem, ListItemText, Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { db } from './firebasec';

function TaskPage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState('');
    const [description, setDescription] = useState('');
    const [tasks, setTasks] = useState([]);
    const [students, setStudents] = useState([]);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        // Fetch tasks
        const tasksRef = ref(db, `tasks/${classId}`);
        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const parsedTasks = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setTasks(parsedTasks);
            } else {
                setTasks([]);
            }
        });

        // Fetch students
        const studentsRef = ref(db, `joinclass`);
        onValue(studentsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const filteredStudents = Object.keys(data)
                    .map(key => data[key])
                    .filter(student => student.classCode === classId);
                setStudents(filteredStudents);
            }
        });

    }, [classId]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!task || !description) {
            setError('Title and description are required');
            return;
        }

        try {
            const tasksRef = ref(db, `tasks/${classId}`);
            await push(tasksRef, { task, description });
            setTask('');
            setDescription('');
            setError('');
            setOpen(false);
            setSnackbarOpen(true);
        } catch (error) {
            setError(`An error occurred: ${error.message}`);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const taskRef = ref(db, `tasks/${classId}/${taskId}`);
            await remove(taskRef);
        } catch (error) {
            setError(`An error occurred: ${error.message}`);
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleTaskClick = (taskId) => {
        navigate(`/home/task/${classId}/${taskId}`);
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    return (
        <Container component="main" maxWidth="lg">
            <CssBaseline />
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4 }}></Box>
            <Typography variant="h4" gutterBottom sx={{ ml: "350px" }}>
                Create a new Test
            </Typography>
            <Typography paddingLeft={'418px'}>
                <Button variant="contained" color="secondary" onClick={handleClickOpen} 
                    sx={{ mb: 2, backgroundColor: "purple" }}>
                    Create Test
                </Button>
            </Typography>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Test</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Test Name"
                        fullWidth
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    {error && <Typography color="error">{error}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddTask} color="primary">
                        Add Task
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                    Test added successfully!
                </Alert>
            </Snackbar>
            <Grid container spacing={2} sx={{ ml: -13 }}>
                <Grid item xs={9}>
                    <Grid container spacing={2}>
                        {tasks.map(({ id, task, description }) => (
                            <Grid item key={id} xs={12} sm={6} md={4}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        height: '150px',
                                        boxShadow: 3,
                                        borderRadius: 2
                                    }}
                                    onClick={() => handleTaskClick(id)}
                                >
                                    <CardContent>
                                        <Typography variant="h6" noWrap gutterBottom>
                                            {task}
                                        </Typography>
                                        <Typography color="textSecondary" noWrap>
                                            {description}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDeleteTask(id); }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid item xs={3}>
                    <Paper elevation={3} sx={{ padding: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Students Joined
                        </Typography>
                        <List>
                            {students.map((student, index) => (
                                <ListItem key={index}>
                                    <ListItemText primary={student.studentName} secondary={student.email} />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default TaskPage;
