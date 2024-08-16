import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, off } from 'firebase/database';
import {Container,CssBaseline,Typography,Card,CardContent,Button,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,TextField,Grid,Link} from '@mui/material';
import { db } from './firebasec';
import { parse } from 'date-fns';

function StudentTaskDetailPage() {
    const { classId, taskId } = useParams();
    const [workDetailsList, setWorkDetailsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedWork, setSelectedWork] = useState(null);
    const [enteredCode, setEnteredCode] = useState('');
    const [isCodeValid, setIsCodeValid] = useState(null);
    const [isTimeValid, setIsTimeValid] = useState(true);
    const [isStudentTimeValid, setIsStudentTimeValid] = useState(true);
    const [unlockedTasks, setUnlockedTasks] = useState([]);

    useEffect(() => {
        const savedUnlockedTasks = JSON.parse(localStorage.getItem('unlockedTasks')) || [];
        setUnlockedTasks(savedUnlockedTasks);

        const worksRef = ref(db, `tasks/${classId}/${taskId}/work`);

        const handleData = (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const workArray = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
                setWorkDetailsList(workArray);
            } else {
                setWorkDetailsList([]);
            }
            setLoading(false);
        };

        const handleError = (error) => {
            console.error("Error fetching data:", error);
            setLoading(false);
        };

        onValue(worksRef, handleData, handleError);

        return () => {
            off(worksRef, handleData);
        };
    }, [classId, taskId]);

    const handleViewTaskClick = (work) => {
        setSelectedWork(work);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedWork(null);
        setEnteredCode('');
        setIsCodeValid(null);
        setIsTimeValid(true);
        setIsStudentTimeValid(true);
    };

    const parseDate = (dateString) => {
        try {
            return parse(dateString, "d MMMM yyyy 'at' hh:mm a", new Date());
        } catch (error) {
            console.error("Date parsing error:", error);
            return new Date();
        }
    };

    const handleAccessCodeSubmit = () => {
        if (!selectedWork) return;

        // Scheduled time for the task
        const scheduledDateTime = parseDate(selectedWork.scheduledDateTime);
        const currentDateTime = new Date();

        // Time specifically for the student (if applicable)
        const studentDateTime = parseDate(selectedWork.studentDateTime || currentDateTime);

        // Check if the current time is greater than or equal to the scheduled time
        if (currentDateTime >= scheduledDateTime) {
            setIsTimeValid(true);

            // Check if the current time is greater than or equal to the student's specific time
            if (currentDateTime >= studentDateTime) {
                setIsStudentTimeValid(true);

                // Validate the access code
                if (enteredCode === selectedWork.accessCode) {
                    setIsCodeValid(true);

                    // Store the unlocked task
                    const updatedTasks = new Set(unlockedTasks);
                    updatedTasks.add(selectedWork.id);
                    const updatedTasksArray = Array.from(updatedTasks);
                    setUnlockedTasks(updatedTasksArray);
                    localStorage.setItem('unlockedTasks', JSON.stringify(updatedTasksArray));

                    // Close the dialog
                    handleCloseDialog();
                } else {
                    setIsCodeValid(false);
                }
            } else {
                setIsStudentTimeValid(false);
            }
        } else {
            setIsTimeValid(false);
        }
    };

    return (
        <Container component="main" maxWidth="md">
            <CssBaseline />
            <Typography variant="h4" gutterBottom sx={{mt:3, ml: 30}}>
                    Uploaded Tests
                </Typography><br></br>
            {loading ? (
                <Typography>Loading work details...</Typography>
            ) : (
                
                workDetailsList.length > 0 ? (
                    
                    <Grid container spacing={4} sx={{ml:-27}}>
                        {workDetailsList.map(work => (
                            <Grid item xs={12} sm={6} md={4} key={work.id}>
                                <Card variant="outlined" style={{ marginBottom: '1rem' }}
                                sx={{boxShadow: 3,
                                    borderRadius: 2}}>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {work.workTitle}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Date: {work.scheduledDateTime}
                                        </Typography>
                                        {unlockedTasks.includes(work.id) ? (
                                            <>
                                                {work.workDocument && (
                                                    <Link
                                                        href={work.workDocument}
                                                        target="_blank"
                                                        rel="noopener"
                                                        variant="body2"
                                                        style={{ display: 'block', marginTop: '0.5rem' }}
                                                    >
                                                        View Question Document
                                                    </Link>
                                                )}
                                                {work.answerDocument && (
                                                    <Link
                                                        href={work.answerDocument}
                                                        target="_blank"
                                                        rel="noopener"
                                                        variant="body2"
                                                        style={{ display: 'block', marginTop: '0.5rem' }}
                                                    >
                                                        View Answer Document
                                                    </Link>
                                                )}
                                            </>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleViewTaskClick(work)}
                                                size="small"
                                                style={{ marginTop: '0.5rem', padding: '0.3rem 1rem',backgroundColor:"purple" }}
                                            >
                                                View Task
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Typography>No work details available.</Typography>
                )
            )}

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>Enter Access Code</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the access code to view the task.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Access Code"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        error={isCodeValid === false}
                    />
                    {isCodeValid === false && (
                        <Typography color="error">Invalid access code.</Typography>
                    )}
                    {isTimeValid === false && (
                        <Typography color="error">You cannot view this task before the scheduled time.</Typography>
                    )}
                    {isStudentTimeValid === false && (
                        <Typography color="error">You cannot view this task before your scheduled time.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAccessCodeSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default StudentTaskDetailPage;
