// Tutorial page JS
document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle for mobile
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside
    document.addEventListener('click', function(event) {
        if (sidebar && sidebar.classList.contains('open')) {
            if (!sidebar.contains(event.target) && event.target !== sidebarToggle) {
                sidebar.classList.remove('open');
            }
        }
    });

    // YouTube links for each equipment
    const youtubeLinks = {
        'Treadmill': 'https://www.youtube.com/watch?v=7BwN7TJlBQc&pp=ygUOdHJlYWRtaWxsIHRpcHM%3D',
        'Exercise Bike': 'https://www.youtube.com/watch?v=GvNQ6qXW6xk&pp=ygUQZXhlcmNpc2UgYmlrZSB0aXA%3D',
        'Elliptical': 'https://www.youtube.com/watch?v=8cQwFRlJ8-8&pp=ygUNZWxsaXB0aWNhbCB0aXA%3D',
        'Bench Press': 'https://www.youtube.com/watch?v=4Y2ZdHCOXok&pp=ygUQYmVuY2ggcHJlc3MgdGlwcw%3D%3D',
        'Leg Press': 'https://www.youtube.com/watch?v=IZxyjW7UJ9Y&pp=ygUObGVnIHByZXNzIHRpcHM%3D',
        'Dumbbells': 'https://www.youtube.com/watch?v=AvnB5hHvUfE&pp=ygUNZHVtYmJlbGwgdGlwcw%3D%3D',
        'Barbell': 'https://www.youtube.com/watch?v=QhVC_AnZYYM&pp=ygUNYmFyYmVsbCB0aXBz',
        'Cable Crossover': 'https://www.youtube.com/watch?v=tOoVqHAuslM&pp=ygUQY2FibGUgY3Jvc3NvdmVy',
        'Pull-up Bar': 'https://www.youtube.com/watch?v=eGo4IYlbE5g&pp=ygUOcHVsbCB1cCB0aXBz',
        'Rowing Machine': 'https://www.youtube.com/watch?v=JCzE4k7kabM&pp=ygUPcm93aW5nIG1hY2hpbmU%3D'
    };

    // Category filter functionality
    const categoryBtns = document.querySelectorAll('.category-btn');
    const equipmentCards = document.querySelectorAll('.equipment-card');
    const searchInput = document.getElementById('searchInput');
    
    function filterEquipment() {
        const activeCategory = document.querySelector('.category-btn.active').textContent;
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        
        let visibleCount = 0;
        
        equipmentCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const categoryName = getCategoryName(category);
            const equipmentName = card.querySelector('.equipment-name').textContent.toLowerCase();
            const equipmentDesc = card.querySelector('.equipment-desc').textContent.toLowerCase();
            
            const matchesCategory = activeCategory === 'All Equipment' || categoryName === activeCategory;
            const matchesSearch = equipmentName.includes(searchTerm) || equipmentDesc.includes(searchTerm);
            
            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show no results message
        const equipmentGrid = document.getElementById('equipmentGrid');
        const existingNoResults = document.querySelector('.no-results');
        
        if (visibleCount === 0 && !existingNoResults) {
            const noResultsDiv = document.createElement('div');
            noResultsDiv.className = 'no-results';
            noResultsDiv.innerHTML = `
                <span class="material-icons">search_off</span>
                <p>No equipment found</p>
                <small>Try a different search term or category</small>
            `;
            equipmentGrid.appendChild(noResultsDiv);
        } else if (visibleCount > 0 && existingNoResults) {
            existingNoResults.remove();
        }
    }
    
    function getCategoryName(category) {
        const categories = {
            'cardio': 'Cardio',
            'strength': 'Strength',
            'free-weights': 'Free Weights',
            'cable': 'Cable Machines'
        };
        return categories[category] || '';
    }
    
    // Category button click handlers
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterEquipment();
        });
    });
    
    // Search input handler
    if (searchInput) {
        searchInput.addEventListener('input', filterEquipment);
    }
    
    // Function to open YouTube video
    function openYouTubeTutorial(equipmentName) {
        const link = youtubeLinks[equipmentName];
        if (link) {
            window.open(link, '_blank');
        } else {
            // Default search if no specific link
            const searchQuery = encodeURIComponent(`${equipmentName} tutorial gym`);
            window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
        }
    }
    
    // Watch button click handlers - Redirect to YouTube
    const watchBtns = document.querySelectorAll('.watch-btn');
    watchBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const equipmentName = this.closest('.equipment-card').querySelector('.equipment-name').textContent;
            openYouTubeTutorial(equipmentName);
        });
    });
    
    // Equipment card click - Also redirect to YouTube
    equipmentCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.classList.contains('watch-btn')) {
                const equipmentName = this.querySelector('.equipment-name').textContent;
                openYouTubeTutorial(equipmentName);
            }
        });
    });
});