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
const maxAttempts = 1; // Only 1 retry for maximum speed

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
        
        // Very lenient filter - only reject obvious non-educational content
        const shouldReject = checkIfShouldReject(data);
        
        // Only retry once if we should reject, otherwise show immediately
        if (shouldReject && attemptCount < maxAttempts) {
            attemptCount++;
            return fetchRandomArticle();
        }
        
        attemptCount = 0;
        
        // Fetch additional content for a longer summary
        try {
            const extendedContent = await fetchExtendedContent(data.title, data.pageid);
            if (extendedContent && extendedContent.length > data.extract.length) {
                data.extract = extendedContent;
            }
        } catch (extError) {
            console.log('Could not fetch extended content, using summary:', extError);
            // Continue with original extract if extended fetch fails
        }
        
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

async function fetchExtendedContent(title, pageid) {
    // Try multiple approaches to get the most comprehensive content
    
    // Approach 1: Try Wikipedia REST API HTML endpoint for full content
    try {
        const encodedTitle = encodeURIComponent(title);
        const htmlUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${encodedTitle}`;
        const htmlResponse = await fetch(htmlUrl);
        
        if (htmlResponse.ok) {
            const html = await htmlResponse.text();
            // Parse HTML to extract text content from all sections
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remove navigation, references, and other non-content elements
            const toRemove = doc.querySelectorAll('nav, .reference, .mw-references-wrap, .navbox, .infobox, .thumb, .mw-editsection, .mw-cite-backlink');
            toRemove.forEach(el => el.remove());
            
            // Get all paragraph content from all sections
            // Get main content area
            const mainContent = doc.querySelector('body') || doc;
            
            // Get all paragraphs, including those in sections
            const allParagraphs = Array.from(mainContent.querySelectorAll('p'))
                .map(p => {
                    // Get text content, handling nested elements
                    let text = p.textContent.trim();
                    // Remove citation numbers like [1], [2], etc.
                    text = text.replace(/\[\d+\]/g, '');
                    return text;
                })
                .filter(text => text.length > 50 && !text.match(/^\[edit\]$/i)) // Filter out very short paragraphs and edit links
                .filter((text, index, arr) => arr.indexOf(text) === index); // Remove duplicates
            
            const fullContent = allParagraphs.join('\n\n');
            
            if (fullContent && fullContent.length > 1000) {
                return fullContent;
            }
        }
    } catch (htmlError) {
        console.log('HTML fetch failed, trying extract API:', htmlError);
    }
    
    // Approach 2: Use MediaWiki API with maximum extract settings
    // Try to get as much content as possible
    const mwApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&pageids=${pageid}&prop=extracts&exintro=false&explaintext=true&exsectionformat=plain&exlimit=max&origin=*`;
    
    try {
        const mwResponse = await fetch(mwApiUrl);
        if (!mwResponse.ok) {
            throw new Error('MediaWiki API request failed');
        }
        
        const mwData = await mwResponse.json();
        if (mwData.query && mwData.query.pages && mwData.query.pages[pageid]) {
            const extract = mwData.query.pages[pageid].extract;
            if (extract && extract.trim().length > 0) {
                return extract;
            }
        }
    } catch (error) {
        console.log('Error fetching extended content:', error);
    }
    
    return null;
}

function checkIfShouldReject(data) {
    // Very lenient - only reject obvious non-educational content
    const text = (data.title + ' ' + (data.extract || '')).toLowerCase();
    
    // Only reject if it's clearly not educational (disambiguation, very short, etc.)
    const rejectPatterns = [
        'disambiguation',
        'list of',
        'category:',
        'template:',
        'file:',
        'user:',
        'wikipedia:',
        'help:'
    ];
    
    // Reject if title matches reject patterns
    const shouldReject = rejectPatterns.some(pattern => 
        data.title.toLowerCase().includes(pattern)
    );
    
    // Also reject if extract is too short (likely a stub)
    const isTooShort = !data.extract || data.extract.length < 100;
    
    // Reject biographical articles about specific individuals
    const isBiographical = checkIfBiographical(data);
    
    // Accept almost everything - only reject obvious non-content pages and biographies
    return shouldReject || (isTooShort && attemptCount === 0) || isBiographical;
}

function checkIfBiographical(data) {
    // Check if the article is about a specific individual (biography)
    const title = data.title;
    const extract = (data.extract || '').toLowerCase();
    const fullText = (title + ' ' + extract).toLowerCase();
    
    // Biographical indicators in the content
    const biographicalIndicators = [
        'was born',
        'was an',
        'is an',
        'is a',
        'born in',
        'died in',
        'died on',
        'lived from',
        'was a',
        'is known for',
        'was known for',
        'was the',
        'is the',
        'served as',
        'worked as',
        'attended',
        'graduated from',
        'married',
        'had children',
        'was married to',
        'was the son of',
        'was the daughter of',
        'was born to',
        'grew up in',
        'studied at',
        'received',
        'won the',
        'awarded',
        'career',
        'early life',
        'personal life',
        'later life',
        'death',
        'legacy'
    ];
    
    // Check if extract contains multiple biographical indicators (likely a biography)
    const biographicalCount = biographicalIndicators.filter(indicator => 
        extract.includes(indicator)
    ).length;
    
    // If 3 or more biographical indicators, it's likely a biography
    if (biographicalCount >= 3) {
        return true;
    }
    
    // Check if title looks like a person's name (First Last format, but not common phrases)
    // Simple heuristic: if title has 2-4 words and extract starts with biographical language
    const titleWords = title.split(' ').filter(w => w.length > 0);
    const looksLikeName = titleWords.length >= 2 && titleWords.length <= 4;
    
    // If it looks like a name AND has biographical content, reject it
    if (looksLikeName && biographicalCount >= 2) {
        return true;
    }
    
    // Check for very strong biographical opening (most biographies start this way)
    const strongBiographicalStart = extract.match(/^(was|is|born|died|lived|served|worked|studied|received|won|awarded)/);
    if (strongBiographicalStart && looksLikeName) {
        return true;
    }
    
    return false;
}

function formatSummaryAsResearchArticle(paragraphs, container) {
    if (paragraphs.length === 0) return;
    
    // Introduction Section - State what the topic is and why it's interesting
    const introSection = document.createElement('div');
    introSection.className = 'summary-section';
    const introH3 = document.createElement('h3');
    introH3.textContent = 'Introduction';
    introSection.appendChild(introH3);
    
    const introP = document.createElement('p');
    introP.textContent = paragraphs[0].trim();
    introSection.appendChild(introP);
    container.appendChild(introSection);
    
    // If there's only one paragraph, we're done
    if (paragraphs.length === 1) return;
    
    // Remaining paragraphs organized into research article sections
    // Since we limit to 4 paragraphs max, we'll have at most 3 remaining
    let remainingParagraphs = paragraphs.slice(1);
    
    // Simplified logic for shorter summaries (max 4 paragraphs total)
    // 1 paragraph: Introduction only (already done)
    // 2 paragraphs: Introduction + Key Concepts
    // 3 paragraphs: Introduction + Key Concepts + Important Information
    // 4 paragraphs: Introduction + Key Concepts + Important Information + Significance
    
    if (remainingParagraphs.length >= 1) {
        // Key Concepts and Methods Section
        const methodSection = document.createElement('div');
        methodSection.className = 'summary-section';
        const methodH3 = document.createElement('h3');
        methodH3.textContent = 'Key Concepts and Methods';
        methodSection.appendChild(methodH3);
        const methodP = document.createElement('p');
        methodP.textContent = remainingParagraphs[0].trim();
        methodSection.appendChild(methodP);
        container.appendChild(methodSection);
    }
    
    if (remainingParagraphs.length >= 2) {
        // Important Information and Findings Section
        const resultsSection = document.createElement('div');
        resultsSection.className = 'summary-section';
        const resultsH3 = document.createElement('h3');
        resultsH3.textContent = 'Important Information and Findings';
        resultsSection.appendChild(resultsH3);
        const resultsP = document.createElement('p');
        resultsP.textContent = remainingParagraphs[1].trim();
        resultsSection.appendChild(resultsP);
        container.appendChild(resultsSection);
    }
    
    if (remainingParagraphs.length >= 3) {
        // Significance and Implications Section
        const discussionSection = document.createElement('div');
        discussionSection.className = 'summary-section';
        const discussionH3 = document.createElement('h3');
        discussionH3.textContent = 'Significance and Implications';
        discussionSection.appendChild(discussionH3);
        const discussionP = document.createElement('p');
        discussionP.textContent = remainingParagraphs[2].trim();
        discussionSection.appendChild(discussionP);
        container.appendChild(discussionSection);
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
        let paragraphs = data.extract.split('\n\n').filter(p => p.trim().length > 0);
        
        // Limit to maximum 4 paragraphs for a shorter, more concise summary
        paragraphs = paragraphs.slice(0, 4);
        
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

