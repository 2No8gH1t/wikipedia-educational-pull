const fetchBtn = document.getElementById('fetchBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const articleContainer = document.getElementById('articleContainer');
const articleTitle = document.getElementById('articleTitle');
const articleLink = document.getElementById('articleLink');
const articleImage = document.getElementById('articleImage');
const articleSummary = document.getElementById('articleSummary');
const pageId = document.getElementById('pageId');
const lastModified = document.getElementById('lastModified');
const errorMessage = document.getElementById('errorMessage');

// List of educational categories to filter random articles
const educationalCategories = [
    'Education',
    'Science',
    'History',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Geography',
    'Literature',
    'Philosophy',
    'Technology',
    'Medicine',
    'Engineering',
    'Art',
    'Music',
    'Architecture',
    'Astronomy',
    'Psychology',
    'Sociology',
    'Anthropology',
    'Economics',
    'Political Science',
    'Linguistics',
    'Archaeology',
    'Geology',
    'Meteorology',
    'Oceanography',
    'Botany',
    'Zoology',
    'Neuroscience',
    'Computer Science',
    'Environmental Science',
    'Astrophysics',
    'Biochemistry',
    'Genetics',
    'Paleontology',
    'Theology',
    'Mythology',
    'Classical Studies',
    'Cultural Studies',
    'Film Studies',
    'Theater',
    'Dance',
    'Photography',
    'Design',
    'Fashion',
    'Culinary Arts',
    'Sports Science',
    'Public Health',
    'Epidemiology',
    'Veterinary Medicine',
    'Dentistry',
    'Nursing',
    'Pharmacy',
    'Law',
    'Business',
    'Finance',
    'Marketing',
    'Journalism',
    'Communication',
    'Media Studies',
    'International Relations',
    'Military History',
    'World War',
    'Ancient History',
    'Medieval History',
    'Renaissance',
    'Industrial Revolution',
    'Space Exploration',
    'Invention',
    'Innovation',
    'Biography',
    'Autobiography',
    'Memoir'
];

let attemptCount = 0;
const maxAttempts = 3; // Reduced from 10 to 3 for faster loading

async function fetchRandomArticle() {
    // Show loading state
    fetchBtn.disabled = true;
    btnText.textContent = 'Loading...';
    btnLoader.classList.remove('hidden');
    articleContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    
    try {
        // Use Wikipedia's REST API to get a random article
        // The /page/random/summary endpoint returns a random article with summary
        const response = await fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check if the article seems educational (more lenient filter)
        const isLikelyEducational = checkIfEducational(data);
        
        // Accept article if educational OR if we've tried multiple times (show something rather than keep retrying)
        if (!isLikelyEducational && attemptCount < maxAttempts) {
            attemptCount++;
            // Retry if not educational
            return fetchRandomArticle();
        }
        
        attemptCount = 0;
        
        // Display the article
        displayArticle(data);
        
    } catch (error) {
        console.error('Error fetching article:', error);
        errorMessage.textContent = `Error loading article: ${error.message}. Please try again.`;
        errorMessage.classList.remove('hidden');
    } finally {
        // Reset button state
        fetchBtn.disabled = false;
        btnText.textContent = 'Get Random Article';
        btnLoader.classList.add('hidden');
    }
}

function checkIfEducational(data) {
    // More comprehensive check using the educational categories list
    const text = (data.title + ' ' + (data.extract || '')).toLowerCase();
    
    // Check against the full educational categories list
    const categoryMatch = educationalCategories.some(category => 
        text.includes(category.toLowerCase())
    );
    
    // Also check for common educational keywords (more lenient)
    const educationalKeywords = [
        'education', 'learn', 'study', 'science', 'history', 'mathematics',
        'physics', 'chemistry', 'biology', 'geography', 'literature',
        'philosophy', 'technology', 'medicine', 'engineering', 'art',
        'music', 'theory', 'concept', 'principle', 'method', 'system',
        'research', 'academic', 'scholar', 'university', 'college', 'school',
        'discovery', 'invention', 'analysis', 'study', 'field', 'discipline',
        'knowledge', 'information', 'fact', 'data', 'evidence', 'study'
    ];
    
    const keywordMatch = educationalKeywords.some(keyword => text.includes(keyword));
    
    // Accept if it matches categories OR keywords (more lenient)
    // Also accept if extract is substantial (likely educational content)
    const hasSubstantialContent = data.extract && data.extract.length > 200;
    
    return categoryMatch || keywordMatch || hasSubstantialContent;
}

function formatSummaryAsResearchArticle(paragraphs, container) {
    if (paragraphs.length === 0) return;
    
    // First paragraph is the introduction/overview - format as highlighted intro
    const introDiv = document.createElement('div');
    introDiv.className = 'summary-highlight';
    const introP = document.createElement('p');
    introP.textContent = paragraphs[0].trim();
    introDiv.appendChild(introP);
    container.appendChild(introDiv);
    
    // If there's only one paragraph, we're done
    if (paragraphs.length === 1) return;
    
    // Remaining paragraphs organized into sections
    let remainingParagraphs = paragraphs.slice(1);
    
    // Determine content structure based on paragraph count and content
    if (remainingParagraphs.length >= 3) {
        // Three or more paragraphs: create structured sections
        
        // Overview/Background section (middle paragraphs)
        const midPoint = Math.floor(remainingParagraphs.length / 2);
        const overviewParagraphs = remainingParagraphs.slice(0, midPoint);
        
        if (overviewParagraphs.length > 0) {
            const overviewSection = document.createElement('div');
            overviewSection.className = 'summary-section';
            const overviewH3 = document.createElement('h3');
            overviewH3.textContent = 'Overview and Key Concepts';
            overviewSection.appendChild(overviewH3);
            
            overviewParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                overviewSection.appendChild(p);
            });
            
            container.appendChild(overviewSection);
        }
        
        // Significance/Findings section (remaining paragraphs)
        const findingsParagraphs = remainingParagraphs.slice(midPoint);
        
        if (findingsParagraphs.length > 0) {
            const findingsSection = document.createElement('div');
            findingsSection.className = 'summary-section';
            const findingsH3 = document.createElement('h3');
            findingsH3.textContent = 'Significance and Implications';
            findingsSection.appendChild(findingsH3);
            
            findingsParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                findingsSection.appendChild(p);
            });
            
            container.appendChild(findingsSection);
        }
    } else {
        // Fewer paragraphs: format as simple paragraphs with a "Details" section
        const detailsSection = document.createElement('div');
        detailsSection.className = 'summary-section';
        const detailsH3 = document.createElement('h3');
        detailsH3.textContent = 'Key Information';
        detailsSection.appendChild(detailsH3);
        
        remainingParagraphs.forEach(para => {
            const p = document.createElement('p');
            p.textContent = para.trim();
            detailsSection.appendChild(p);
        });
        
        container.appendChild(detailsSection);
    }
}

