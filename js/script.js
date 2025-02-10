async function fetchMilestones() {
    const response = await fetch('milestones.csv');
    const data = await response.text();
    const rows = data.split('\n').slice(1).map(row => {
    const [day, milestone, notes] = row.split(',');
    return { day, milestone, notes };
    });

    // Separate milestones for grafting and queen cell harvest
    return {
        grafting: rows.slice(0), // First three rows for grafting
    };
}

async function calculateDates() {
    const dateInput = document.getElementById('date').value;
    const dateType = document.querySelector('input[name="dateType"]:checked').value;
    const resultsDiv = document.getElementById('results');

    if (!dateInput) {
        resultsDiv.innerHTML = ''; // Clear results if no date is selected
        return;
    }

    const dateParts = dateInput.split('-'); // Assuming the input format is YYYY-MM-DD
    const selectedDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); // Month is 0-indexed
    selectedDate.setHours(0, 0, 0, 0); // Set time to midnight to avoid timezone issues
    const milestonesData = await fetchMilestones();
    let milestones = `<h4>Milestones for ${dateType === 'grafting' ? 'Grafting' : 'Queen Cell Harvest'} Date:</h4><table><tr><th>Day</th><th>Date</th><th>Weekday</th><th>Stage</th><th>Notes</th></tr>`;

    if (dateType === 'grafting') {
        // Calculate forward from grafting day
        milestonesData.grafting.forEach(({ day, milestone, notes }) => {
            const milestoneDate = new Date(selectedDate.getTime() + (day * 24 * 60 * 60 * 1000));
            milestones += `<tr><td>${day}</td><td>${milestoneDate.toLocaleDateString()}</td><td>${milestoneDate.toLocaleString('en-US', { weekday: 'long' })}</td><td>${(milestone === undefined) ? " " : milestone}</td><td>${(notes === undefined) ? " " : notes}</td></tr>`;
        });
    } else if (dateType === 'harvest') {
        // Calculate backward from queen cell harvest day
        milestonesData.grafting.forEach(({ day, milestone, notes }) => {
            const milestoneDate = new Date(selectedDate.getTime() + ((day - 11) * 24 * 60 * 60 * 1000));
            milestones += `<tr><td>${day}</td><td>${milestoneDate.toLocaleDateString()}</td><td>${milestoneDate.toLocaleString('en-US', { weekday: 'long' })}</td><td>${(milestone === undefined) ? " " : milestone}</td><td>${(notes === undefined) ? " " : notes}</td></tr>`;
        });
    }

    milestones += '</table>';
    resultsDiv.innerHTML = milestones; // Render the milestones
}
