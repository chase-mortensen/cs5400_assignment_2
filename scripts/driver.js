
MySample.main = (function(graphics) {
    'use strict';

    let previousTime = performance.now();

    //------------------------------------------------------------------
    //
    // Scene updates go here.
    //
    //------------------------------------------------------------------
    function update(elapsedTime) {
    }

    //------------------------------------------------------------------
    //
    // Rendering code goes here
    //
    //------------------------------------------------------------------
    function render() {
        graphics.clear();
        const hermiteControls = [
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
        ]
        graphics.drawCurve(graphics.Curve.Hermite, hermiteControls, 20, true, true, true, 'rgb(255, 255, 255)')

        const cardinalControls = {
            points: [
                {x: graphics.sizeX / 100, y: graphics.sizeY / 100},
                {x: graphics.sizeX / 4, y: graphics.sizeY / 20},
                {x: graphics.sizeX*2 / 4, y: graphics.sizeY / 3},
                {x: graphics.sizeX*2.5 / 4, y: graphics.sizeY / 20},
                {x: graphics.sizeX*99 / 100, y: graphics.sizeY / 100}
            ],
            tension: 0
        }
        graphics.drawCurve(graphics.Curve.Cardinal, cardinalControls, 20, true, true, true, 'rgb(255, 255, 255)')


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
