document.addEventListener('DOMContentLoaded', () => {
    const productTypeSelect = document.getElementById('product-type');
    const inputA = document.getElementById('val-a');
    const inputB = document.getElementById('val-b');
    const displayA = document.getElementById('a-display');
    const displayB = document.getElementById('b-display');
    const formulaDisplay = document.getElementById('formula-display');
    const visualization = document.getElementById('visualization');

    const SCALE = 25; // Scale factor: 1 unit = 25px

    function updateVisualization() {
        const type = productTypeSelect.value;
        const a = parseFloat(inputA.value);
        const b = parseFloat(inputB.value);

        displayA.textContent = a;
        displayB.textContent = b;

        visualization.innerHTML = ''; // Clear current

        if (type === 'sum-square') {
            drawSumSquare(a, b);
            formulaDisplay.innerHTML = `(a+b)² = a² + 2ab + b² <br> (${a}+${b})² = ${a*a} + ${2*a*b} + ${b*b} = ${Math.pow(a+b, 2)}`;
        } else if (type === 'diff-square') {
            // For difference square, 'a' should generally be greater than 'b' to make sense visually
            let actualA = a;
            let actualB = b;
            if (b >= a) {
                // Adjust a to be larger than b just for visual purposes, or show message
                formulaDisplay.innerHTML = `Para visualizar corretamente, 'a' deve ser maior que 'b'.`;
                return;
            }
            drawDiffSquare(actualA, actualB);
            formulaDisplay.innerHTML = `(a-b)² = a² - 2ab + b² <br> (${actualA}-${actualB})² = ${actualA*actualA} - ${2*actualA*actualB} + ${actualB*actualB} = ${Math.pow(actualA-actualB, 2)}`;
        } else if (type === 'sum-diff-prod') {
             if (b >= a) {
                formulaDisplay.innerHTML = `Para visualizar corretamente, 'a' deve ser maior que 'b'.`;
                return;
            }
            drawSumDiffProd(a, b);
            formulaDisplay.innerHTML = `(a+b)(a-b) = a² - b² <br> (${a}+${b})(${a}-${b}) = ${a*a} - ${b*b} = ${a*a - b*b}`;
        }
    }

    function createShape(width, height, top, left, className, text) {
        const shape = document.createElement('div');
        shape.className = `shape ${className}`;
        shape.style.width = `${width * SCALE}px`;
        shape.style.height = `${height * SCALE}px`;
        shape.style.top = `${top * SCALE}px`;
        shape.style.left = `${left * SCALE}px`;
        shape.textContent = text;
        return shape;
    }

    function drawSumSquare(a, b) {
        const canvas = document.createElement('div');
        canvas.className = 'canvas';

        const totalSize = (a + b) * SCALE;
        canvas.style.width = `${totalSize}px`;
        canvas.style.height = `${totalSize}px`;

        // a^2
        canvas.appendChild(createShape(a, a, 0, 0, 'shape-a2', 'a²'));

        // ab (top right)
        canvas.appendChild(createShape(b, a, 0, a, 'shape-ab', 'ab'));

        // ab (bottom left)
        canvas.appendChild(createShape(a, b, a, 0, 'shape-ab', 'ab'));

        // b^2
        canvas.appendChild(createShape(b, b, a, a, 'shape-b2', 'b²'));

        visualization.appendChild(canvas);
    }

    function drawDiffSquare(a, b) {
        const canvas = document.createElement('div');
        canvas.className = 'canvas';

        // The main square is a^2
        const totalSize = a * SCALE;
        canvas.style.width = `${totalSize}px`;
        canvas.style.height = `${totalSize}px`;

        // We want to show that (a-b)^2 is a^2 - 2ab + b^2
        // We start with a^2
        canvas.appendChild(createShape(a, a, 0, 0, 'shape-a2', 'a²'));

        // We subtract an area of a*b from the right
        const rightAb = createShape(b, a, 0, a - b, 'shape-ab-neg', '-ab');
        rightAb.style.opacity = '0.7';
        canvas.appendChild(rightAb);

        // We subtract an area of a*b from the bottom
        // But since they overlap in b^2, we effectively subtracted b^2 twice
        const bottomAb = createShape(a, b, a - b, 0, 'shape-ab-neg', '-ab');
        bottomAb.style.opacity = '0.7';
        canvas.appendChild(bottomAb);

        // We add b^2 back in the overlapping corner
        const cornerB2 = createShape(b, b, a - b, a - b, 'shape-b2', '+b²');
        cornerB2.style.zIndex = '10';
        canvas.appendChild(cornerB2);

        // The remaining area in top left is (a-b)^2
        const aminusb2 = createShape(a - b, a - b, 0, 0, 'shape-a2', '(a-b)²');
        aminusb2.style.background = '#ffeaa7';
        aminusb2.style.zIndex = '5';
        canvas.appendChild(aminusb2);

        visualization.appendChild(canvas);
    }

    function drawSumDiffProd(a, b) {
        const canvas = document.createElement('div');
        canvas.className = 'canvas';

        // Visualizing (a+b)(a-b) = a^2 - b^2
        // Start with a^2
        const totalSize = a * SCALE;
        // The container needs to be a bit wider to show the moved piece if we animate,
        // but for static representation, we'll just show the pieces.

        canvas.style.width = `${(a+b) * SCALE}px`;
        canvas.style.height = `${(2 * a + 1 - b) * SCALE}px`;

        // a^2 base
        const baseA2 = createShape(a, a, 0, 0, 'shape-a2', 'a²');
        canvas.appendChild(baseA2);

        // We "cut out" b^2 from a^2 (bottom right corner)
        const cutB2 = createShape(b, b, a - b, a - b, 'shape-b2', '-b²');
        cutB2.style.opacity = '0.8';
        canvas.appendChild(cutB2);

        // The remaining part is a^2 - b^2, which consists of a rectangle of (a-b) * a and a rectangle of b * (a-b).
        // Let's highlight the piece we move: a rectangle of a * (a-b) at top and b * (a-b) at left.

        // Actually, the standard visualization takes the a*b - b^2 rectangle (which is b*(a-b))
        // from the right and moves it to the bottom or vice versa.

        // Let's draw it as:
        // Top rectangle: width a, height (a-b)
        const topRect = createShape(a, a - b, 0, 0, 'shape-ab', 'a(a-b)');
        topRect.style.background = 'transparent';
        topRect.style.border = '2px solid black';
        topRect.style.zIndex = '5';
        canvas.appendChild(topRect);

        // Instead of moving, let's represent the final rectangle: width (a+b), height (a-b)
        const finalRect = createShape(a + b, a - b, a + 1, 0, 'shape-ab', '(a+b)(a-b)');
        finalRect.style.background = '#81ecec';
        canvas.appendChild(finalRect);

        const arrow = document.createElement('div');
        arrow.style.position = 'absolute';
        arrow.style.top = `${a*SCALE - (b/2)*SCALE}px`;
        arrow.style.left = `${a*SCALE/2}px`;
        arrow.innerHTML = '&#8595; Área Resultante: a² - b²';
        arrow.style.fontWeight = 'bold';
        canvas.appendChild(arrow);
        visualization.appendChild(canvas);
    }

    productTypeSelect.addEventListener('change', updateVisualization);
    inputA.addEventListener('input', updateVisualization);
    inputB.addEventListener('input', updateVisualization);

    // Initial draw
    updateVisualization();
});
