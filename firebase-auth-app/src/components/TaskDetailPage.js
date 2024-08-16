import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue, push, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    Container,
    CssBaseline,
    Typography,
    TextField,
    Button,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Snackbar,
    Alert,
    Tooltip,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { db, storage } from './firebasec';

function TaskDetailPage() {
    const { classId, taskId } = useParams();
    const [task, setTask] = useState({});
    const [workTitle, setWorkTitle] = useState('');
    const [workDescription, setWorkDescription] = useState('');
    const [workDate, setWorkDate] = useState('');
    const [workTime, setWorkTime] = useState('');
    const [workDocument, setWorkDocument] = useState(null);
    const [answerDocument, setAnswerDocument] = useState(null);
    const [open, setOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [loading, setLoading] = useState(false); // Add loading state

    useEffect(() => {
        const taskRef = ref(db, `tasks/${classId}/${taskId}`);
        onValue(taskRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setTask(data);
            }
        });
    }, [classId, taskId]);

    const generateAccessCode = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleDocumentChange = (e) => {
        setWorkDocument(e.target.files[0]);
    };

    const handleAnswerDocumentChange = (e) => {
        setAnswerDocument(e.target.files[0]);
    };

    const uploadDocument = async (file, path) => {
        if (!file) return null;

        const documentRef = storageRef(storage, path);
        try {
            await uploadBytes(documentRef, file);
            const url = await getDownloadURL(documentRef);
            return url;
        } catch (error) {
            alert(`Failed to upload document: ${error.message}`);
            return null;
        }
    };

    const handleAddWork = async (e) => {
        e.preventDefault();
        if (!workTitle || !workDescription || !workDate || !workTime || !workDocument || !answerDocument) {
            alert('All fields are required');
            return;
        }

        const accessCode = generateAccessCode();

        // Format the current date and time
        const now = new Date();
        const creationDateTimeFormatted = now.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        // Format the scheduled date and time
        const scheduledDateTime = new Date(`${workDate}T${workTime}`);
        const scheduledDateTimeFormatted = scheduledDateTime.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        try {
            setLoading(true); // Start loading
            const workDocumentURL = await uploadDocument(workDocument, `documents/${workDocument.name}`);
            const answerDocumentURL = await uploadDocument(answerDocument, `documents/${answerDocument.name}`);
            if (workDocumentURL && answerDocumentURL) {
                const taskRef = ref(db, `tasks/${classId}/${taskId}/work`);
                await push(taskRef, {
                    workTitle,
                    workDescription,
                    workDate,
                    workTime,
                    accessCode,
                    workDocument: workDocumentURL, // Store work document URL
                    answerDocument: answerDocumentURL, // Store answer document URL
                    creationDateTime: creationDateTimeFormatted,
                    scheduledDateTime: scheduledDateTimeFormatted,
                });
                setWorkTitle('');
                setWorkDescription('');
                setWorkDate('');
                setWorkTime('');
                setWorkDocument(null);
                setAnswerDocument(null);
                setOpen(false);
                setSnackbarOpen(true);
            }
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleDeleteWork = async (workId) => {
        try {
            const workRef = ref(db, `tasks/${classId}/${taskId}/work/${workId}`);
            await remove(workRef);
            setSnackbarOpen(true);
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        }
    };

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setSnackbarOpen(true);
        }).catch((error) => {
            alert(`Failed to copy: ${error.message}`);
        });
    };

    return (
        <Container component="main" maxWidth="lg">
            <CssBaseline />
            <Button variant="contained" color="secondary" onClick={handleClickOpen} sx={{ mb: 2, backgroundColor: "purple" }}>
                Add Test
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add New Test</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the details for the test.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Title"
                        fullWidth
                        value={workTitle}
                        onChange={(e) => setWorkTitle(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Description"
                        fullWidth
                        value={workDescription}
                        onChange={(e) => setWorkDescription(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={workDate}
                        onChange={(e) => setWorkDate(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Time"
                        type="time"
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        value={workTime}
                        onChange={(e) => setWorkTime(e.target.value)}
                    />
                    <input
                        type="file"
                        onChange={handleDocumentChange}
                    />
                    <br />
                    <input
                        type="file"
                        onChange={handleAnswerDocumentChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddWork} color="primary" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Add Test'}
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
                    Test added or deleted successfully!
                </Alert>
            </Snackbar>

            <Grid container spacing={2}>
                {task.work && Object.keys(task.work).map(workId => (
                    <Grid item key={workId} xs={12} sm={6} md={5}>
                        <Card
                            variant="outlined"
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '220px',
                                boxShadow: 3,
                                borderRadius: 2
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" noWrap>{task.work[workId].workTitle}</Typography>
                                <Typography color="textSecondary" noWrap>Scheduled on: {task.work[workId].scheduledDateTime}</Typography>
                                <Typography color="textSecondary" noWrap>
                                    Access Code: 
                                    <span
                                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                        onClick={() => handleCopyToClipboard(task.work[workId].accessCode)}
                                    >
                                        {task.work[workId].accessCode}
                                    </span>
                                </Typography>
                                {task.work[workId].workDocument && (
                                    <Typography color="textSecondary" noWrap>
                                        Question Paper: 
                                        <a href={task.work[workId].workDocument} target="_blank" rel="noopener noreferrer">View Document</a>
                                    </Typography>
                                )}
                                {task.work[workId].answerDocument && (
                                    <Typography color="textSecondary" noWrap>
                                        Answer Sheet: 
                                        <a href={task.work[workId].answerDocument} target="_blank" rel="noopener noreferrer">View Document</a>
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions>
                                <Tooltip title="Delete Work" placement="top">
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => handleDeleteWork(workId)}
                                        color="secondary"
                                        sx={{ ml: 'auto' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default TaskDetailPage;
 