function displayArticle(data) {
    // Set title
    articleTitle.textContent = data.title;
    
    // Set Wikipedia link
    if (data.content_urls && data.content_urls.desktop) {
        articleLink.href = data.content_urls.desktop.page;
    } else {
        articleLink.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`;
    }
    
    // Set image if available
    if (data.thumbnail && data.thumbnail.source) {
        articleImage.src = data.thumbnail.source;
        articleImage.alt = data.title;
        articleImage.classList.remove('hidden');
    } else {
        articleImage.classList.add('hidden');
    }
    
    // Set summary with proper research article format
    if (data.extract) {
        // Split by double newlines to preserve paragraphs
        const paragraphs = data.extract.split('\n\n').filter(p => p.trim().length > 0);
        
        // Clear previous content
        articleSummary.innerHTML = '';
        
        // Format the summary following research article structure
        formatSummaryAsResearchArticle(paragraphs, articleSummary);
    } else {
        articleSummary.innerHTML = '<p>No summary available for this article.</p>';
    }
    
    // Set metadata
    if (data.pageid) {
        pageId.textContent = data.pageid;
    }
    
    if (data.timestamp) {
        const date = new Date(data.timestamp);
        lastModified.textContent = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    // Show article container
    articleContainer.classList.remove('hidden');
    
    // Scroll to article
    articleContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Event listener
fetchBtn.addEventListener('click', fetchRandomArticle);

// Fetch an article on page load
window.addEventListener('load', () => {
    fetchRandomArticle();
});

