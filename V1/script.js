// Maak een object om de geselecteerde waarden voor elke categorie bij te houden
let userSelections = {
    strength: [],
    weakness: [],
    skill: []
};

// Toggle de selectie van een knop
function toggleSelection(type, value) {
    // Zoek de knop op basis van de categorie (type) en waarde
    const button = document.querySelector(`button[data-type="${type}"][data-value="${value}"]`);

    // Als de waarde al geselecteerd is, verwijder deze
    if (userSelections[type].includes(value)) {
        userSelections[type] = userSelections[type].filter(item => item !== value);
        button.classList.remove('selected'); // Verwijder de 'selected' stijl
    } else {
        // Anders voeg de waarde toe aan de selectie
        userSelections[type].push(value);
        button.classList.add('selected'); // Voeg de 'selected' stijl toe
    }

    console.log(userSelections); // Optioneel: om de geselecteerde waarden in de console te zien
}

// Functie om de stijl van de knoppen bij te werken op basis van selectie
function updateButtonStyles(type, value) {
    const button = document.querySelector(`button[data-type="${type}"][data-value="${value}"]`);
    if (button) {
        // Voeg de 'selected' en 'active' klasse toe als de waarde is geselecteerd
        if (userSelections[type].includes(value)) {
            button.classList.add('selected', 'active');
        } else {
            button.classList.remove('selected', 'active');
        }
    }
}

// Functie om de beste match te vinden
function findBestMatch() {
    const userStrengths = userSelections.strength;
    const userWeaknesses = userSelections.weakness;
    const userSkills = userSelections.skill;

    let bestMatch = '';
    let highestMatchPercentage = 0;
    let results = [];

    fetch('jobs.json') 
        .then(response => response.json())
        .then(jobs => {
            jobs.forEach(job => {
                const jobStrengths = job.Strengths.toLowerCase().split(', ').map(s => s.trim());
                let jobWeaknessesExclusion = [];
                if (typeof job.WeaknessesExclusion === 'string') {
                    jobWeaknessesExclusion = job.WeaknessesExclusion.toLowerCase().split(', ').map(w => w.trim());
                } else if (Array.isArray(job.WeaknessesExclusion)) {
                    jobWeaknessesExclusion = job.WeaknessesExclusion.map(w => w.toLowerCase().trim());
                }

                const hasExcludedWeakness = userWeaknesses.some(weakness => jobWeaknessesExclusion.includes(weakness));
                if (hasExcludedWeakness) {
                    return; // Skip deze baan
                }

                const jobSkills = job.Skills.toLowerCase().split(', ').map(s => s.trim());

                let matchCount = 0;
                let totalCount = jobStrengths.length + jobWeaknessesExclusion.length + jobSkills.length;

                // Vergelijk strengths
                jobStrengths.forEach(strength => {
                    if (userStrengths.includes(strength)) matchCount++;
                });

                // Vergelijk skills
                jobSkills.forEach(skill => {
                    if (userSkills.includes(skill)) matchCount++;
                });

                const matchPercentage = (matchCount / totalCount) * 100;

                if (matchPercentage > highestMatchPercentage) {
                    highestMatchPercentage = matchPercentage;
                    bestMatch = job.Carrièremogelijkheid;
                }

                results.push({
                    job: job.Carrièremogelijkheid,
                    matchPercentage: matchPercentage
                });
            });

            // Sorteer de resultaten op percentage
            results.sort((a, b) => b.matchPercentage - a.matchPercentage);

            let resultsHTML = `<h3>Beste match: ${bestMatch} (${highestMatchPercentage.toFixed(2)}%)</h3>`;
            results.forEach(result => {
                resultsHTML += `<p>${result.job}: ${result.matchPercentage.toFixed(2)}% overeenstemming</p>`;
            });

            // Toon de resultaten
            document.getElementById('results').innerHTML = resultsHTML;
        })
        .catch(error => {
            console.error('Fout bij het inladen van het JSON-bestand:', error);
        });
}