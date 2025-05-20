// ------------------------------------------------------------------
//
// This is the graphics object.  It provides a pseudo pixel rendering
// space for use in demonstrating some basic rendering techniques.
//
// ------------------------------------------------------------------
MySample.graphics = (function(pixelsX, pixelsY, showPixels) {
    'use strict';

    const canvas = document.getElementById('canvas-main');
    const context = canvas.getContext('2d', { alpha: false });

    const deltaX = canvas.width / pixelsX;
    const deltaY = canvas.height / pixelsY;

    //------------------------------------------------------------------
    //
    // Public function that allows the client code to clear the canvas.
    //
    //------------------------------------------------------------------
    function clear() {
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();

        //
        // Draw a very light background to show the "pixels" for the framebuffer.
        if (showPixels) {
            context.save();
            context.lineWidth = .1;
            context.strokeStyle = 'rgb(150, 150, 150)';
            context.beginPath();
            for (let y = 0; y <= pixelsY; y++) {
                context.moveTo(1, y * deltaY);
                context.lineTo(canvas.width, y * deltaY);
            }
            for (let x = 0; x <= pixelsX; x++) {
                context.moveTo(x * deltaX, 1);
                context.lineTo(x * deltaX, canvas.width);
            }
            context.stroke();
            context.restore();
        }
    }

    //------------------------------------------------------------------
    //
    // Public function that renders a "pixel" on the framebuffer.
    //
    //------------------------------------------------------------------
    function drawPixel(x, y, color) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        context.fillStyle = color;
        context.fillRect(x * deltaX, y * deltaY, deltaX, deltaY);
    }

    //------------------------------------------------------------------
    //
    // Helper function used to draw an X centered at a point.
    //
    //------------------------------------------------------------------
    function drawPoint(x, y, ptColor) {
        x = Math.trunc(x);
        y = Math.trunc(y);

        drawPixel(x - 1, y - 1, ptColor);
        drawPixel(x + 1, y - 1, ptColor);
        drawPixel(x, y, ptColor);
        drawPixel(x + 1, y + 1, ptColor);
        drawPixel(x - 1, y + 1, ptColor);
    }

    //------------------------------------------------------------------
    //
    // Bresenham line drawing algorithm.
    //
    //------------------------------------------------------------------
    function drawLine(x0, y0, x1, y1, color) {
        // Determine which octant the line is in
        const dx = x1 - x0;
        const dy = y1 - y0;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);

        // Determine octant (0-7)
        let octant;
        if (dx >= 0 && dy >= 0) {
            octant = adx >= ady ? 0 : 1;
        } else if (dx < 0 && dy >= 0) {
            octant = adx >= ady ? 3 : 2;
        } else if (dx < 0 && dy < 0) {
            octant = adx >= ady ? 4 : 5;
        } else { // dx >= 0 && dy < 0
            octant = adx >= ady ? 7 : 6;
        }

        if (octant === 0) {
            // Octant 0: no transformation needed
            drawLineOctant0(x0, y0, x1, y1, color);
        }
        else if (octant === 1) {
            // Octant 1: reflect across y=x
            drawLineOctant1(x0, y0, x1, y1, color);
        }
        else if (octant === 2) {
            // Octant 2: reflect across y-axis, then across y=x
            drawLineOctant2(x0, y0, x1, y1, color);
        }
        else if (octant === 3) {
            // Octant 3: reflect across y-axis
            drawLineOctant3(x0, y0, x1, y1, color);
        }
        else if (octant === 4) {
            // Octant 4: reflect across origin (both x and y)
            drawLineOctant4(x0, y0, x1, y1, color);
        }
        else if (octant === 5) {
            // Octant 5: reflect across origin, then across y=x
            drawLineOctant5(x0, y0, x1, y1, color);
        }
        else if (octant === 6) {
            // Octant 6: reflect across x-axis, then across y=x
            drawLineOctant6(x0, y0, x1, y1, color);
        }
        else if (octant === 7) {
            // Octant 7: reflect across x-axis
            drawLineOctant7(x0, y0, x1, y1, color);
        }
    }

    // Octant 0 (dx >= 0, dy >= 0, dx >= dy)
    function drawLineOctant0(x0, y0, x1, y1, color) {
        if (x0 > x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x1 - x0;
        const dy = y1 - y0;
        let error = 2 * dy - dx;
        let y = y0;

        for (let x = x0; x <= x1; x++) {
            drawPixel(x, y, color);
            if (error > 0) {
                y += 1;
                error += 2 * (dy - dx);
            } else {
                error += 2 * dy;
            }
        }
    }

    // Octant 1 (dx >= 0, dy >= 0, dx < dy)
    function drawLineOctant1(x0, y0, x1, y1, color) {
        if (y0 > y1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x1 - x0;
        const dy = y1 - y0;
        let error = 2 * dx - dy;
        let x = x0;

        for (let y = y0; y <= y1; y++) {
            drawPixel(x, y, color);
            if (error > 0) {
                x += 1;
                error += 2 * (dx - dy);
            } else {
                error += 2 * dx;
            }
        }
    }

    // Octant 2 (dx < 0, dy >= 0, -dx < dy)
    function drawLineOctant2(x0, y0, x1, y1, color) {
        if (y0 > y1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x1 - x0;
        const dy = y1 - y0;
        let error = 2 * Math.abs(dx) - dy;
        let x = x0;

        for (let y = y0; y <= y1; y++) {
            drawPixel(x, y, color);
            if (error > 0) {
                x -= 1;
                error += 2 * (Math.abs(dx) - dy);
            } else {
                error += 2 * Math.abs(dx);
            }
        }
    }

    // Octant 3 (dx < 0, dy >= 0, -dx >= dy)
    function drawLineOctant3(x0, y0, x1, y1, color) {
        if (x0 < x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x0 - x1; // Make dx positive
        const dy = y1 - y0;
        let error = 2 * dy - dx;
        let y = y0;

        for (let x = x0; x >= x1; x--) {
            drawPixel(x, y, color);
            if (error > 0) {
                y += 1;
                error += 2 * (dy - dx);
            } else {
                error += 2 * dy;
            }
        }
    }

    // Octant 4 (dx < 0, dy < 0, dx <= dy)
    function drawLineOctant4(x0, y0, x1, y1, color) {
        if (x0 < x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x0 - x1; // Make dx positive
        const dy = y0 - y1; // Make dy positive
        let error = 2 * dy - dx;
        let y = y0;

        for (let x = x0; x >= x1; x--) {
            drawPixel(x, y, color);
            if (error > 0) {
                y -= 1;
                error += 2 * (dy - dx);
            } else {
                error += 2 * dy;
            }
        }
    }

    // Octant 5 (dx < 0, dy < 0, dx > dy)
    function drawLineOctant5(x0, y0, x1, y1, color) {
        if (y0 < y1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x0 - x1; // Make dx positive
        const dy = y0 - y1; // Make dy positive
        let error = 2 * dx - dy;
        let x = x0;

        for (let y = y0; y >= y1; y--) {
            drawPixel(x, y, color);
            if (error > 0) {
                x -= 1;
                error += 2 * (dx - dy);
            } else {
                error += 2 * dx;
            }
        }
    }

    // Octant 6 (dx >= 0, dy < 0, dx < -dy)
    function drawLineOctant6(x0, y0, x1, y1, color) {
        if (y0 < y1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x1 - x0;
        const dy = y0 - y1; // Make dy positive
        let error = 2 * dx - dy;
        let x = x0;

        for (let y = y0; y >= y1; y--) {
            drawPixel(x, y, color);
            if (error > 0) {
                x += 1;
                error += 2 * (dx - dy);
            } else {
                error += 2 * dx;
            }
        }
    }

    // Octant 7 (dx >= 0, dy < 0, dx >= -dy)
    function drawLineOctant7(x0, y0, x1, y1, color) {
        if (x0 > x1) {
            [x0, x1] = [x1, x0];
            [y0, y1] = [y1, y0];
        }

        const dx = x1 - x0;
        const dy = y0 - y1; // Make dy positive
        let error = 2 * dy - dx;
        let y = y0;

        for (let x = x0; x <= x1; x++) {
            drawPixel(x, y, color);
            if (error > 0) {
                y -= 1;
                error += 2 * (dy - dx);
            } else {
                error += 2 * dy;
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Renders an Hermite curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor) {
    }

    //------------------------------------------------------------------
    //
    // Renders a Cardinal curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor) {
    }

    //------------------------------------------------------------------
    //
    // Renders a Bezier curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveBezier(controls, segments, showPoints, showLine, showControl, lineColor) {
    }

    //------------------------------------------------------------------
    //
    // Entry point for rendering the different types of curves.
    // I know a different (functional) JavaScript pattern could be used
    // here.  My goal was to keep it looking Java or C++'ish to keep it familiar
    // to those not experts in JavaScript.
    //
    //------------------------------------------------------------------
    function drawCurve(type, controls, segments, showPoints, showLine, showControl, lineColor) {
        switch (type) {
            case api.Curve.Hermite:
                drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
            case api.Curve.Cardinal:
                drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
            case api.Curve.Bezier:
                drawCurveBezier(controls, segments, showPoints, showLine, showControl, lineColor);
                break;
        }
    }

    //
    // This is what we'll export as the rendering API
    const api = {
        clear: clear,
        drawPixel: drawPixel,
        drawLine: drawLine,
        drawCurve: drawCurve
    };

    Object.defineProperty(api, 'sizeX', {
        value: pixelsX,
        writable: false
    });
    Object.defineProperty(api, 'sizeY', {
        value: pixelsY,
        writable: false
    });
    Object.defineProperty(api, 'Curve', {
        value: Object.freeze({
            Hermite: 0,
            Cardinal: 1,
            Bezier: 2
        }),
        writable: false
    });

    return api;
}(1000, 1000, true));
