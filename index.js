
document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;
        const brightnessToggle = document.getElementById('brightness-toggle');

        // --- DATA INITIALIZATION FROM HTML ---
        const data = {
            videos: Array.from(document.querySelectorAll('#video-data-source > div')).map(el => ({
                id: el.dataset.id,
                title: el.dataset.title,
                downloadUrl: el.dataset.downloadUrl
            })),
            images: {
                teamA: Array.from(document.querySelectorAll('#image-data-source-a > div')).map(el => ({
                    src: el.dataset.src,
                    title: el.dataset.title
                })),
                teamB: Array.from(document.querySelectorAll('#image-data-source-b > div')).map(el => ({
                    src: el.dataset.src,
                    title: el.dataset.title
                })),
                templates: Array.from(document.querySelectorAll('#image-data-source-templates > div')).map(el => ({
                    src: el.dataset.src,
                    title: el.dataset.title
                }))
            }
        };

        // --- CORE FUNCTIONS ---
        const setActivePage = id => {
            document.querySelectorAll('.nav-item[data-target]').forEach(n => n.classList.toggle('active', n.dataset.target === id));
            document.querySelectorAll('.content-section').forEach(s => s.classList.toggle('hidden', s.id !== id));
            window.scrollTo(0, 0);
        };

        // Theme Control
        const applyTheme = (theme) => {
            body.classList.toggle('dark-mode', theme === 'dark-mode');
            brightnessToggle.checked = (theme === 'dark-mode');
        };
        brightnessToggle.addEventListener('change', () => {
            const isDarkMode = body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDarkMode ? 'dark-mode' : 'light');
        });

        // --- LANDING PAGE SLIDER ---
        const landingSlider = document.getElementById('image-slider');
        if (landingSlider) {
            const slides = landingSlider.querySelectorAll('.landing-slide');
            const dotsContainer = document.getElementById('slider-dots');
            let currentSlide = 0, interval;
            const showSlide = i => {
                slides.forEach((slide, index) => slide.classList.toggle('active', index === i));
                if (dotsContainer.children.length > 0) {
                    [...dotsContainer.children].forEach((dot, index) => dot.classList.toggle('active', index === i));
                }
                currentSlide = i;
            };
            const nextSlide = () => showSlide((currentSlide + 1) % slides.length);
            const resetInterval = () => { clearInterval(interval); interval = setInterval(nextSlide, 5000); };
            slides.forEach((_, i) => { const dot = document.createElement('span'); dot.className = 'dot'; dot.addEventListener('click', () => { showSlide(i); resetInterval(); }); dotsContainer.appendChild(dot); });
            document.getElementById('prev-slide').addEventListener('click', () => { nextSlide(); resetInterval(); });
            document.getElementById('next-slide').addEventListener('click', () => { nextSlide(); resetInterval(); });
            showSlide(0); resetInterval();
        }

      
    // --- CALENDAR & EVENT MANAGEMENT ---
        const calendarNav = document.getElementById('calendar-nav');
        const calendarBody = document.getElementById('calendar-body');
        const eventModal = document.getElementById('event-modal');
        const modalTitle = document.getElementById('modal-title');
        const eventInput = document.getElementById('event-input');
        const saveEventBtn = document.getElementById('save-event-btn');
        const cancelEventBtn = document.getElementById('cancel-event-btn');
        let displayedDate;
        let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
        let currentEditingEvent = null;

        const getPngDate = () => {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            return new Date(utc + (3600000 * 10)); // UTC+10 for PNG
        };
        
        const saveEvents = () => localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        const openEventModal = (date, event = null) => {
            body.classList.add('modal-open');
            eventModal.classList.remove('hidden');
            eventInput.value = event ? event.text : '';
            modalTitle.textContent = event ? 'Edit Event' : 'Add Event';
            currentEditingEvent = { date, id: event ? event.id : Date.now() };
            eventInput.focus();
        };

        const closeEventModal = () => {
            body.classList.remove('modal-open');
            eventModal.classList.add('hidden');
            currentEditingEvent = null;
        };
        
        saveEventBtn.addEventListener('click', () => {
            const text = eventInput.value.trim();
            if (!text || !currentEditingEvent) return;
            const { date, id } = currentEditingEvent;
            if (!events[date]) events[date] = [];
            
            const eventIndex = events[date].findIndex(e => e.id === id);
            if(eventIndex > -1) {
                events[date][eventIndex].text = text;
            } else {
                events[date].push({ id, text });
            }
            saveEvents();
            generateCalendar(displayedDate);
            closeEventModal();
        });

        cancelEventBtn.addEventListener('click', closeEventModal);
        
        const generateCalendar = (date) => {
            calendarBody.innerHTML = '';
            const month = date.getMonth();
            const year = date.getFullYear();
            const today = getPngDate();
            const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            
            calendarNav.innerHTML = `
                <button id="prev-month">&lt;</button>
                <h4 style="margin:0;">${monthNames[month]} ${year}</h4>
                <button id="next-month">&gt;</button>`;

            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            let day = 1;
            for (let i = 0; i < 6; i++) {
                const row = document.createElement('tr');
                for (let j = 0; j < 7; j++) {
                    const cell = document.createElement('td');
                    if (i === 0 && j < firstDay || day > daysInMonth) {
                        // empty cell
                    } else {
                        const dateStr = `${year}-${month}-${day}`;
                        const dayWrapper = document.createElement('div');
                        dayWrapper.className = 'day-number-wrapper';

                        const dayNumber = document.createElement('span');
                        dayNumber.className = 'day-number';
                        dayNumber.textContent = day;
                        
                        const addBtn = document.createElement('span');
                        addBtn.className = 'add-event-btn';
                        addBtn.textContent = '+';
                        addBtn.onclick = () => openEventModal(dateStr);
                        
                        dayWrapper.appendChild(dayNumber);
                        dayWrapper.appendChild(addBtn);
                        cell.appendChild(dayWrapper);

                        if (dateStr === todayStr) cell.classList.add('current-day');

                        if(events[dateStr]) {
                            events[dateStr].forEach(event => {
                                const eventEl = document.createElement('div');
                                eventEl.className = 'event';
                                
                                const eventText = document.createElement('span');
                                eventText.textContent = event.text;
                                eventEl.appendChild(eventText);

                                const menuBtn = document.createElement('span');
                                menuBtn.className = 'event-menu-btn';
                                menuBtn.textContent = ':';
                                menuBtn.onclick = (e) => {
                                    e.stopPropagation();
                                    showEventMenu(eventEl, dateStr, event.id);
                                };
                                eventEl.appendChild(menuBtn);
                                cell.appendChild(eventEl);
                            });
                        }
                        day++;
                    }
                    row.appendChild(cell);
                }
                calendarBody.appendChild(row);
                if (day > daysInMonth) break;
            }

            document.getElementById('prev-month').addEventListener('click', () => {
                displayedDate.setMonth(displayedDate.getMonth() - 1);
                generateCalendar(displayedDate);
            });
            document.getElementById('next-month').addEventListener('click', () => {
                displayedDate.setMonth(displayedDate.getMonth() + 1);
                generateCalendar(displayedDate);
            });
        };
        
        const showEventMenu = (eventElement, date, eventId) => {
            document.querySelectorAll('.event-menu').forEach(m => m.remove());
            const menu = document.createElement('div');
            menu.className = 'event-menu';
            menu.innerHTML = `<div class="edit-event">✎ Edit</div><div class="delete-event">🗑️ Delete</div>`;
            
            menu.querySelector('.edit-event').onclick = () => {
                const eventToEdit = events[date].find(e => e.id === eventId);
                openEventModal(date, eventToEdit);
                menu.remove();
            };
            menu.querySelector('.delete-event').onclick = () => {
                if(confirm('Are you sure you want to delete this event?')) {
                    events[date] = events[date].filter(e => e.id !== eventId);
                    if(events[date].length === 0) delete events[date];
                    saveEvents();
                    generateCalendar(displayedDate);
                }
                menu.remove();
            };
            
            eventElement.appendChild(menu);
            
            setTimeout(() => {
                document.addEventListener('click', (e) => {
                    if (!menu.contains(e.target)) {
                       menu.remove();
                    }
                }, { once: true });
            }, 0);
        };
        
        const scheduleMidnightUpdate = () => {
            const now = getPngDate();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const msUntilMidnight = tomorrow.getTime() - now.getTime();
            
            setTimeout(() => {
                displayedDate = getPngDate();
                generateCalendar(displayedDate);
                setInterval(() => {
                    displayedDate = getPngDate();
                    generateCalendar(displayedDate);
                }, 24 * 60 * 60 * 1000);
            }, msUntilMidnight + 1000);
        };
        
        const showNotification = (event) => {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.setAttribute('role', 'alert');
    
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close-btn';
        closeBtn.innerHTML = '&times;'; // This is safe HTML
        closeBtn.setAttribute('aria-label', 'Close notification');
    
        const title = document.createElement('h5');
        title.textContent = '🔔 Event Reminder'; // Using textContent is safe
    
        const message = document.createElement('p');
        const strongEl = document.createElement('strong');
        strongEl.textContent = event.text; // Using textContent is safe to prevent XSS
        message.appendChild(strongEl);
        message.append(` at ${event.time}`); // Appending a string is safe
    
        toast.appendChild(closeBtn);
        toast.appendChild(title);
        toast.appendChild(message);
        
        const closeToast = () => {
            toast.classList.add('closing');
            toast.addEventListener('animationend', () => toast.remove());
        };
        
        closeBtn.addEventListener('click', closeToast);
        
        notificationContainer.appendChild(toast);
        
        notificationSound.play().catch(e => console.warn("Audio playback failed. User interaction might be required.", e));
        
        setTimeout(closeToast, 10000); // Auto-dismiss after 10 seconds
    };

    const checkReminders = () => {
        const now = getPngDate();
        const todayStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
        const todaysEvents = events[todayStr] || [];

        todaysEvents.forEach(event => {
            if (!event.reminder || event.reminder === 'none' || !event.time || sessionNotifiedIds.has(event.id)) {
                return;
            }

            const [hours, minutes] = event.time.split(':').map(Number);
            const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
            
            if (now.getTime() > eventDate.getTime()) {
                return;
            }

            const reminderMinutes = parseInt(event.reminder, 10);
            const notificationTime = new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);
            
            if (now.getTime() >= notificationTime.getTime()) {
                showNotification(event);
                sessionNotifiedIds.add(event.id);
            }
        });
    };
    
    // --- AI CHATBOT LOGIC ---
    const chatbotFab = document.getElementById('chatbot-fab');
    const chatbotWindow = document.getElementById('chatbot-window');
    const closeChatbotBtn = document.getElementById('close-chatbot-btn');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotInputForm = document.getElementById('chatbot-input-form');
    const chatbotInput = document.getElementById('chatbot-input');

    const toggleChatbot = (forceOpen) => {
        const isOpen = chatbotWindow.classList.contains('open');
        if (typeof forceOpen === 'boolean' ? forceOpen : !isOpen) {
            chatbotWindow.classList.add('open');
            chatbotInput.focus();
            if (!chat && ai) {
                try {
                    chat = ai.chats.create({
                        model: 'gemini-2.5-flash',
                        config: {
                            systemInstruction: 'You are a friendly and helpful assistant for POM TECH, a company specializing in advanced solar hybrid systems. Your goal is to answer user questions about the company, its team members, solar technology, and provide general assistance related to the website\'s content. Be concise and professional.',
                        },
                    });
                } catch(e) {
                    appendMessage('Error: Could not initialize AI chat.', 'ai');
                    console.error("Failed to create chat", e);
                }
            }
        } else {
            chatbotWindow.classList.remove('open');
        }
    };

    const appendMessage = (text, sender, options = {}) => {
        const { isStreaming = false, isHTML = false } = options;
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        if (text === 'thinking') {
            messageElement.innerHTML = `<div class="thinking-indicator"><span></span><span></span><span></span></div>`;
            messageElement.id = 'thinking-bubble';
        } else {
            if (isHTML) {
                messageElement.innerHTML = text;
            } else {
                messageElement.textContent = text;
            }
        }
        if (isStreaming) {
            messageElement.id = 'streaming-bubble';
        }
        chatbotMessages.appendChild(messageElement);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return messageElement;
    };

    chatbotFab.addEventListener('click', () => toggleChatbot(true));
    closeChatbotBtn.addEventListener('click', () => toggleChatbot(false));

    chatbotInputForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userInput = chatbotInput.value.trim();
        if (!userInput || !chat) return;

        appendMessage(userInput, 'user');
        chatbotInput.value = '';
        const thinkingBubble = appendMessage('thinking', 'ai');
        
        try {
            const result = await chat.sendMessageStream({ message: userInput });
            let firstChunk = true;
            let aiBubble = null;
    
            for await (const chunk of result) {
                const chunkText = chunk.text;
                if (firstChunk) {
                    thinkingBubble.remove();
                    aiBubble = appendMessage(chunkText, 'ai', { isStreaming: true });
                    firstChunk = false;
                } else {
                    aiBubble.textContent += chunkText;
                }
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }
            if (aiBubble) aiBubble.id = ''; // Unset ID after streaming is complete

        } catch (error) {
            thinkingBubble.remove();
            let errorMessage = 'Sorry, I encountered an error. Please try again.';
            let isHTMLError = false;
            const errorString = String(error).toLowerCase();
            
            if (errorString.includes('429') || errorString.includes('quota') || errorString.includes('resource_exhausted')) {
                errorMessage = `<p style="margin:0; font-weight: bold;">Usage Limit Reached</p><p style="margin:5px 0 0 0;">The AI assistant has reached its usage limit due to high demand. Please try again later.</p>`;
                isHTMLError = true;
            } else if (!navigator.onLine) {
                errorMessage = 'You appear to be offline. Please check your internet connection.';
            } else if (errorString.includes('http status code: 0')) {
                errorMessage = 'Could not connect to the AI service. This may be due to a network issue or a browser extension blocking the request. Please check your connection and try again.';
            }
            appendMessage(errorMessage, 'ai', { isHTML: isHTMLError });
            console.error('Gemini API Error:', error);
        }
    });


     /**************************************************/
    /* --- IMAGE TO VIDEO LOGIC --- */
    /**************************************************/
    const initImageToVideoLogic = () => {
        const fileInputEl = resourceViewerContent.querySelector('#image-to-video-input-file');
        const promptInputEl = resourceViewerContent.querySelector('#image-to-video-prompt');
        const generateBtn = resourceViewerContent.querySelector('#image-to-video-generate-btn');
        const statusContainer = resourceViewerContent.querySelector('#image-to-video-status');
        const resultContainer = resourceViewerContent.querySelector('#image-to-video-result');
        const imagePreviewEl = resourceViewerContent.querySelector('#image-to-video-preview');
        const imagePlaceholderEl = resourceViewerContent.querySelector('#image-upload-placeholder');
    
        if (!fileInputEl || !promptInputEl || !generateBtn || !statusContainer || !resultContainer || !imagePreviewEl || !imagePlaceholderEl) {
            console.error("Image to Video UI elements not found!");
            return;
        }

        let selectedFile = null;
    
        const toBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]); // remove data:mime/type;base64, part
            reader.onerror = error => reject(error);
        });

        fileInputEl.addEventListener('change', async () => {
            const file = fileInputEl.files?.[0];
            if (file) {
                if (file.size > 4 * 1024 * 1024) { // 4MB limit for inline data
                    alert('Please select an image smaller than 4MB.');
                    fileInputEl.value = '';
                    return;
                }
                const base64Data = await toBase64(file);
                selectedFile = { data: base64Data, mimeType: file.type };
                imagePreviewEl.src = URL.createObjectURL(file);
                imagePreviewEl.classList.remove('hidden');
                imagePlaceholderEl.classList.add('hidden');
            } else {
                selectedFile = null;
                imagePreviewEl.src = '#';
                imagePreviewEl.classList.add('hidden');
                imagePlaceholderEl.classList.remove('hidden');
            }
        });
    
        generateBtn.addEventListener('click', async () => {
            if (!navigator.onLine) {
                alert("This feature requires an internet connection. Please connect to the internet and try again.");
                return;
            }

            const prompt = promptInputEl.value.trim();
            if (!selectedFile) {
                alert('Please upload an image.');
                return;
            }
            if (!prompt) {
                alert('Please enter a prompt to generate a video.');
                return;
            }
    
            generateBtn.disabled = true;
            resultContainer.innerHTML = '';
            statusContainer.innerHTML = `
                <div class="loader"></div>
                <p id="status-message">Initializing...</p>
            `;
            const statusMessageEl = resourceViewerContent.querySelector('#status-message');
            
            const reassuringMessages = [
                "AI is analyzing the image...",
                "Warming up the video generators...",
                "Composing video scenes from your image...",
                "Rendering high-quality footage...",
                "This can take a few minutes, please wait...",
                "Adding digital stardust...",
                "Almost there..."
            ];
            let messageIndex = 0;
            const statusInterval = setInterval(() => {
                if(statusMessageEl) {
                    statusMessageEl.textContent = reassuringMessages[messageIndex % reassuringMessages.length];
                    messageIndex++;
                }
            }, 4000);
    
            const setStatus = (msg) => {
                if(statusMessageEl) statusMessageEl.textContent = msg;
            };
    
            try {
                if (!ai) throw new Error("AI Client not initialized.");
                
                setStatus('Generating video from image...');
    
                let operation = await ai.models.generateVideos({
                    model: 'veo-2.0-generate-001',
                    prompt: prompt,
                    image: {
                        imageBytes: selectedFile.data,
                        mimeType: selectedFile.mimeType,
                    },
                    config: { numberOfVideos: 1 }
                });
    
                while (!operation.done) {
                    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                    operation = await ai.operations.getVideosOperation({ operation: operation });
                }
    
                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (!downloadLink) {
                    throw new Error('Video generation did not return a valid download link.');
                }
    
                setStatus('Downloading generated video...');
                const videoResponse = await fetch(`${downloadLink}&key=${API_KEY}`);
                if (!videoResponse.ok) {
                    throw new Error(`Failed to download video. Status: ${videoResponse.statusText}`);
                }
                const videoBlob = await videoResponse.blob();
                const videoUrl = URL.createObjectURL(videoBlob);
    
                statusContainer.innerHTML = ''; // Clear status
                resultContainer.innerHTML = `<video src="${videoUrl}" controls autoplay loop muted playsinline></video>`;
    
            } catch (error) {
                console.error('Image to Video Error:', error);
                let userFriendlyMessage;
                const errorMessage = String(error).toLowerCase();
                
                if (errorMessage.includes('video generation did not return a valid download link')) {
                    userFriendlyMessage = `
                        <p><strong>Video Generation Unsuccessful</strong></p>
                        <p>The AI couldn't create a video for this request. This can happen due to the specific nature of the prompt or content safety guidelines.</p>
                        <p>Please try rephrasing your idea or entering a different one.</p>
                    `;
                } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('resource_exhausted')) {
                    userFriendlyMessage = `
                        <p><strong>Usage Limit Reached</strong></p>
                        <p>The video generation feature has reached its usage limit for the current period, which can happen due to high demand.</p>
                        <p>Please try again later. If the issue persists, the application owner may need to check the API plan and billing details.</p>
                        <p style="font-size: 0.8em; margin-top: 15px;">For more information, see the <a href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" rel="noopener noreferrer">official documentation on rate limits</a>.</p>
                    `;
                } else {
                     userFriendlyMessage = `<p><strong>An unexpected error occurred:</strong> ${error.message}</p><p>Please try again later.</p>`;
                }
            
                statusContainer.innerHTML = `<div class="error-message">${userFriendlyMessage}</div>`;

            } finally {
                clearInterval(statusInterval);
                generateBtn.disabled = false;
            }
        });
    };


        // --- ABOUT US DROPDOWN ---
        const locationToggle = document.getElementById('location-toggle');
        if(locationToggle) {
            locationToggle.addEventListener('click', () => {
                const content = document.getElementById('location-content');
                const icon = locationToggle.querySelector('.icon-arrow');
                content.classList.toggle('open');
                icon.classList.toggle('down');
                icon.classList.toggle('up');
            });
        }
        
        // --- SLIDING PANEL & RESOURCE VIEWER ---
        const menuPanelContainer = document.getElementById('menu-panel-container');
        const resourceViewer = document.getElementById('resource-viewer');
        const resourceViewerContent = document.getElementById('resource-viewer-content');
        
        const openPanelSystem = () => menuPanelContainer.classList.add('open');
        const closePanelSystem = () => menuPanelContainer.classList.remove('open');
        const openResourceViewer = (templateId) => {
            const template = document.getElementById(templateId);
            if (!template) return;
            
            resourceViewerContent.innerHTML = '';
            const content = template.content.cloneNode(true);
            resourceViewerContent.appendChild(content);
            resourceViewer.classList.add('visible');
            body.classList.add('viewer-open');
            
            if (templateId === 'video-template') initVideoPanelLogic();
            if (templateId === 'image-template') initImageGalleryLogic();
            if (templateId === 'templates-template') initTemplatesGalleryLogic();
            if (templateId === 'pdf-template') initPdfPanelLogic();
        };

        const closeResourceViewer = () => {
            resourceViewer.classList.remove('visible');
            body.classList.remove('viewer-open');
             if(window.panelSliderIntervals) {
                window.panelSliderIntervals.forEach(clearInterval);
                window.panelSliderIntervals = [];
            }
        };

        document.getElementById('menu-icon').addEventListener('click', openPanelSystem);
        menuPanelContainer.querySelector('.sliding-panel-overlay').addEventListener('click', closePanelSystem);
        menuPanelContainer.querySelector('.close-panel-btn').addEventListener('click', closePanelSystem);
        document.getElementById('close-resource-viewer-btn').addEventListener('click', closeResourceViewer);

        document.querySelectorAll('.resource-item').forEach(item => {
            item.addEventListener('click', () => {
                const templateId = item.dataset.templateId;
                closePanelSystem();
                setTimeout(() => openResourceViewer(templateId), 400);
            });
        });
        
        // --- FULLSCREEN IMAGE VIEWER ---
        const fullscreenViewer = document.getElementById('fullscreen-viewer');
        const fullscreenContentHost = document.getElementById('fullscreen-content-host');
        let currentImageSet = [];
        let currentImageIndex = 0;

        const openFullscreenImageViewer = (imgArray, startIndex) => {
            currentImageSet = imgArray;
            currentImageIndex = startIndex;
            
            const content = `<img src="${currentImageSet[currentImageIndex].src}" alt="${currentImageSet[currentImageIndex].title}"><div class="viewer-caption">${currentImageSet[currentImageIndex].title}</div>`;
            fullscreenContentHost.innerHTML = content;
            fullscreenViewer.classList.add('visible');
            body.classList.add('viewer-open');
        };
        const closeFullscreenImageViewer = () => {
            fullscreenViewer.classList.remove('visible');
            body.classList.remove('viewer-open');
            setTimeout(() => { fullscreenContentHost.innerHTML = ''; }, 400);
        };
        
        const showNextImage = () => {
            currentImageIndex = (currentImageIndex + 1) % currentImageSet.length;
            openFullscreenImageViewer(currentImageSet, currentImageIndex);
        };
        const showPrevImage = () => {
            currentImageIndex = (currentImageIndex - 1 + currentImageSet.length) % currentImageSet.length;
            openFullscreenImageViewer(currentImageSet, currentImageIndex);
        };

        fullscreenViewer.querySelector('.viewer-next').addEventListener('click', showNextImage);
        fullscreenViewer.querySelector('.viewer-prev').addEventListener('click', showPrevImage);

        fullscreenViewer.addEventListener('click', (e) => {
            if (e.target === fullscreenViewer || e.target.classList.contains('close-viewer-btn')) {
                closeFullscreenImageViewer();
            }
        });

        document.getElementById('avatar-logo').addEventListener('click', () => {
            const content = `<img src="img/img 1/PMTC.jpg" alt="school Logo"><div class="viewer-caption"><center>Port Moresby technical college, Po, Box,1969, NCD,Papua New Guinea </center></div>`;
            openFullscreenImageViewer([{ src: 'img/img 1/PMTC.jpg',title: 'Port Moresby technical college, po, box, 1969, NCD, Papua New Guinea' }], 0);
       });
      

        // --- DYNAMIC CONTENT INITIALIZERS ---
        const initPdfPanelLogic = () => {
            const pdfModal = document.getElementById('pdf-modal');
            const pdfTitleInput = document.getElementById('pdf-title-input');
            const pdfDescInput = document.getElementById('pdf-desc-input');
            const pdfContainerTemplate = resourceViewerContent.querySelector('#pdf-container-template');
            
            const openPdfModal = () => {
                pdfModal.classList.remove('hidden');
                body.classList.add('modal-open');
            };
            const closePdfModal = () => {
                pdfModal.classList.add('hidden');
                body.classList.remove('modal-open');
                pdfTitleInput.value = '';
                pdfDescInput.value = '';
            };
            
            resourceViewerContent.querySelector('#add-pdf-btn-template').addEventListener('click', openPdfModal);
            document.getElementById('cancel-pdf-btn').addEventListener('click', closePdfModal);
            document.getElementById('post-pdf-btn').addEventListener('click', () => {
                const title = pdfTitleInput.value.trim();
                const description = pdfDescInput.value.trim();
                if (!title || !description) return;
                
                const newPdfContainer = document.createElement('div');
                newPdfContainer.className = 'pdf-container';
                newPdfContainer.innerHTML = `
                    <h5>${title}</h5>
                    <p>${description}</p>
                    <div class="pdf-cover" data-pdf-src="solar_hybrid_proposal.pdf">
                         <img src="https://i.imgur.com/7aE3i81.png" alt="PDF Cover">
                    </div>
                    <a href="solar_hybrid_proposal.pdf" download="${title.replace(/\s/g, '_')}.pdf" class="action-btn pdf-download-btn hidden" style="margin-top:10px;">Download PDF</a>`;
                pdfContainerTemplate.appendChild(newPdfContainer);
                closePdfModal();
            });

            resourceViewerContent.addEventListener('click', (e) => {
                const cover = e.target.closest('.pdf-cover');
                if (cover) {
                    const downloadBtn = cover.nextElementSibling;
                    const allBtns = resourceViewerContent.querySelectorAll('.pdf-download-btn');
                    const isVisible = !downloadBtn.classList.contains('hidden');

                    allBtns.forEach(btn => btn.classList.add('hidden'));

                    if (!isVisible) {
                        downloadBtn.classList.remove('hidden');
                    }
                }
            });
        };


