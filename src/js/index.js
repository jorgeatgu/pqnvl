const widthMobile = window.innerWidth > 0 ? window.innerWidth : screen.width;

const color = d3.scaleOrdinal([
    '#35618f',
    '#70a5c1',
    '#3444bc',
    '#c8aee7',
    '#c20da6',
    '#ea88e2',
    '#812050',
    '#2eece6',
]);

function grid(jsonFile, element) {
    const chart = d3.select(`.grid-chart-${element}`);
    const gridCharts = d3.select('.grid-charts');
    let gridWidth;
    let w;
    function res() {
        if (widthMobile > 544) {
            gridWidth = 12;
            w = gridCharts.node().offsetWidth / 3;
            return {
                gridWidth: gridWidth,
                w: w,
            };
        } else {
            gridWidth = 20;
            w = gridCharts.node().offsetWidth;
            return {
                gridWidth: gridWidth,
                w: w,
            };
        }
    }
    res();
    const gridHeight = 8;
    const layout = d3_iconarray
        .layout()
        .width(gridWidth)
        .height(gridHeight);
    const radius = 6;
    const margin = {
        top: radius,
        right: radius,
        bottom: radius,
        left: radius,
    };
    const h = 48;
    const scale = d3
        .scaleLinear()
        .range([0, w - (margin.left + margin.right)])
        .domain([0, gridWidth]);

    const tooltip = chart
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    function updateChart(dataz) {
        chart
            .selectAll('.temas')
            .data(dataz)
            .enter()
            .append('div')
            .attr('class', (d) => d.key + ' temas')
            .call(arrayBars, true);

        function arrayBars(parent, widthFirst) {
            layout.widthFirst(widthFirst);
            parent
                .append('h3')
                .attr('class', 'tema-label')
                .html((d) => d.key);

            parent
                .append('svg')
                .attr('width', w)
                .attr('height', h)
                .append('g')
                .attr('transform', `translate(0,${margin.top})`)
                .attr('class', 'temas')
                .selectAll('rect')
                .data((d) => layout(d3.range(0, d.values.length, 1)))
                .enter()
                .append('rect')
                .attr('class', 'rects')
                .attr('x', (d) => scale(d.position.x))
                .attr('y', (d) => scale(d.position.y))
                .attr('rx', 2.5)
                .attr('ry', 2.5)
                .attr('fill', '#780448')
                .attr('width', radius * 2.5)
                .attr('height', radius * 2.5)
                .data((d) => d.values)
                .attr('fill', (d) => color(d.nombre))
                .on('click', (d) => {
                    const imgUrl = `<img src="img/times-light.svg" class="tooltip-close"/>`;
                    tooltip
                        .attr('class', `tooltip ${d.party}`)
                        .style('opacity', 0)
                        .transition()
                        .duration(300)
                        .style('opacity', 1)
                        .style('display', 'block');
                    tooltip
                        .html(
                            `${imgUrl}<h4 class="tooltip-party">${d.party}</h4>
                            <span class="tooltip-candidate">${d.candidato} el ${
                                d.date
                            }</span>
                            <p class="tooltip-text">${d.texto}</p>
                            <a href="${
                                d.fuente
                            }" class="tooltip-source">Fuente</span>
                            `
                        )
                        .style('top', `${d3.event.pageY + h}px`)
                        .style('left', `${d3.event.pageX - 28}px`);
                    tooltip.select('.tooltip-close').on('click', () =>
                        tooltip
                            .style('opacity', 0)
                            .style('display', 'none')
                            .transition()
                            .duration(300)
                    );
                });
        }
    }

    function loadData() {
        d3.json(jsonFile).then((data) => {
            const dataz = data;

            dataz.forEach((d) => {
                d.partido = d.party;
                d.candidato = d.candidate;
                d.propuesta = d.proposal;
                d.fuente = d.source;
                d.tema = d.topic;
                d.texto = d.statement;
            });

            const topicCount = d3
                .nest()
                .key((d) => d.tema)
                .entries(dataz);

            updateChart(topicCount);
        });
    }

    const resize = () => {
        updateChart();
    };

    window.addEventListener('resize', resize);

    loadData();
}

const political = [
    ['csv/poletika.json', 'total'],
    ['csv/partido-popular/partido-popular.json', 'pp'],
    ['csv/partido-socialista/partido-socialista.json', 'psoe'],
    ['csv/unidas-podemos/unidas-podemos.json', 'up'],
    ['csv/ciudadanos/ciudadanos.json', 'cs'],

    /* ['csv/vox/vox.json', 'vox'], */
];

for (const args of political) grid(...args);
