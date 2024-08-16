import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import {Container,CssBaseline,Typography,Card,CardContent,Grid,} from '@mui/material';
import { db } from './firebasec';

function StudentTaskPage() {
    const { classId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const tasksRef = ref(db, `tasks/${classId}`);
        
        onValue(tasksRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const parsedTasks = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                    workId: data[key].work ? Object.keys(data[key].work)[0] : null
                }));
                setTasks(parsedTasks);
            } else {
                setTasks([]);
            }
            setLoading(false);
        });
    }, [classId]);

    const handleTaskClick = (taskId, workId) => {
        navigate(`/home/studenttask/${classId}/${taskId}/${workId}`);
    };

    return (
        <Container component="main" maxWidth="md">
            <CssBaseline />
            <Typography variant="h4" gutterBottom sx={{mt:3, ml: 30}}>
                    Available Tests
                </Typography><br></br>
            {loading ? (
                <Typography>Loading tasks...</Typography>
            ) : (
                <Grid container spacing={3} sx={{ml:-25}}>
                    {tasks.length > 0 ? (
                        tasks.map(({ id, task, description, workId }) => (
                            <Grid item xs={12} sm={6} md={4} key={id}>
                                <Card 
                                    variant="outlined" 
                                    onClick={() => handleTaskClick(id, workId)} 
                                    sx={{ cursor: 'pointer',boxShadow: 3,
                                        borderRadius: 2 }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {task}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography>No tasks available.</Typography>
                    )}
                </Grid>
            )}
        </Container>
    );
}

export default StudentTaskPage;
