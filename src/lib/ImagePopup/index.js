import './ImagePopup.css';

class ImagePopup {
    constructor(urls) {
        // Support both single URL and array of URLs
        this.urls = Array.isArray(urls) ? urls : [urls];
        this.currentIndex = 0;
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onPrevClick = this.onPrevClick.bind(this);
        this.onNextClick = this.onNextClick.bind(this);
    }

    show() {
        if (this._container) {
            return;
        }

        this._container = document.createElement('div');
        document.body.appendChild(this._container);
        this._container.className = 'image-popup';

        // Create image element
        this._img = document.createElement('img');
        this._img.src = this.urls[this.currentIndex];
        this._container.appendChild(this._img);

        // Add navigation controls if multiple photos
        if (this.urls.length > 1) {
            // Previous button
            this._prevBtn = document.createElement('div');
            this._prevBtn.className = 'image-popup-nav image-popup-prev';
            this._prevBtn.innerHTML = '‹';
            this._prevBtn.addEventListener('click', this.onPrevClick);
            this._container.appendChild(this._prevBtn);

            // Next button
            this._nextBtn = document.createElement('div');
            this._nextBtn.className = 'image-popup-nav image-popup-next';
            this._nextBtn.innerHTML = '›';
            this._nextBtn.addEventListener('click', this.onNextClick);
            this._container.appendChild(this._nextBtn);

            // Counter
            this._counter = document.createElement('div');
            this._counter.className = 'image-popup-counter';
            this._updateCounter();
            this._container.appendChild(this._counter);
        }

        this._container.classList.add('show');

        window.addEventListener('keydown', this.onKeyDown, true);
        window.addEventListener('mousedown', this.onMouseDown, true);
        window.addEventListener('touchstart', this.onMouseDown, true);
    }

    hide() {
        if (!this._container) {
            return;
        }

        document.body.removeChild(this._container);
        this._container = null;
        this._img = null;
        this._prevBtn = null;
        this._nextBtn = null;
        this._counter = null;

        window.removeEventListener('keydown', this.onKeyDown, true);
        window.removeEventListener('mousedown', this.onMouseDown, true);
        window.removeEventListener('touchstart', this.onMouseDown, true);
    }

    _updateCounter() {
        if (this._counter) {
            this._counter.textContent = `${this.currentIndex + 1} / ${this.urls.length}`;
        }
    }

    _showPhoto(index) {
        this.currentIndex = index;
        if (this._img) {
            this._img.src = this.urls[this.currentIndex];
            this._updateCounter();
        }
    }

    onPrevClick(e) {
        e.stopPropagation();
        const newIndex = this.currentIndex > 0 
            ? this.currentIndex - 1 
            : this.urls.length - 1;
        this._showPhoto(newIndex);
    }

    onNextClick(e) {
        e.stopPropagation();
        const newIndex = this.currentIndex < this.urls.length - 1 
            ? this.currentIndex + 1 
            : 0;
        this._showPhoto(newIndex);
    }

    onKeyDown(e) {
        if (e.keyCode === 27) {
            // ESC key
            this.hide();
        } else if (e.keyCode === 37) {
            // Left arrow - cycle to last photo if at first
            const newIndex = this.currentIndex > 0 
                ? this.currentIndex - 1 
                : this.urls.length - 1;
            this._showPhoto(newIndex);
        } else if (e.keyCode === 39) {
            // Right arrow - cycle to first photo if at last
            const newIndex = this.currentIndex < this.urls.length - 1 
                ? this.currentIndex + 1 
                : 0;
            this._showPhoto(newIndex);
        }
    }

    onMouseDown(e) {
        // Only handle left mouse button (button 0) or touch events (no button property)
        if (e.button !== undefined && e.button !== 0) {
            return;
        }

        // Don't close if clicking on navigation buttons
        if (e.target === this._prevBtn || e.target === this._nextBtn) {
            return;
        }

        this.hide();
    }
}

export default ImagePopup;