// --- VIDEO PANEL LOGIC ---
const initVideoPanelLogic = () => {
    const template = document.getElementById("video-template");
    if (!template) return;

    // Replace thumbnails with videos on click
    document.querySelectorAll(".video-thumbnail").forEach(thumbnail => {
        thumbnail.addEventListener("click", () => {
            const videoSrc = thumbnail.dataset.video;
            if (!videoSrc) return;

            const wrapper = thumbnail.parentElement;
            const videoPlayer = document.createElement("video");
            videoPlayer.setAttribute("controls", "true");
            videoPlayer.setAttribute("autoplay", "true");
            videoPlayer.muted = true; // allows autoplay in most browsers

            const source = document.createElement("source");
            source.setAttribute("src", videoSrc);
            source.setAttribute("type", "video/mp4");

            videoPlayer.appendChild(source);

            // Replace thumbnail + overlay
            wrapper.innerHTML = "";
            wrapper.appendChild(videoPlayer);
        });
    });
};
        const initImageGalleryLogic = () => {
            window.panelSliderIntervals = [];
            
            const initPanelSlider = (sliderId, dotsId, images) => {
                const sliderContainer = resourceViewerContent.querySelector(`#${sliderId}`);
                const dotsContainer = resourceViewerContent.querySelector(`#${dotsId}`);
                if (!sliderContainer || !dotsContainer) return;
                
                sliderContainer.innerHTML = '';
                dotsContainer.innerHTML = '';

                images.forEach((imgData, index) => {
                    const slide = document.createElement('div');
                    slide.className = 'panel-slide' + (index === 0 ? ' active' : '');
                    slide.innerHTML = `<img src="${imgData.src}" alt="${imgData.title}">`;
                    slide.querySelector('img').addEventListener('click', () => openFullscreenImageViewer(images, index));
                    sliderContainer.appendChild(slide);

                    const dot = document.createElement('span');
                    dot.className = 'panel-dot' + (index === 0 ? ' active' : '');
                    dotsContainer.appendChild(dot);
                });
                
                const prevBtn = document.createElement('button'); prevBtn.className = 'panel-slider-control prev'; prevBtn.innerHTML = '&lt;'; sliderContainer.appendChild(prevBtn);
                const nextBtn = document.createElement('button'); nextBtn.className = 'panel-slider-control next'; nextBtn.innerHTML = '&gt;'; sliderContainer.appendChild(nextBtn);

                const slides = sliderContainer.querySelectorAll('.panel-slide');
                const dots = dotsContainer.querySelectorAll('.panel-dot');
                let currentSlide = 0;

                const showSlide = (i) => {
                    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
                    dots.forEach((d, idx) => d.classList.toggle('active', idx === i));
                    currentSlide = i;
                };
                
                const goToNext = () => showSlide((currentSlide + 1) % slides.length);
                const goToPrev = () => showSlide((currentSlide - 1 + slides.length) % slides.length);
                
                dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
                prevBtn.addEventListener('click', goToPrev);
                nextBtn.addEventListener('click', goToNext);

                const interval = setInterval(goToNext, 3000);
                window.panelSliderIntervals.push(interval);
            };

            const renderImageGrid = (gridId, images, start, limit) => {
                const gridContainer = resourceViewerContent.querySelector(`#${gridId}`);
                if (!gridContainer) return;
                gridContainer.innerHTML = '';
                images.slice(start, start + limit).forEach((imgData, index) => {
                    const img = document.createElement('img');
                    img.src = imgData.src;
                    img.alt = imgData.title;
                    img.title = imgData.title;
                    img.className = 'gallery-image';
                    img.addEventListener('click', () => openFullscreenImageViewer(images.slice(start), index));
                    gridContainer.appendChild(img);
                });
            };
        
            resourceViewerContent.querySelectorAll('.group-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    resourceViewerContent.querySelector('.group-btn.active').classList.remove('active');
                    btn.classList.add('active');
                    resourceViewerContent.querySelectorAll('.gallery-team-container').forEach(c => c.classList.add('hidden'));
                    resourceViewerContent.querySelector(`#${btn.dataset.target}`).classList.remove('hidden');
                });
            });
            
            initPanelSlider('team-a-slider-template', 'team-a-dots-template', data.images.teamA.slice(0, 3));
            renderImageGrid('team-a-grid-template', data.images.teamA, 3, 4); 
            initPanelSlider('team-b-slider-template', 'team-b-dots-template', data.images.teamB.slice(0, 3));
            renderImageGrid('team-b-grid-template', data.images.teamB, 3, 4); 
            
            const viewMoreA = resourceViewerContent.querySelector('#view-more-images-a-template');
            const viewLessA = resourceViewerContent.querySelector('#view-less-images-a-template');
            viewMoreA.addEventListener('click', () => { renderImageGrid('team-a-grid-template', data.images.teamA, 3, 20); viewMoreA.classList.add('hidden'); viewLessA.classList.remove('hidden'); });
            viewLessA.addEventListener('click', () => { renderImageGrid('team-a-grid-template', data.images.teamA, 3, 4); viewMoreA.classList.remove('hidden'); viewLessA.classList.add('hidden'); });
            
            const viewMoreB = resourceViewerContent.querySelector('#view-more-images-b-template');
            const viewLessB = resourceViewerContent.querySelector('#view-less-images-b-template');
            viewMoreB.addEventListener('click', () => { renderImageGrid('team-b-grid-template', data.images.teamB, 3, 20); viewMoreB.classList.add('hidden'); viewLessB.classList.remove('hidden'); });
            viewLessB.addEventListener('click', () => { renderImageGrid('team-b-grid-template', data.images.teamB, 3, 4); viewMoreB.classList.remove('hidden'); viewLessB.classList.add('hidden'); });
        };
       

        // --- SEARCH & SEARCH HISTORY ---
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const searchHistoryContainer = document.getElementById('search-history-container');
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

        const checkAndClearHistory = () => {
            const lastSearchTime = localStorage.getItem('searchHistoryTimestamp');
            if (!lastSearchTime) return;
            const fiveMinutes = 5 * 60 * 1000;
            if (Date.now() - Number(lastSearchTime) > fiveMinutes) {
                searchHistory = [];
                localStorage.removeItem('searchHistory');
                localStorage.removeItem('searchHistoryTimestamp');
                renderSearchHistory();
            }
        };

        const updateSearchHistory = (query) => {
            if (!query) return;
            const lowerCaseQuery = query.toLowerCase();
            searchHistory = searchHistory.filter(item => item.toLowerCase() !== lowerCaseQuery);
            searchHistory.unshift(query);
            searchHistory = searchHistory.slice(0, 5);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
            localStorage.setItem('searchHistoryTimestamp', Date.now());
            renderSearchHistory();
        };

        const renderSearchHistory = () => {
            searchHistoryContainer.innerHTML = '';
            if (searchHistory.length > 0) {
                const title = document.createElement('span');
                title.textContent = 'Recent Searches: ';
                searchHistoryContainer.appendChild(title);
                searchHistory.forEach(term => {
                    const item = document.createElement('span');
                    item.className = 'search-history-item';
                    item.textContent = term;
                    item.onclick = () => {
                        searchInput.value = term;
                        performSearch();
                    };
                    searchHistoryContainer.appendChild(item);
                });
            }
        };
           //search bar//
        const performSearch = () => {
            const query = searchInput.value.trim();
            if (!query) return;
            updateSearchHistory(query);
            const allProfiles = document.querySelectorAll('#contact .profile-card');
            const resultsGrid = document.getElementById('search-results-grid');
            resultsGrid.innerHTML = '';
            let found = false;
            allProfiles.forEach(card => {
                if (card.dataset.name.toLowerCase().includes(query.toLowerCase())) {
                    resultsGrid.appendChild(card.cloneNode(true));
                    found = true;
                }
            });
            setActivePage('search-results');
            document.getElementById('no-results-message').classList.toggle('hidden', found);
        };
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keyup', e => e.key === 'Enter' && performSearch());

        // --- PROFILE CARD TOGGLE ---
        const initProfileToggle = () => {
            document.querySelectorAll('.profile-container').forEach(container => {
                const cards = container.querySelectorAll('.profile-card');
                if (cards.length > 4) {
                    cards.forEach((card, index) => {
                        if (index >= 4) card.classList.add('hidden-card');
                    });
                } else {
                    const toggleButton = container.querySelector('.toggle-view-btn');
                    if(toggleButton) toggleButton.classList.add('hidden');
                }
            });

            document.querySelectorAll('.toggle-view-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const targetGridId = button.dataset.targetGrid;
                    const container = document.getElementById(targetGridId);
                    const cards = container.querySelectorAll('.profile-card');
                    cards.forEach((card, index) => { if (index >= 4) card.classList.toggle('hidden-card'); });
                    const textSpan = button.querySelector('span:first-child');
                    const iconSpan = button.querySelector('.icon-arrow');
                    if (iconSpan.classList.contains('down')) {
                        textSpan.textContent = 'View Less';
                        iconSpan.classList.remove('down');
                        iconSpan.classList.add('up');
                    } else {
                        textSpan.textContent = 'View More';
                        iconSpan.classList.remove('up');
                        iconSpan.classList.add('down');
                    }
                });
            });
        };


        // --- LOGOUT ---
        document.getElementById('logout-btn').addEventListener('click', e => { 
            e.preventDefault(); 
            if (confirm("Are you sure you want to log out?")) {
                body.classList.add('logging-out');
                const logoutOverlay = document.createElement('div');
                logoutOverlay.className = 'logout-overlay';
                logoutOverlay.innerHTML = `<p>Logging out...</p><div class="loader"></div>`;
                body.appendChild(logoutOverlay);
                setTimeout(() => { window.location.href = 'cover.html'; }, 3000);
            }
        });

        // --- GENERIC EVENT LISTENERS ---
        document.querySelectorAll('.nav-item[data-target]').forEach(item => item.addEventListener('click', e => { e.preventDefault(); setActivePage(item.dataset.target); }));
        document.querySelectorAll('#contact .group-btn').forEach(b => {
             b.addEventListener('click', () => { 
                document.querySelector('#contact .group-btn.active').classList.remove('active'); 
                b.classList.add('active'); 
                document.querySelectorAll('.profile-container').forEach(c=>c.classList.toggle('hidden', c.id !== b.dataset.target)); 
            });
        });
        
        // --- SERVICE WORKER REGISTRATION ---
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
            });
        }

        // --- WELCOME ANIMATION ---
        const welcomeOverlay = document.getElementById('welcome-overlay');
        welcomeOverlay.classList.remove('hidden');
        welcomeOverlay.classList.add('visible');
        setTimeout(() => {
            welcomeOverlay.classList.remove('visible');
        }, 4000);


        // --- INITIALIZATION ---
        applyTheme(localStorage.getItem('theme') || 'light');
        setActivePage('landing-page');
        initProfileToggle();
        displayedDate = getPngDate();
        generateCalendar(displayedDate);
        scheduleMidnightUpdate();
        checkAndClearHistory();
        renderSearchHistory();
        setInterval(checkAndClearHistory, 60000);
    });
    
    