import React, { useEffect, useContext, useRef } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const TaskReminder = () => {
  const { user } = useContext(AuthContext);
  const notifiedTasks = useRef(new Set());

  useEffect(() => {
    // Only run if user is logged in
    if (!user) return;

    // Request notification permission if not granted
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const checkReminders = async () => {
      try {
        const res = await api.get('/tasks');
        const tasks = res.data;
        
        // Normalize current time using: today.setSeconds(0,0)
        const today = new Date();
        today.setSeconds(0, 0);

        tasks.forEach(task => {
          if (task.status !== 'completed' && task.reminderTime) {
            const reminderDate = new Date(task.reminderTime);
            reminderDate.setSeconds(0, 0); // normalize both sides just to be safe
            
            // Check if current time matches reminder time strictly
            if (today.getTime() === reminderDate.getTime() && !notifiedTasks.current.has(task._id)) {
              
              // Mark as notified in local state/flag to prevent duplicate notifications
              notifiedTasks.current.add(task._id);

              // Show browser notification
              if ("Notification" in window && Notification.permission === "granted") {
                new Notification("Task Reminder", {
                  body: `Don't forget: ${task.title}`
                });
              } else {
                // Fallback UI alert
                alert(`Task Reminder\nDon't forget: ${task.title}`);
              }
            }
          }
        });
      } catch (err) {
        console.error('Failed to fetch tasks for reminders', err);
      }
    };

    // Check reminder time every minute using setInterval
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [user]);

  return null; // This component doesn't render anything visually
};

export default TaskReminder;
