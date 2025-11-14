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
    // Use MediaWiki API to get the full article extract with maximum content
    // exintro=false means include all sections, not just intro
    // explaintext=true gives plain text without HTML
    // exsectionformat=plain ensures sections are preserved
    // exlimit=max tries to get maximum content (though API may still limit very long articles)
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
    
    // Accept almost everything - only reject obvious non-content pages
    return shouldReject || (isTooShort && attemptCount === 0);
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
    // Format: Introduction, Key Concepts and Methods, Important Information and Findings, Significance and Implications
    let remainingParagraphs = paragraphs.slice(1);
    
    // Determine how to distribute paragraphs across sections
    const totalRemaining = remainingParagraphs.length;
    
    if (totalRemaining >= 8) {
        // Eight or more paragraphs: distribute across five sections for maximum depth
        const paragraphsPerSection = Math.floor(totalRemaining / 5);
        const remainder = totalRemaining % 5;
        
        // Key Concepts and Methods Section (first section)
        const methodStart = 0;
        const methodEnd = paragraphsPerSection + (remainder > 0 ? 1 : 0);
        const methodParagraphs = remainingParagraphs.slice(methodStart, methodEnd);
        
        if (methodParagraphs.length > 0) {
            const methodSection = document.createElement('div');
            methodSection.className = 'summary-section';
            const methodH3 = document.createElement('h3');
            methodH3.textContent = 'Key Concepts and Methods';
            methodSection.appendChild(methodH3);
            
            methodParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                methodSection.appendChild(p);
            });
            
            container.appendChild(methodSection);
        }
        
        // Important Information and Findings Section (second section)
        const resultsStart = methodEnd;
        const resultsEnd = resultsStart + paragraphsPerSection + (remainder > 1 ? 1 : 0);
        const resultsParagraphs = remainingParagraphs.slice(resultsStart, resultsEnd);
        
        if (resultsParagraphs.length > 0) {
            const resultsSection = document.createElement('div');
            resultsSection.className = 'summary-section';
            const resultsH3 = document.createElement('h3');
            resultsH3.textContent = 'Important Information and Findings';
            resultsSection.appendChild(resultsH3);
            
            resultsParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                resultsSection.appendChild(p);
            });
            
            container.appendChild(resultsSection);
        }
        
        // Significance and Implications Section (third section)
        const discussionStart = resultsEnd;
        const discussionEnd = discussionStart + paragraphsPerSection + (remainder > 2 ? 1 : 0);
        const discussionParagraphs = remainingParagraphs.slice(discussionStart, discussionEnd);
        
        if (discussionParagraphs.length > 0) {
            const discussionSection = document.createElement('div');
            discussionSection.className = 'summary-section';
            const discussionH3 = document.createElement('h3');
            discussionH3.textContent = 'Significance and Implications';
            discussionSection.appendChild(discussionH3);
            
            discussionParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                discussionSection.appendChild(p);
            });
            
            container.appendChild(discussionSection);
        }
        
        // More Details Section (fourth section)
        const detailsStart = discussionEnd;
        const detailsEnd = detailsStart + paragraphsPerSection + (remainder > 3 ? 1 : 0);
        const detailsParagraphs = remainingParagraphs.slice(detailsStart, detailsEnd);
        
        if (detailsParagraphs.length > 0) {
            const detailsSection = document.createElement('div');
            detailsSection.className = 'summary-section';
            const detailsH3 = document.createElement('h3');
            detailsH3.textContent = 'More Details';
            detailsSection.appendChild(detailsH3);
            
            detailsParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                detailsSection.appendChild(p);
            });
            
            container.appendChild(detailsSection);
        }
        
        // Additional Context and Analysis Section (remaining paragraphs for maximum depth)
        const additionalParagraphs = remainingParagraphs.slice(detailsEnd);
        
        if (additionalParagraphs.length > 0) {
            const additionalSection = document.createElement('div');
            additionalSection.className = 'summary-section';
            const additionalH3 = document.createElement('h3');
            additionalH3.textContent = 'Additional Context and Analysis';
            additionalSection.appendChild(additionalH3);
            
            additionalParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                additionalSection.appendChild(p);
            });
            
            container.appendChild(additionalSection);
        }
    } else if (totalRemaining >= 5) {
        // Five to seven paragraphs: distribute across four sections including More Details
        const paragraphsPerSection = Math.floor(totalRemaining / 4);
        const remainder = totalRemaining % 4;
        
        // Key Concepts and Methods Section
        const methodStart = 0;
        const methodEnd = paragraphsPerSection + (remainder > 0 ? 1 : 0);
        const methodParagraphs = remainingParagraphs.slice(methodStart, methodEnd);
        
        if (methodParagraphs.length > 0) {
            const methodSection = document.createElement('div');
            methodSection.className = 'summary-section';
            const methodH3 = document.createElement('h3');
            methodH3.textContent = 'Key Concepts and Methods';
            methodSection.appendChild(methodH3);
            
            methodParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                methodSection.appendChild(p);
            });
            
            container.appendChild(methodSection);
        }
        
        // Important Information and Findings Section
        const resultsStart = methodEnd;
        const resultsEnd = resultsStart + paragraphsPerSection + (remainder > 1 ? 1 : 0);
        const resultsParagraphs = remainingParagraphs.slice(resultsStart, resultsEnd);
        
        if (resultsParagraphs.length > 0) {
            const resultsSection = document.createElement('div');
            resultsSection.className = 'summary-section';
            const resultsH3 = document.createElement('h3');
            resultsH3.textContent = 'Important Information and Findings';
            resultsSection.appendChild(resultsH3);
            
            resultsParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                resultsSection.appendChild(p);
            });
            
            container.appendChild(resultsSection);
        }
        
        // Significance and Implications Section
        const discussionStart = resultsEnd;
        const discussionEnd = discussionStart + paragraphsPerSection + (remainder > 2 ? 1 : 0);
        const discussionParagraphs = remainingParagraphs.slice(discussionStart, discussionEnd);
        
        if (discussionParagraphs.length > 0) {
            const discussionSection = document.createElement('div');
            discussionSection.className = 'summary-section';
            const discussionH3 = document.createElement('h3');
            discussionH3.textContent = 'Significance and Implications';
            discussionSection.appendChild(discussionH3);
            
            discussionParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                discussionSection.appendChild(p);
            });
            
            container.appendChild(discussionSection);
        }
        
        // More Details Section
        const detailsParagraphs = remainingParagraphs.slice(discussionEnd);
        
        if (detailsParagraphs.length > 0) {
            const detailsSection = document.createElement('div');
            detailsSection.className = 'summary-section';
            const detailsH3 = document.createElement('h3');
            detailsH3.textContent = 'More Details';
            detailsSection.appendChild(detailsH3);
            
            detailsParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                detailsSection.appendChild(p);
            });
            
            container.appendChild(detailsSection);
        }
    } else if (totalRemaining >= 4) {
        // Four paragraphs: distribute across three sections
        const paragraphsPerSection = Math.floor(totalRemaining / 3);
        const remainder = totalRemaining % 3;
        
        // Key Concepts and Methods Section
        const methodStart = 0;
        const methodEnd = paragraphsPerSection + (remainder > 0 ? 1 : 0);
        const methodParagraphs = remainingParagraphs.slice(methodStart, methodEnd);
        
        if (methodParagraphs.length > 0) {
            const methodSection = document.createElement('div');
            methodSection.className = 'summary-section';
            const methodH3 = document.createElement('h3');
            methodH3.textContent = 'Key Concepts and Methods';
            methodSection.appendChild(methodH3);
            
            methodParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                methodSection.appendChild(p);
            });
            
            container.appendChild(methodSection);
        }
        
        // Important Information and Findings Section
        const resultsStart = methodEnd;
        const resultsEnd = resultsStart + paragraphsPerSection + (remainder > 1 ? 1 : 0);
        const resultsParagraphs = remainingParagraphs.slice(resultsStart, resultsEnd);
        
        if (resultsParagraphs.length > 0) {
            const resultsSection = document.createElement('div');
            resultsSection.className = 'summary-section';
            const resultsH3 = document.createElement('h3');
            resultsH3.textContent = 'Important Information and Findings';
            resultsSection.appendChild(resultsH3);
            
            resultsParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                resultsSection.appendChild(p);
            });
            
            container.appendChild(resultsSection);
        }
        
        // Significance and Implications Section
        const discussionParagraphs = remainingParagraphs.slice(resultsEnd);
        
        if (discussionParagraphs.length > 0) {
            const discussionSection = document.createElement('div');
            discussionSection.className = 'summary-section';
            const discussionH3 = document.createElement('h3');
            discussionH3.textContent = 'Significance and Implications';
            discussionSection.appendChild(discussionH3);
            
            discussionParagraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para.trim();
                discussionSection.appendChild(p);
            });
            
            container.appendChild(discussionSection);
        }
    } else if (totalRemaining === 3) {
        // Three paragraphs: one for each section
        const methodSection = document.createElement('div');
        methodSection.className = 'summary-section';
        const methodH3 = document.createElement('h3');
        methodH3.textContent = 'Key Concepts and Methods';
        methodSection.appendChild(methodH3);
        const methodP = document.createElement('p');
        methodP.textContent = remainingParagraphs[0].trim();
        methodSection.appendChild(methodP);
        container.appendChild(methodSection);
        
        const resultsSection = document.createElement('div');
        resultsSection.className = 'summary-section';
        const resultsH3 = document.createElement('h3');
        resultsH3.textContent = 'Important Information and Findings';
        resultsSection.appendChild(resultsH3);
        const resultsP = document.createElement('p');
        resultsP.textContent = remainingParagraphs[1].trim();
        resultsSection.appendChild(resultsP);
        container.appendChild(resultsSection);
        
        const discussionSection = document.createElement('div');
        discussionSection.className = 'summary-section';
        const discussionH3 = document.createElement('h3');
        discussionH3.textContent = 'Significance and Implications';
        discussionSection.appendChild(discussionH3);
        const discussionP = document.createElement('p');
        discussionP.textContent = remainingParagraphs[2].trim();
        discussionSection.appendChild(discussionP);
        container.appendChild(discussionSection);
    } else if (totalRemaining === 2) {
        // Two paragraphs: Key Concepts and Methods, Important Information and Findings
        const methodSection = document.createElement('div');
        methodSection.className = 'summary-section';
        const methodH3 = document.createElement('h3');
        methodH3.textContent = 'Key Concepts and Methods';
        methodSection.appendChild(methodH3);
        const methodP = document.createElement('p');
        methodP.textContent = remainingParagraphs[0].trim();
        methodSection.appendChild(methodP);
        container.appendChild(methodSection);
        
        const resultsSection = document.createElement('div');
        resultsSection.className = 'summary-section';
        const resultsH3 = document.createElement('h3');
        resultsH3.textContent = 'Important Information and Findings';
        resultsSection.appendChild(resultsH3);
        const resultsP = document.createElement('p');
        resultsP.textContent = remainingParagraphs[1].trim();
        resultsSection.appendChild(resultsP);
        container.appendChild(resultsSection);
    } else {
        // One remaining paragraph: Key Concepts and Methods
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

