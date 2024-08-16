import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
import { ref, onValue, off } from 'firebase/database';
import { db } from './firebasec'; // Ensure your Firebase configuration is correct


function CalendarPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [classNames, setClassNames] = useState({}); // State to store class names

    useEffect(() => {
        // Fetch user email from local storage
        const email = localStorage.getItem('userEmail');
        setUserEmail(email || '');
    }, []);

    useEffect(() => {
        if (!userEmail) return;

        const fetchTasksAndClassNames = async () => {
            try {
                setLoading(true);

                // Fetch the classes the student has joined
                const joinedClassesRef = ref(db, 'joinclass');
                const tasksRef = ref(db, 'tasks');
                const classNamesRef = ref(db, 'classes');

                onValue(joinedClassesRef, (snapshot) => {
                    const joinedClasses = [];
                    snapshot.forEach((classSnapshot) => {
                        const classData = classSnapshot.val();
                        if (classData.email === userEmail) {
                            joinedClasses.push(classData.classCode);
                        }
                    });

                    if (joinedClasses.length > 0) {
                        onValue(tasksRef, (taskSnapshot) => {
                            const allTasks = [];
                            const data = taskSnapshot.val();

                            if (data) {
                                Object.keys(data).forEach(classId => {
                                    if (joinedClasses.includes(classId)) {
                                        const classTasks = data[classId];
                                        Object.keys(classTasks).forEach(taskId => {
                                            const taskDetails = classTasks[taskId];
                                            Object.keys(taskDetails.work || {}).forEach(workId => {
                                                const work = taskDetails.work[workId];
                                                if (work.scheduledDateTime) {
                                                    allTasks.push({
                                                        id: workId,
                                                        taskName: taskDetails.task,
                                                        workDescription: work.workDescription || 'No Work Description', // Use workDescription here
                                                        classId: classId,
                                                        taskId: taskId,
                                                        ...work
                                                    });
                                                }
                                            });
                                        });
                                    }
                                });
                                setTasks(allTasks);
                            }
                        });

                        onValue(classNamesRef, (classSnapshot) => {
                            const classes = {};
                            classSnapshot.forEach((snap) => {
                                const classData = snap.val();
                                classes[classData.code] = classData.className; // Use code for mapping
                            });
                            setClassNames(classes);
                        });
                    } else {
                        setTasks([]);
                    }
                });
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasksAndClassNames();

        return () => {
            // Clean up listeners
            off(ref(db, 'tasks'));
            off(ref(db, 'joinclass'));
            off(ref(db, 'classes'));
        };
    }, [userEmail]);

    return (
        <Container
            component="main"
            maxWidth="md"
            sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}
        >
            <Typography variant="h4" sx={{ marginTop: 2,ml:"200px",mt:'25px' }}>Scheduled Tests</Typography>
            {loading ? (
                <Typography>Loading tests...</Typography>
            ) : (
                <Grid container spacing={4} sx={{ marginTop: 2,ml:-25 }}>
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <Grid item xs={8} sm={4} key={task.id}>
                                <Card variant="outlined" sx={{boxShadow: 3,
                                borderRadius: 2}}>
                                    <CardContent>
                                        <Typography variant="h6" component="div">
                                            {task.taskName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {task.scheduledDateTime}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary">
                                            Class: {classNames[task.classId] || 'Unknown'}
                                        </Typography>
                                        <Typography variant="body2" color="text.primary">
                                            Work: {task.workDescription || 'No Work Description'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography>No tests available.</Typography>
                    )}
                </Grid>
            )}
        </Container>
    );
}

export default CalendarPage;
