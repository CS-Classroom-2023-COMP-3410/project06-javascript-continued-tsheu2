// Tab Navigation Logic
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Hide all tab contents
    tabContents.forEach(content => {
      content.classList.add('hidden');
    });

    // Show the clicked tab's content
    const targetTabContent = document.getElementById(tab.id.replace('Tab', 'Content'));
    targetTabContent.classList.remove('hidden');

    // Activate the clicked tab and deactivate others
    tabs.forEach(t => {
      t.classList.remove('bg-gray-600', 'text-white');
    });
    tab.classList.add('bg-gray-600', 'text-white');
  });
});

// Check-In & Streak Tracking
const checkInButton = document.getElementById('checkInButton');
const streakCounter = document.getElementById('streakCounter');
const lastCheckInDate = document.getElementById('lastCheckInDate');

let checkInData = JSON.parse(localStorage.getItem('checkInData')) || { streak: 0, lastCheckIn: null };

function updateCheckInData() {
  const today = new Date().toISOString().split('T')[0];
  const lastCheckIn = new Date(checkInData.lastCheckIn);
  const todayDate = new Date(today);

  if (!checkInData.lastCheckIn || todayDate - lastCheckIn > 86400000) {
    checkInData.streak = todayDate.getDate() === lastCheckIn.getDate() + 1 ? checkInData.streak + 1 : 1;
  }
  checkInData.lastCheckIn = today;
  localStorage.setItem('checkInData', JSON.stringify(checkInData));

  streakCounter.textContent = `Streak: ${checkInData.streak} days`;
  lastCheckInDate.textContent = `Last Check-In: ${checkInData.lastCheckIn}`;
}

checkInButton.addEventListener('click', () => {
  updateCheckInData();
  alert('Workout logged!');
});

// Exercise Logging Tab Logic
const startWorkoutButton = document.getElementById('startWorkoutButton');
const workoutDetails = document.getElementById('workoutDetails');
const exerciseDropdown = document.getElementById('exerciseDropdown');
const logSetButton = document.getElementById('logSetButton');
const setNumberDisplay = document.getElementById('setNumber');
const loggedSetsDiv = document.getElementById('loggedSets');
const finishWorkoutButton = document.getElementById('finishWorkoutButton');

let currentSet = 1;
let currentExercise = "";

// Populate dropdown with exercises
const exercises = [
  "Bench Press", "Squat", "Deadlift", "Overhead Press", "Pull-Up", "Push-Up",
  "Lunges", "Bicep Curl", "Tricep Dips", "Leg Press", "Row", "Plank"
];

exercises.forEach(exercise => {
  const option = document.createElement('option');
  option.value = exercise;
  option.textContent = exercise;
  exerciseDropdown.appendChild(option);
});

// Reset the set number when switching exercises
exerciseDropdown.addEventListener('change', () => {
  if (exerciseDropdown.value !== currentExercise) {
    currentExercise = exerciseDropdown.value;  // Update current exercise
    currentSet = 1;  // Reset set number
    setNumberDisplay.textContent = `Set ${currentSet}`;
  }
});

// Start Workout
startWorkoutButton.addEventListener('click', () => {
  workoutDetails.classList.remove('hidden');  // Show workout details
  startWorkoutButton.classList.add('hidden');  // Hide the "Start Workout" button
  finishWorkoutButton.classList.remove('hidden');  // Show the Finish Workout button
});

// Log Set
logSetButton.addEventListener('click', () => {
  const selectedExercise = exerciseDropdown.value;
  const weight = document.getElementById('weightInput').value;
  const reps = document.getElementById('repsInput').value;

  if (selectedExercise && weight && reps) {
    const workoutLog = {
      exercise: selectedExercise,
      set: currentSet,
      weight: parseFloat(weight),
      reps: parseInt(reps),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    // Display the logged set immediately on the Exercise Logging tab
    const loggedSetItem = document.createElement('div');
    loggedSetItem.classList.add('bg-gray-600', 'p-4', 'rounded-lg', 'my-2');
    loggedSetItem.innerHTML = `
      <p class="text-lg">${workoutLog.exercise} - Set ${workoutLog.set}</p>
      <p>Weight: ${workoutLog.weight}kg, Reps: ${workoutLog.reps}</p>
      <p>Date: ${workoutLog.date}, Time: ${workoutLog.time}</p>
    `;
    loggedSetsDiv.appendChild(loggedSetItem);

    // Update the set counter and increase the set number
    currentSet++;
    setNumberDisplay.textContent = `Set ${currentSet}`;

    // Reset input fields
    document.getElementById('weightInput').value = '';
    document.getElementById('repsInput').value = '';
  } else {
    alert("Please select an exercise and fill in the weight and reps.");
  }
});

// Finish Workout Logic
finishWorkoutButton.addEventListener('click', () => {
  // Gather all logged sets
  const loggedSets = Array.from(loggedSetsDiv.children).map(setItem => {
    return {
      exercise: setItem.querySelector('p').textContent.split(' - ')[0],
      set: setItem.querySelector('p').textContent.split(' - ')[1].split(': ')[1],
      weight: parseFloat(setItem.querySelector('p').textContent.split('Weight: ')[1].split('kg')[0]),
      reps: parseInt(setItem.querySelector('p').textContent.split('Reps: ')[1]),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };
  });

  // Retrieve the existing workout history from localStorage and append the new sets
  let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
  workoutHistory.push(...loggedSets);

  // Save the updated history back to localStorage
  localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));

  // Clear the logged sets from the Exercise Logging tab
  loggedSetsDiv.innerHTML = '';

  // Reset Exercise Logging tab to "Start Workout" state
  startWorkoutButton.classList.remove('hidden');
  finishWorkoutButton.classList.add('hidden');
  workoutDetails.classList.add('hidden');

  // Update the History tab immediately to reflect the new workout
  displayWorkoutHistory();

  alert('Workout Finished and Logged!');
});

// Display Workout History in History Tab
function displayWorkoutHistory() {
  const workoutHistorySection = document.getElementById('workoutHistoryList');
  const workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];

  workoutHistorySection.innerHTML = '';  // Clear previous history

  if (workoutHistory.length === 0) {
    workoutHistorySection.innerHTML = "<p>No workout history available.</p>";
  }

  workoutHistory.forEach(workout => {
    const workoutItem = document.createElement('div');
    workoutItem.classList.add('mb-4', 'bg-gray-600', 'rounded-lg', 'p-4');
    workoutItem.innerHTML = `
      <h3 class="text-lg font-semibold">${workout.exercise} - Set ${workout.set}</h3>
      <p>Weight: ${workout.weight}kg, Reps: ${workout.reps}</p>
      <p>Date: ${workout.date}, Time: ${workout.time}</p>
    `;
    workoutHistorySection.appendChild(workoutItem);
  });
}

// Initial call to display workout history on "History" tab
displayWorkoutHistory();

// Progress Chart (mock data)
const progressChart = document.getElementById('progressChart').getContext('2d');
const chartData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [{
    label: 'Squat Progress (kg)',
    data: [50, 55, 60, 65], // Example data
    borderColor: 'rgb(75, 192, 192)',
    fill: false,
  }]
};

new Chart(progressChart, {
  type: 'line',
  data: chartData,
  options: {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Weeks'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Weight (kg)'
        }
      }
    }
  }
});
