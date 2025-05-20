
MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();
    let totalTime = 0;
    const STATIC_DURATION = 5000;
    let isAnimating = false;

    const originalHermiteControls = [
        {
            x: graphics.sizeX / 10,
            y: graphics.sizeY / 2
        },
        {x: 150, y: 200},
        {
            x: (graphics.sizeX*9) / 10,
            y: graphics.sizeY / 2
        },
        {x: -200, y: 300}
    ];

    const originalCardinalControls = {
        points: [
            {x: graphics.sizeX / 100, y: graphics.sizeY / 100},
            {x: graphics.sizeX / 4, y: graphics.sizeY / 20},
            {x: graphics.sizeX*2 / 4, y: graphics.sizeY / 3},
            {x: graphics.sizeX*2.5 / 4, y: graphics.sizeY / 20},
            {x: graphics.sizeX*99 / 100, y: graphics.sizeY / 100}
        ],
        tension: 0
    };

    const originalBezierControls = [
        {x: graphics.sizeX / 100, y: graphics.sizeY*99 / 100},
        {x: graphics.sizeX*33 / 100, y: graphics.sizeY*3 / 4},
        {x: graphics.sizeX*66 / 100, y: graphics.sizeY*9 / 10},
        {x: graphics.sizeX*99 / 100, y: graphics.sizeY*2 / 3}
    ];

    let hermiteControls = JSON.parse(JSON.stringify(originalHermiteControls));
    let cardinalControls = JSON.parse(JSON.stringify(originalCardinalControls));
    let bezierControls = JSON.parse(JSON.stringify(originalBezierControls));

    //------------------------------------------------------------------
    //
    // Animate the Hermite curve
    //
    //------------------------------------------------------------------
    function updateHermiteAnimation(elapsedTime, totalTime) {
        const t = totalTime / 1000;

        hermiteControls[0].x = graphics.sizeX / 10 + Math.sin(t * 0.8) * 50;
        hermiteControls[0].y = graphics.sizeY / 2 + Math.cos(t * 0.6) * 70;

        hermiteControls[2].x = (graphics.sizeX*9) / 10 + Math.sin(t * 0.7) * 50;
        hermiteControls[2].y = graphics.sizeY / 2 + Math.cos(t * 0.9) * 70;

        hermiteControls[1].x = 150 * Math.sin(t * 1.2);
        hermiteControls[1].y = 200 * Math.cos(t * 1.5);

        hermiteControls[3].x = -200 * Math.sin(t * 1.1);
        hermiteControls[3].y = 300 * Math.cos(t * 0.8);
    }

    //------------------------------------------------------------------
    //
    // Animate the Cardinal curve
    //
    //------------------------------------------------------------------
    function updateCardinalAnimation(elapsedTime, totalTime) {
        const t = totalTime / 1000;

        for (let i = 0; i < cardinalControls.points.length; i++) {
            const phase = (i / cardinalControls.points.length) * Math.PI * 2;
            const waveY = Math.sin(t + phase) * graphics.sizeY / 6;

            cardinalControls.points[i].y = originalCardinalControls.points[i].y + waveY;
        }

        cardinalControls.tension = (Math.sin(t * 0.5) + 1) * 0.5;
    }

    //------------------------------------------------------------------
    //
    // Animate the Bezier curve
    //
    //------------------------------------------------------------------
    function updateBezierAnimation(elapsedTime, totalTime) {
        const t = totalTime / 1000;

        bezierControls[0].x = originalBezierControls[0].x;
        bezierControls[0].y = graphics.sizeY*99/100 + Math.sin(t * 1.2) * graphics.sizeY / 8;

        const centerX = graphics.sizeX / 2;
        const centerY = graphics.sizeY * 0.8;
        const radius = graphics.sizeX / 6;

        bezierControls[1].x = centerX + Math.cos(t) * radius;
        bezierControls[1].y = centerY + Math.sin(t) * radius / 2;

        bezierControls[2].x = centerX + Math.cos(t + Math.PI) * radius;
        bezierControls[2].y = centerY + Math.sin(t + Math.PI) * radius / 2;

        bezierControls[3].x = originalBezierControls[3].x + Math.sin(t * 0.8) * graphics.sizeX / 8;
        bezierControls[3].y = graphics.sizeY*2/3 + Math.cos(t * 0.8) * graphics.sizeY / 8;
    }

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
        totalTime += elapsedTime;

        if (totalTime > STATIC_DURATION && !isAnimating) {
            isAnimating = true;
            console.log("Switching to animation mode");
        }

        if (isAnimating) {
            updateHermiteAnimation(elapsedTime, totalTime);
            updateCardinalAnimation(elapsedTime, totalTime);
            updateBezierAnimation(elapsedTime, totalTime);
        }
    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();

        graphics.drawCurve(
            graphics.Curve.Hermite,
            hermiteControls,
            20,
            isAnimating ? false : true,
            true,
            true,
            isAnimating ? 'rgb(255, 100, 100)' : 'rgb(255, 255, 255)'
        );

        // Draw the Cardinal curve
        graphics.drawCurve(
            graphics.Curve.Cardinal,
            cardinalControls,
            20,
            isAnimating ? false : true,
            true,
            true,
            isAnimating ? `rgb(100, 255, ${Math.floor(cardinalControls.tension * 255)})` : 'rgb(255, 255, 255)'
        );

        // Draw the Bezier curve
        graphics.drawCurve(
            graphics.Curve.Bezier,
            bezierControls,
            30,
            isAnimating ? false : true,
            true,
            true,
            isAnimating ? 'rgb(100, 100, 255)' : 'rgb(255, 255, 255)'
        );
    }

    //------------------------------------------------------------------
    //
    // This is the animation loop.
    //
    //------------------------------------------------------------------
    function animationLoop(time) {

        const elapsedTime = time - previousTime;
        previousTime = time;
        update(elapsedTime);
        render();

        requestAnimationFrame(animationLoop);
    }

    console.log('initializing...');
    requestAnimationFrame(animationLoop);

}(MySample.graphics));
