document.addEventListener('DOMContentLoaded', () => {
    const inputA = document.getElementById('val-a');
    const inputB = document.getElementById('val-b');
    const choices = [...document.querySelectorAll('input[name="product-type"]')];
    const formulaDisplay = document.getElementById('formula-display');
    const visualization = document.getElementById('visualization');
    const legend = document.getElementById('legend');
    const steps = document.getElementById('explanation-steps');
    const notice = document.getElementById('geometry-notice');
    const fullscreenButton = document.getElementById('fullscreen-button');
    const status = document.getElementById('app-status');
    const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
    const fmt = value => number.format(value);
    const titles = {
        'sum-square': 'Quadrado da soma',
        'diff-square': 'Quadrado da diferença',
        'sum-diff-prod': 'Soma pela diferença'
    };

    // SVG coordinates keep every area proportional while fitting any screen.
    const svg = (description, content, height = 510) =>
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 ' + height +
        '" role="img" aria-label="' + description + '">' +
        '<title>' + description + '</title>' + content + '</svg>';

    function label(x, y, text, className = '') {
        return '<text x="' + x + '" y="' + y +
            '" class="shape-label ' + className + '">' + text + '</text>';
    }

    function rect(x, y, width, height, color, text = '', light = false) {
        const shape = '<rect x="' + x + '" y="' + y + '" width="' + width +
            '" height="' + height + '" class="area-shape fill-' + color + '"/>';
        // Tiny pieces remain proportional; their names are always in the legend.
        return shape + (text && width >= 52 && height >= 35 ?
            label(x + width / 2, y + height / 2, text, light ? 'label-light' : '') : '');
    }

    function dimension(x, y, length, text, vertical = false) {
        const endX = vertical ? x : x + length;
        const endY = vertical ? y + length : y;
        const ticks = vertical ?
            'M ' + (x - 5) + ' ' + y + ' H ' + (x + 5) +
            ' M ' + (x - 5) + ' ' + endY + ' H ' + (x + 5) :
            'M ' + x + ' ' + (y - 5) + ' V ' + (y + 5) +
            ' M ' + endX + ' ' + (y - 5) + ' V ' + (y + 5);
        const textX = vertical ? x - 24 : x + length / 2;
        const textY = vertical ? y + length / 2 : y - 18;
        const rotate = vertical ?
            ' transform="rotate(-90 ' + textX + ' ' + textY + ')"' : '';
        return '<path class="dimension" d="M ' + x + ' ' + y + ' L ' +
            endX + ' ' + endY + ' ' + ticks + '"/>' +
            '<text x="' + textX + '" y="' + textY + '"' + rotate +
            ' class="dimension-label">' + text + '</text>';
    }

    function outline(x, y, width, height) {
        return '<rect x="' + x + '" y="' + y + '" width="' + width +
            '" height="' + height + '" class="figure-outline"/>';
    }

    function showLegend(items) {
        legend.innerHTML = items.map(([color, text]) =>
            '<li><span class="swatch swatch-' + color + '" aria-hidden="true"></span><span>' +
            text + '</span></li>').join('');
    }

    function showSteps(items) {
        steps.innerHTML = items.map(([title, text]) =>
            '<li><strong>' + title + '</strong>' + text + '</li>').join('');
    }

    function drawSum(a, b) {
        const scale = 360 / (a + b);
        const A = a * scale, B = b * scale, x = 80, y = 80;
        const content =
            rect(x, y, A, A, 'a', 'a²') +
            rect(x + A, y, B, A, 'ab', 'ab') +
            rect(x, y + A, A, B, 'ab', 'ab') +
            rect(x + A, y + A, B, B, 'b', 'b²', true) +
            outline(x, y, 360, 360) +
            dimension(x, y - 15, A, 'a') +
            dimension(x + A, y - 15, B, 'b') +
            dimension(x - 14, y, A, 'a', true) +
            dimension(x - 14, y + A, B, 'b', true) +
            dimension(x, y + 406, 360, 'a + b = ' + fmt(a + b));
        visualization.innerHTML = '<figure class="figure">' +
            svg('Quadrado de lado ' + fmt(a + b) +
                ', dividido em a², dois retângulos ab e b².', content) + '</figure>';
        showLegend([
            ['a', 'a² = ' + fmt(a * a)],
            ['ab', '2 · ab = ' + fmt(2 * a * b)],
            ['b', 'b² = ' + fmt(b * b)]
        ]);
    }

    function drawDifference(a, b) {
        const scale = 360 / a;
        const B = b * scale, D = (a - b) * scale, x = 80, y = 80;
        const hatch = '<defs><pattern id="removed-hatch" width="9" height="9" ' +
            'patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
            '<rect width="9" height="9" fill="#fbe8ed"/>' +
            '<line x1="0" y1="0" x2="0" y2="9" stroke="#eeb1c5" stroke-width="3"/>' +
            '</pattern></defs>';
        const content = hatch +
            rect(x, y, 360, 360, 'a') +
            rect(x, y, D, D, 'result', '(a − b)²') +
            '<path d="M ' + (x + D) + ' ' + y + ' H ' + (x + 360) +
            ' V ' + (y + 360) + ' H ' + x + ' V ' + (y + D) +
            ' H ' + (x + D) + ' Z" fill="url(#removed-hatch)"/>' +
            '<rect x="' + (x + D) + '" y="' + y + '" width="' + B +
            '" height="360" fill="none" stroke="#bd3928" stroke-width="2" stroke-dasharray="7 5"/>' +
            '<rect x="' + x + '" y="' + (y + D) + '" width="360" height="' + B +
            '" fill="none" stroke="#bd3928" stroke-width="2" stroke-dasharray="7 5"/>' +
            '<rect x="' + (x + D) + '" y="' + (y + D) + '" width="' + B +
            '" height="' + B + '" fill="#8156ed22" stroke="#6938c8" stroke-width="2"/>' +
            (B > 45 ? label(x + D + B / 2, y + D + B / 2, 'b²') : '') +
            outline(x, y, 360, 360) +
            dimension(x, y - 15, D, 'a − b') +
            dimension(x + D, y - 15, B, 'b') +
            dimension(x - 14, y, 360, 'a = ' + fmt(a), true) +
            dimension(x, y + 406, 360, 'a = ' + fmt(a));
        visualization.innerHTML = '<figure class="figure">' +
            svg('Quadrado de lado a. A região amarela tem lado a menos b. ' +
                'As faixas hachuradas se cruzam no canto b², que é contado duas vezes ao subtrair 2ab.',
            content) + '</figure>';
        showLegend([
            ['result', 'Área restante = ' + fmt((a - b) ** 2)],
            ['cut', 'Faixas retiradas: 2ab − b²'],
            ['b', 'Interseção: b² = ' + fmt(b * b)]
        ]);
    }

    function drawProduct(a, b) {
        // Both figures use the same scale. Piece 2 rotates to make the rectangle.
        const scale = 360 / (a + b);
        const A = a * scale, B = b * scale, D = (a - b) * scale;
        const x = 80, y = 80;
        const before =
            rect(x, y, A, D, 'a', '1') +
            rect(x, y + D, D, B, 'ab', '2') +
            rect(x + D, y + D, B, B, 'cut', '−b²') +
            '<path d="M ' + (x + D) + ' ' + (y + D) + ' L ' +
            (x + A) + ' ' + (y + A) + ' M ' + (x + A) + ' ' +
            (y + D) + ' L ' + (x + D) + ' ' + (y + A) +
            '" stroke="#a64a73" stroke-width="2"/>' +
            outline(x, y, A, A) +
            dimension(x, y - 15, A, 'a = ' + fmt(a)) +
            dimension(x - 14, y, A, 'a', true);
        const after =
            rect(x, y, A, D, 'a', '1') +
            rect(x + A, y, B, D, 'ab', '2') +
            outline(x, y, 360, D) +
            dimension(x, y - 15, 360, 'a + b = ' + fmt(a + b)) +
            dimension(x - 14, y, D, 'a − b', true);
        visualization.innerHTML = '<div class="figure-pair">' +
            '<figure class="figure"><figcaption>1. Retire o quadrado b²</figcaption>' +
            svg('Quadrado a² sem o canto b². Peça 1: a por a menos b. ' +
                'Peça 2: a menos b por b.', before, 440) + '</figure>' +
            '<figure class="figure"><figcaption>2. Gire a peça 2 e encaixe ao lado</figcaption>' +
            svg('As mesmas peças formam um retângulo de base a mais b e altura a menos b. ' +
                'As duas figuras usam a mesma escala.', after, 440) + '</figure></div>';
        showLegend([
            ['a', 'Peça 1: a(a − b) = ' + fmt(a * (a - b))],
            ['ab', 'Peça 2: b(a − b) = ' + fmt(b * (a - b))],
            ['cut', 'Retirado: b² = ' + fmt(b * b)]
        ]);
    }

    function updateVisualization() {
        const type = choices.find(choice => choice.checked).value;
        const a = Number(inputA.value), b = Number(inputB.value);
        document.getElementById('a-display').value = fmt(a);
        document.getElementById('b-display').value = fmt(b);
        inputA.setAttribute('aria-valuetext', fmt(a));
        inputB.setAttribute('aria-valuetext', fmt(b));
        document.getElementById('visual-title').textContent = titles[type];
        let symbolic, numeric, total;

        if (type === 'sum-square') {
            symbolic = '(a + b)² = <span class="term-a">a²</span> + ' +
                '<span class="term-ab">2ab</span> + <span class="term-b">b²</span>';
            total = (a + b) ** 2;
            numeric = '(' + fmt(a) + ' + ' + fmt(b) + ')² = ' +
                fmt(a * a) + ' + ' + fmt(2 * a * b) + ' + ' + fmt(b * b);
            document.getElementById('explore-tip').textContent =
                'Por que aparecem dois retângulos de área a · b?';
            showSteps([
                ['Some os lados', 'O quadrado maior tem lado a + b. Sua área é (a + b)².'],
                ['Observe as quatro partes', 'Há um quadrado a², dois retângulos ab e um quadrado b².'],
                ['Some as áreas', 'As partes preenchem o quadrado: a² + ab + ab + b² = a² + 2ab + b².']
            ]);
        } else if (type === 'diff-square') {
            symbolic = '(a − b)² = <span class="term-a">a²</span> − ' +
                '<span class="term-ab">2ab</span> + <span class="term-b">b²</span>';
            total = (a - b) ** 2;
            numeric = '(' + fmt(a) + ' − ' + fmt(b) + ')² = ' +
                fmt(a * a) + ' − ' + fmt(2 * a * b) + ' + ' + fmt(b * b);
            document.getElementById('explore-tip').textContent =
                'Por que somamos b² depois de subtrair as duas faixas?';
            showSteps([
                ['Comece com a²', 'Parta de um quadrado de lado a e marque duas faixas de largura b.'],
                ['Retire as duas faixas', 'Cada faixa tem área ab. Ao subtrair 2ab, o canto b² é contado duas vezes.'],
                ['Corrija a contagem', 'Some b² uma vez. Resta o quadrado de lado a − b: a² − 2ab + b².']
            ]);
        } else {
            symbolic = '(a + b)(a − b) = <span class="term-a">a²</span> − <span class="term-b">b²</span>';
            total = a * a - b * b;
            numeric = '(' + fmt(a) + ' + ' + fmt(b) + ') · (' + fmt(a) +
                ' − ' + fmt(b) + ') = ' + fmt(a * a) + ' − ' + fmt(b * b);
            document.getElementById('explore-tip').textContent =
                'As peças mudam de posição, mas a soma de suas áreas muda?';
            showSteps([
                ['Retire b²', 'Do quadrado a², retire o quadrado b². A região que sobra tem forma de L.'],
                ['Reorganize as peças', 'A peça 1 mede a por a − b. Gire a peça 2, de medidas a − b por b, e encaixe à direita.'],
                ['Reconheça o retângulo', 'A base é a + b e a altura é a − b. Assim, (a + b)(a − b) = a² − b².']
            ]);
        }

        formulaDisplay.innerHTML = '<div class="symbolic-formula">' + symbolic +
            '</div><div class="numeric-formula">' + numeric +
            ' = <strong id="area-result">' + fmt(total) + '</strong></div>';
        formulaDisplay.dataset.result = String(total);
        notice.hidden = true;

        if (type !== 'sum-square' && a <= b) {
            notice.hidden = false;
            notice.textContent = a === b ?
                'Quando a = b, a diferença é zero. A figura tem área nula; a identidade continua válida.' :
                'Para esta construção com comprimentos positivos, escolha a > b. ' +
                'A identidade algébrica acima continua válida para os valores escolhidos.';
            visualization.innerHTML = '<div class="empty-state"><span class="empty-symbol" aria-hidden="true">' +
                (a === b ? '0' : 'a > b') + '</span><p>' +
                (a === b ? 'Aumente a ou diminua b para explorar uma figura com área positiva.' :
                    'Mude os valores nos controles para voltar a visualizar a construção.') + '</p></div>';
            legend.replaceChildren();
        } else if (type === 'sum-square') {
            drawSum(a, b);
        } else if (type === 'diff-square') {
            drawDifference(a, b);
        } else {
            drawProduct(a, b);
        }
    }

    choices.forEach(choice => choice.addEventListener('change', updateVisualization));
    inputA.addEventListener('input', updateVisualization);
    inputB.addEventListener('input', updateVisualization);
    document.getElementById('reset-button').addEventListener('click', () => {
        inputA.value = '5';
        inputB.value = '3';
        choices[0].checked = true;
        updateVisualization();
        status.textContent = 'Exemplo reiniciado. Quadrado da soma, a = 5 e b = 3.';
    });

    if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
        fullscreenButton.hidden = false;
        fullscreenButton.addEventListener('click', async () => {
            try {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                } else {
                    await document.documentElement.requestFullscreen();
                }
            } catch {
                status.textContent = 'Não foi possível abrir a tela cheia neste navegador.';
            }
        });
        document.addEventListener('fullscreenchange', () => {
            fullscreenButton.innerHTML = document.fullscreenElement ?
                'Sair da tela cheia <span aria-hidden="true">⛶</span>' :
                'Tela cheia <span aria-hidden="true">⛶</span>';
        });
    }

    updateVisualization();
});
