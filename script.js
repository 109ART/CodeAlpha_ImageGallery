document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements select kar rahe hain
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryCards = document.querySelectorAll('.gallery-card');
    const modal = document.getElementById('viewer-modal');
    const modalImg = document.getElementById('viewer-img');
    const modalTitle = document.getElementById('viewer-title');
    const modalCat = document.getElementById('viewer-cat');

    const btnClose = document.getElementById('close-modal');
    const btnPrev = document.getElementById('slide-prev');
    const btnNext = document.getElementById('slide-next');
    const btnDownload = document.getElementById('download-img');

    // Currently visible cards track karne ke liye array
    let activeCards = [...galleryCards];
    let currentIdx = 0;

    // --- 1. FILTER LOGIC ---
    filterBtns.forEach(button => {
        button.addEventListener('click', () => {
            // Purana active button hata kar naya laga dena
            document.querySelector('.filter-btn.active').classList.remove('active');
            button.classList.add('active');

            const targetGroup = button.getAttribute('data-filter');
            activeCards = []; // har click pe list reset

            galleryCards.forEach(card => {
                const group = card.getAttribute('data-category');
                if (targetGroup === 'all' || group === targetGroup) {
                    card.classList.remove('hidden');
                    activeCards.push(card);
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // --- 2. LIGHTBOX / SLIDER LOGIC ---
    function openViewer(index) {
        currentIdx = index;
        const selectedCard = activeCards[currentIdx];

        const imageSrc = selectedCard.querySelector('img').src;
        const imageAlt = selectedCard.querySelector('img').alt;
        const titleText = selectedCard.querySelector('.card-title').textContent;
        const categoryText = selectedCard.querySelector('.card-category').textContent;

        modalImg.src = imageSrc;
        modalImg.alt = imageAlt;
        modalTitle.textContent = titleText;
        modalCat.textContent = categoryText;

        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // background scroll rok dena
    }

    function closeViewer() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    function showNextSlide() {
        if (activeCards.length <= 1) return;
        currentIdx = (currentIdx + 1) % activeCards.length;
        switchSlideSmoothly(currentIdx);
    }

    function showPrevSlide() {
        if (activeCards.length <= 1) return;
        currentIdx = (currentIdx - 1 + activeCards.length) % activeCards.length;
        switchSlideSmoothly(currentIdx);
    }

    // Slide change pe image ko halka fade out/in karte hain, taake switch achi lage
    function switchSlideSmoothly(index) {
        modalImg.classList.add('fading');
        setTimeout(() => {
            openViewer(index);
            modalImg.classList.remove('fading');
        }, 150);
    }

    // Har card pe click event laga rahe hain
    galleryCards.forEach(card => {
        card.addEventListener('click', () => {
            const mappedIndex = activeCards.indexOf(card);
            if (mappedIndex !== -1) {
                openViewer(mappedIndex);
            }
        });
    });

    // --- 3. DOWNLOAD LOGIC ---
    async function downloadCurrentImage() {
        const imageSrc = modalImg.src;
        const extension = imageSrc.split('.').pop().split('?')[0];
        const fileName = modalTitle.textContent.trim().replace(/\s+/g, '-') + '.' + extension;

        // Chhota visual feedback: icon click hote hi thora fade ho jaye
        btnDownload.style.opacity = '0.5';

        try {
            // Image ko blob (raw data) ki tarah fetch karna, isse "Save As" hamesha trigger hota hai
            const response = await fetch(imageSrc);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            const tempLink = document.createElement('a');
            tempLink.href = blobUrl;
            tempLink.download = fileName;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            URL.revokeObjectURL(blobUrl); // memory clean karna
        } catch (err) {
            // Agar fetch fail ho (jese file:// pe khola gaya ho), to direct link try karo
            const tempLink = document.createElement('a');
            tempLink.href = imageSrc;
            tempLink.download = fileName;
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
        } finally {
            setTimeout(() => { btnDownload.style.opacity = '1'; }, 300);
        }
    }

    btnClose.addEventListener('click', closeViewer);
    btnNext.addEventListener('click', showNextSlide);
    btnPrev.addEventListener('click', showPrevSlide);
    btnDownload.addEventListener('click', downloadCurrentImage);

    // Modal ke bahar click karne se close ho jaye
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeViewer();
        }
    });

    // Keyboard se navigation (Escape, Left, Right)
    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('show')) return;
        if (e.key === 'Escape') closeViewer();
        if (e.key === 'ArrowRight') showNextSlide();
        if (e.key === 'ArrowLeft') showPrevSlide();
    });
});