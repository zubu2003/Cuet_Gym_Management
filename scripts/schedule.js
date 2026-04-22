// Schedule page JS
document.addEventListener('DOMContentLoaded', function() {
    // Schedule data
    const schedules = {
        'Students': {
            'Boys': {
                title: 'Students (Boys) Schedule',
                days: [
                    { day: 'Monday', time: '6:00 AM - 7:00 AM, 6:00 PM - 10:00 PM' },
                    { day: 'Tuesday', time: '6:00 AM - 7:00 AM, 6:00 PM - 10:00 PM' },
                    { day: 'Wednesday', time: '6:00 AM - 7:00 AM, 6:00 PM - 10:00 PM' },
                    { day: 'Thursday', time: '6:00 AM - 7:00 AM, 6:00 PM - 10:00 PM' },
                    { day: 'Friday', time: '6:00 AM - 7:00 AM, 6:00 PM - 10:00 PM' },
                    { day: 'Saturday', time: '6:00 AM - 7:00 AM, 6:00 PM - 10:00 PM' },
                    { day: 'Sunday', time: '6:00 AM - 7:00 AM, 6:00 PM - 10:00 PM' }
                ]
            },
            'Girls': {
                title: 'Students (Girls) Schedule',
                days: [
                    { day: 'Monday', time: '4:00 PM - 6:00 PM' },
                    { day: 'Tuesday', time: '4:00 PM - 6:00 PM' },
                    { day: 'Wednesday', time: '4:00 PM - 6:00 PM' },
                    { day: 'Thursday', time: '4:00 PM - 6:00 PM' },
                    { day: 'Friday', time: '4:00 PM - 6:00 PM' },
                    { day: 'Saturday', time: '4:00 PM - 6:00 PM' },
                    { day: 'Sunday', time: '4:00 PM - 6:00 PM' }
                ]
            }
        },
        'Teachers': {
            'Boys': {
                title: 'Teachers (Boys) Schedule',
                days: [
                    { day: 'Monday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Tuesday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Wednesday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Thursday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Friday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Saturday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Sunday', time: '7:00 AM - 8:00 AM' }
                ]
            },
            'Girls': {
                title: 'Teachers (Girls) Schedule',
                days: [
                    { day: 'Monday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Tuesday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Wednesday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Thursday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Friday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Saturday', time: '7:00 AM - 8:00 AM' },
                    { day: 'Sunday', time: '7:00 AM - 8:00 AM' }
                ]
            }
        }
    };

    // Current selection
    let currentCategory = 'Students';
    let currentGender = 'Boys';

    // Function to create schedule table
    function createScheduleTable(days) {
        let table = '<table class="schedule-table-content">';
        table += '<tr><th>Day</th><th>Time</th></tr>';
        
        days.forEach(item => {
            table += `<tr>
                        <td>${item.day}</td>
                        <td>${item.time}</td>
                      </tr>`;
        });
        
        table += '</table>';
        return table;
    }

    // Function to update schedule display
    function updateSchedule() {
        const schedule = schedules[currentCategory][currentGender];
        const scheduleTitle = document.getElementById('scheduleTitle');
        const scheduleContent = document.getElementById('schedule-content');
        
        if (scheduleTitle) {
            scheduleTitle.textContent = schedule.title;
        }
        
        if (scheduleContent) {
            scheduleContent.innerHTML = createScheduleTable(schedule.days);
        }
    }

    // Category button clicks
    const categoryBtns = document.querySelectorAll('[data-category]');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            updateSchedule();
        });
    });

    // Gender button clicks
    const genderBtns = document.querySelectorAll('[data-gender]');
    genderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            genderBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentGender = this.getAttribute('data-gender');
            updateSchedule();
        });
    });

    // Initial load
    updateSchedule();
});