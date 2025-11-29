class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    // Draw the 3D highway
    drawHighway() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;

        // Vanishing point
        const vpX = w / 2;
        const vpY = h * 0.2; // Horizon line

        // Bottom width of the highway
        const bottomWidth = w * 0.6;
        const topWidth = w * 0.1; // Width at horizon

        // Lane Count
        const laneCount = 4;

        ctx.save();

        // Draw Highway Background
        const gradient = ctx.createLinearGradient(0, vpY, 0, h);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(20, 20, 40, 0.8)');
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(vpX - topWidth / 2, vpY);
        ctx.lineTo(vpX + topWidth / 2, vpY);
        ctx.lineTo(vpX + bottomWidth / 2, h);
        ctx.lineTo(vpX - bottomWidth / 2, h);
        ctx.closePath();
        ctx.fill();

        // Draw Lane Lines
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
        ctx.lineWidth = 2;

        for (let i = 0; i <= laneCount; i++) {
            const t = i / laneCount;

            // Interpolate X at top and bottom
            const xTop = (vpX - topWidth / 2) + topWidth * t;
            const xBottom = (vpX - bottomWidth / 2) + bottomWidth * t;

            ctx.beginPath();
            ctx.moveTo(xTop, vpY);
            ctx.lineTo(xBottom, h);
            ctx.stroke();
        }

        // Draw Horizon Line
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, vpY);
        ctx.lineTo(w, vpY);
        ctx.stroke();

        // Draw Hit Line (near bottom)
        const hitY = h * 0.9;
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';

        const hitWidthTop = topWidth + (bottomWidth - topWidth) * ((hitY - vpY) / (h - vpY));

        ctx.beginPath();
        ctx.moveTo(vpX - hitWidthTop * 3, hitY); // Make it wider than the highway
        ctx.lineTo(vpX + hitWidthTop * 3, hitY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();

        // Store projection params for note drawing
        this.projection = { vpX, vpY, topWidth, bottomWidth, h };
    }

    drawNote(lane, progress) {
        // progress: 0 (at horizon) -> 1 (at hit line) -> >1 (past hit line)
        if (progress < 0 || progress > 1.2) return;

        const { vpX, vpY, topWidth, bottomWidth, h } = this.projection;
        const hitY = h * 0.9;
        const travelDist = hitY - vpY;

        const y = vpY + travelDist * progress;
        const currentWidth = topWidth + (bottomWidth - topWidth) * progress;
        const laneWidth = currentWidth / 4;

        // X position of the lane start
        const laneStartX = (vpX - currentWidth / 2) + laneWidth * lane;

        // Note dimensions
        const noteHeight = 20 * progress; // Scale height with perspective

        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 10 * progress;
        ctx.shadowColor = '#00f3ff';

        // Draw Note Rect
        ctx.fillRect(laneStartX + 2, y - noteHeight / 2, laneWidth - 4, noteHeight);

        ctx.restore();
    }

    drawLaneFeedback(lane) {
        const { vpX, vpY, topWidth, bottomWidth, h } = this.projection;
        const hitY = h * 0.9;

        // Draw a highlight on the lane
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

        // Calculate trapezoid for the lane
        // We only draw the bottom part for feedback
        const yTop = vpY;
        const yBottom = h;

        const widthTop = topWidth / 4;
        const widthBottom = bottomWidth / 4;

        const xTopStart = (vpX - topWidth / 2) + widthTop * lane;
        const xBottomStart = (vpX - bottomWidth / 2) + widthBottom * lane;

        ctx.beginPath();
        ctx.moveTo(xTopStart, yTop);
        ctx.lineTo(xTopStart + widthTop, yTop);
        ctx.lineTo(xBottomStart + widthBottom, yBottom);
        ctx.lineTo(xBottomStart, yBottom);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
