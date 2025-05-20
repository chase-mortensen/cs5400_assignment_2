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
    function drawLine(x1, y1, x2, y2, color) {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);

        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            drawPixel(x1, y1, color);

            if (x1 === x2 && y1 === y2) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
    }

    //------------------------------------------------------------------
    //
    // Renders an Hermite curve based on the input parameters.
    //
    //------------------------------------------------------------------
    const hermiteBasisCache = new Map();

    function getHermiteBasis(segments) {
        // Note: This is the optimization for the hermite function
        const cacheKey = segments.toString();
        if (hermiteBasisCache.has(cacheKey)) {
            return hermiteBasisCache.get(cacheKey);
        }

        const basis = [];
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const t2 = t * t;
            const t3 = t2 * t;

            basis.push({
                h0: 2 * t3 - 3 * t2 + 1,
                h1: -2 * t3 + 3 * t2,
                h2: t3 - 2 * t2 + t,
                h3: t3 - t2
            });
        }

        // Store in cache - optimization
        hermiteBasisCache.set(cacheKey, basis);
        return basis;
    }

    function drawCurveHermite(controls, segments, showPoints, showLine, showControl, lineColor) {
        // controls[0] = P0 (first endpoint) {x, y}
        // controls[1] = T0 (tangent vector at P0) {x, y}
        // controls[2] = P1 (second endpoint) {x, y}
        // controls[3] = T1 (tangent vector at P1) {x, y}

        if (!controls || controls.length < 4) {
            console.error("Hermite curve requires 4 control points");
            return [];
        }

        if (segments <= 0) {
            console.warn("Number of segments must be positive");
            return [];
        }

        const p0 = controls[0];
        const t0 = controls[1];
        const p1 = controls[2];
        const t1 = controls[3];

        // Pre-compute happens here
        const basis = getHermiteBasis(segments);

        const curvePoints = [];
        for (let i = 0; i <= segments; i++) {
            // Use pre-computed basis values
            const { h0, h1, h2, h3 } = basis[i];

            const x = h0 * p0.x + h1 * p1.x + h2 * t0.x + h3 * t1.x;
            const y = h0 * p0.y + h1 * p1.y + h2 * t0.y + h3 * t1.y;

            curvePoints.push({x, y});
        }

        if (showLine) {
            for (let i = 0; i < curvePoints.length - 1; i++) {
                drawLine(
                    curvePoints[i].x, curvePoints[i].y,
                    curvePoints[i+1].x, curvePoints[i+1].y,
                    lineColor
                );
            }
        }

        if (showPoints) {
            for (const point of curvePoints) {
                drawPoint(point.x, point.y, "red");
            }
        }

        if (showControl) {
            drawPoint(p0.x, p0.y, "blue");
            drawPoint(p1.x, p1.y, "blue");

            // multiplied these by 0.25 because the lines
            // got really long and sometimes went off screen
            drawLine(
                p0.x, p0.y,
                p0.x + (t0.x * 0.25), p0.y + (t0.y * 0.25),
                "green"
            );
            drawLine(
                p1.x, p1.y,
                p1.x + (t1.x * 0.25), p1.y + (t1.y * 0.25),
                "green"
            );
        }

        return curvePoints;
    }

    //------------------------------------------------------------------
    //
    // Renders a Cardinal curve based on the input parameters.
    //
    //------------------------------------------------------------------
    function drawCurveCardinal(controls, segments, showPoints, showLine, showControl, lineColor) {
        // controls: {
        //      points: [ {x: number, y: number}, ...],
        //      tension: number
        // }

        if (!controls || !controls.points || !Array.isArray(controls.points)) {
            console.error("Cardinal curve requires controls.points as an array");
            return [];
        }

        const points = controls.points;

        if (points.length < 2) {
            console.error("Cardinal curve requires at least 2 control points");
            return [];
        }

        if (segments <= 0) {
            console.warn("Number of segments must be positive");
            return [];
        }

        const tension = controls.tension !== undefined ? controls.tension : 0;
        const alpha = (1 - tension) / 2;

        // Optimization: Get the pre-computed Hermite basis functions
        const basis = getHermiteBasis(segments);

        const allCurvePoints = [];

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = i > 0 ? points[i-1] : points[0];
            const p1 = points[i];
            const p2 = points[i+1];
            const p3 = i < points.length - 2 ? points[i+2] : points[points.length-1];

            const t1 = {
                x: alpha * (p2.x - p0.x),
                y: alpha * (p2.y - p0.y)
            };

            const t2 = {
                x: alpha * (p3.x - p1.x),
                y: alpha * (p3.y - p1.y)
            };

            const segmentPoints = [];
            for (let j = 0; j <= segments; j++) {
                // Optimization: pre-computed basis values instead of recalculating
                const { h0, h1, h2, h3 } = basis[j];

                const x = h0 * p1.x + h1 * p2.x + h2 * t1.x + h3 * t2.x;
                const y = h0 * p1.y + h1 * p2.y + h2 * t1.y + h3 * t2.y;

                segmentPoints.push({x, y});
            }

            if (i < points.length - 2) {
                segmentPoints.pop();
            }

            allCurvePoints.push(...segmentPoints);
        }

        if (showLine) {
            for (let i = 0; i < allCurvePoints.length - 1; i++) {
                drawLine(
                    allCurvePoints[i].x, allCurvePoints[i].y,
                    allCurvePoints[i+1].x, allCurvePoints[i+1].y,
                    lineColor
                );
            }
        }

        if (showPoints) {
            for (const point of allCurvePoints) {
                drawPoint(point.x, point.y, "red");
            }
        }

        if (showControl) {
            // Fixed to use points instead of controls
            for (const point of points) {
                drawPoint(point.x, point.y, "blue");
            }
            for (let i = 0; i < points.length - 1; i++) {
                drawLine(
                    points[i].x, points[i].y,
                    points[i+1].x, points[i+1].y,
                    "green"
                );
            }
        }

        return allCurvePoints;
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
}(500, 500, true));
