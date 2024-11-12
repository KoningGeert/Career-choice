function findBestMatch() {
    const userStrengths = document.getElementById('strengths').value.split(',').map(s => s.trim().toLowerCase());
    const userWeaknesses = document.getElementById('weaknesses').value.split(',').map(w => w.trim().toLowerCase());
    const userSkills = document.getElementById('skills').value.split(',').map(s => s.trim().toLowerCase());

    let bestMatch = '';
    let highestMatchPercentage = 0;
    let results = [];

    fetch('jobs.json') 
        .then(response => response.json())
        .then(jobs => {
            jobs.forEach(job => {
                const jobStrengths = job.Strengths.toLowerCase().split(', ').map(s => s.trim());

                // Controleer of WeaknessesExclusion een string of array is
                let jobWeaknessesExclusion = [];
                if (typeof job.WeaknessesExclusion === 'string') {
                    jobWeaknessesExclusion = job.WeaknessesExclusion.toLowerCase().split(', ').map(w => w.trim());
                } else if (Array.isArray(job.WeaknessesExclusion)) {
                    jobWeaknessesExclusion = job.WeaknessesExclusion.map(w => w.toLowerCase().trim());
                }

                // Controleer of de gebruiker een zwakte heeft die overeenkomt met de WeaknessesExclusion van de job
                const hasExcludedWeakness = userWeaknesses.some(weakness => jobWeaknessesExclusion.includes(weakness));

                // Als de job een uitgesloten zwakte heeft, sla de job dan over
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

                // Vergelijk weaknesses (let op, we vergelijken niet de uitgesloten weaknessexclusion meer)
                userWeaknesses.forEach(weakness => {
                    if (!jobWeaknessesExclusion.includes(weakness)) {
                        // Als het geen uitgesloten zwakte is, telt het mee
                        if (jobWeaknessesExclusion.includes(weakness)) matchCount++;
                    }
                });

                // Vergelijk skills
                jobSkills.forEach(skill => {
                    if (userSkills.includes(skill)) matchCount++;
                });

                // Bereken overeenkomstpercentage
                const matchPercentage = (matchCount / totalCount) * 100;

                // Sla de hoogste overeenkomst op
                if (matchPercentage > highestMatchPercentage) {
                    highestMatchPercentage = matchPercentage;
                    bestMatch = job.Carrièremogelijkheid;
                }

                // Voeg resultaat toe aan een array in plaats van meteen naar de HTML
                results.push({
                    job: job.Carrièremogelijkheid,
                    matchPercentage: matchPercentage
                });
            });

            // Sorteer de resultaten op percentage van hoog naar laag
            results.sort((a, b) => b.matchPercentage - a.matchPercentage);

            // Toon de resultaten
            let resultsHTML = `<h3>Beste match: ${bestMatch} (${highestMatchPercentage.toFixed(2)}%)</h3>`;
            results.forEach(result => {
                resultsHTML += `<p>${result.job}: ${result.matchPercentage.toFixed(2)}% overeenstemming</p>`;
            });

            // Update de resultaten op de pagina
            document.getElementById('results').innerHTML = resultsHTML;
        })
        .catch(error => {
            console.error('Fout bij het inladen van het JSON-bestand:', error);
        });
}
