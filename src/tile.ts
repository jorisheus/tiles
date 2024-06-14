function calculateApothem(radius: number): number {
    const degrees30InRadians = Math.PI / 6; // Convert 30 degrees to radians
    return radius * Math.cos(degrees30InRadians);
}

export class Tile {
    constructor(public x: number, public y: number) {
    }

    
    draw(ctx: CanvasRenderingContext2D, scale: number) {
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1
        ctx.beginPath()
        
        // Define the center and radius of the hexagon
        const apothem = calculateApothem(scale);
        const centerX = this.x * (scale * 3) - (1.5 * scale * (this.y % 2));
        const centerY = this.y * apothem;
        const radius = scale;

        // Calculate the angle between each vertex
        const angle = 2 * Math.PI / 6;

        // Move to the first vertex
        ctx.moveTo(centerX + radius * Math.cos(0), centerY + radius * Math.sin(0));

        // Draw lines to each subsequent vertex
        for (let i = 1; i <= 6; i++) {
            ctx.lineTo(
                centerX + radius * Math.cos(i * angle),
                centerY + radius * Math.sin(i * angle)
            );
        }

        // Close the path and stroke it
        ctx.closePath();
        ctx.stroke();
    }
} 