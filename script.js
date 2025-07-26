const GITHUB_USERNAME = 'omar00010';

async function loadProjects() {
    const container = document.getElementById('projects-container');
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        const repos = await response.json();
        
        // Show only repos with descriptions, sorted by stars
        const filteredRepos = repos
            .filter(repo => !repo.fork && repo.description)
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3);
        
        if (filteredRepos.length === 0) {
            container.innerHTML = '<div class="no-projects">No projects found.</div>';
            return;
        }
        
        // Get languages for each repo and create cards
        const projectCards = await Promise.all(
            filteredRepos.map(async (repo) => {
                const languages = await fetchRepoLanguages(repo.languages_url);
                return createProjectCard(repo, languages);
            })
        );
        
        container.innerHTML = projectCards.join('');
        
    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = '<div class="error">Failed to load projects. Please try again later.</div>';
    }
}

async function fetchRepoLanguages(languagesUrl) {
    try {
        const response = await fetch(languagesUrl);
        if (!response.ok) return {};
        return await response.json();
    } catch (error) {
        console.error('Error fetching languages:', error);
        return {};
    }
}

function createProjectCard(repo, languages = {}) {
    // Get top 2 languages
    const languageEntries = Object.entries(languages);
    const topLanguages = languageEntries
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([lang]) => `<span class="language">${lang}</span>`)
        .join('');
    
    const stars = repo.stargazers_count > 0 ? `<span class="stars">⭐ ${repo.stargazers_count}</span>` : '';
    const lastUpdated = new Date(repo.updated_at).toLocaleDateString();
    
    // Get topics from repository
    const topics = repo.topics && repo.topics.length > 0 
        ? `<div class="topics">${repo.topics.slice(0, 4).map(topic => `<span class="topic">${topic}</span>`).join('')}</div>`
        : '';
    
    return `
        <div class="project-card">
            <div class="project-header">
                <h3 class="project-title">
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                </h3>
                <div class="project-meta">
                    ${topLanguages}
                    ${stars}
                </div>
            </div>
            <p class="project-description">${repo.description}</p>
            ${topics}
            <div class="project-footer">
                <span class="updated">Updated ${lastUpdated}</span>
                ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="demo-link">Live Demo</a>` : ''}
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadProjects);
