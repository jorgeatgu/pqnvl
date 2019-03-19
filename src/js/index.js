const widthMobile = window.innerWidth > 0 ? window.innerWidth : screen.width;

function forceLayout() {
    const chart = d3.select('.chart-force');
    const svg = chart.select('svg');
    const nodePadding = 2;
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

    function updateChart(dataz) {
        const w = chart.node().offsetWidth;
        const h = 600;

        svg.attr('width', w).attr('height', h);

        const node = svg
            .selectAll('.circle')
            .data(dataz)
            .enter()
            .append('circle')
            .attr('class', 'circle')
            .attr('r', (d) => d.total * 10)
            .attr('fill', (d) => color(d.nombre))
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y);

        const simulation = d3
            .forceSimulation()
            .force('forceX', d3.forceX().x(w * 0.5))
            .force('forceY', d3.forceY().y(h * 0.5))
            .force(
                'center',
                d3
                    .forceCenter()
                    .x(w * 0.5)
                    .y(h * 0.5)
            )
            .force('charge', d3.forceManyBody().strength(5))
            .force('collision', d3.forceCollide().radius((d) => d.total * 10));

        simulation
            .nodes(dataz)
            .force(
                'collide',
                d3
                    .forceCollide()
                    .strength(0.5)
                    .radius((d) => d.total + nodePadding)
                    .iterations(1)
            )
            .on('tick', () =>
                node.attr('cx', ({ x }) => x).attr('cy', ({ y }) => y)
            );

        const legendData = d3.group(dataz.map((d) => d.nombre));
        let unique = legendData.filter(
            (elem, pos) => legendData.indexOf(elem) === pos
        );

        unique = unique.reverse((d) => d.nombre);

        const legend = svg
            .selectAll('.legend')
            .remove()
            .exit()
            .data(unique, (d) => d)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('tema', (d) => d);

        legend.attr('transform', (d, i) => `translate(${50},${(i + 5) * 25})`);
        legend
            .append('text')
            .attr('x', 20)
            .attr('y', 10)
            .text((d) => d);

        legend
            .append('rect')
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', (d) => color(d));
    }

    function loadData() {
        d3.csv('csv/total.csv', (error, data) => {
            if (error) {
                console.log(error);
            } else {
                dataz = data;
                dataz.forEach((d) => {
                    d.nombre = d.nombre;
                    d.total = +d.total;
                    d.pp = +d.pp;
                    d.psoe = +d.psoe;
                    d.cs = +d.cs;
                    d.up = +d.up;
                });
                updateChart(dataz);
            }
        });
    }

    const resize = () => {
        updateChart(dataz);
    };

    window.addEventListener('resize', resize);

    loadData();
}

function grid(jsonFile, element) {
    const chart = d3.select(`.grid-chart-${element}`);
    const gridCharts = d3.select('.grid-charts');
    const gridWidth = 12;
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
    const w = gridCharts.node().offsetWidth / 3;
    const scale = d3
        .scaleLinear()
        .range([0, w - (margin.left + margin.right)])
        .domain([0, gridWidth]);

    const tooltip = d3
        .select(`.container-political-${element}`)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    function updateChart(dataz) {
        chart
            .selectAll('.temas')
            .data(dataz)
            .enter()
            .append('div')
            .attr('class', (d) => d.key)
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
                .on('click', (d) => {
                    tooltip
                        .attr('class', `tooltip ${d.party}`)
                        .style('opacity', 0)
                        .transition()
                        .duration(300)
                        .style('opacity', 1);
                    tooltip.html(
                        `<h4 class="tooltip-party">${d.party}</h4>
                            <span class="tooltip-candidate">${d.candidato}</span>
                            <span class="tooltip-date">${d.date}</span>
                            <p class="tooltip-text">${d.texto}</p>
                            <a href="${
                                d.fuente
                            }" class="tooltip-source">Fuente</span>
                            `
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
        updateChart(dataz);
    };

    window.addEventListener('resize', resize);

    loadData();
}

grid();

forceLayout();

const political = [
    ['csv/partido-popular/partido-popular.json', 'pp'],
    ['csv/partido-socialista/partido-socialista.json', 'psoe'],
    ['csv/unidas-podemos/unidas-podemos.json', 'up'],
    ['csv/ciudadanos/ciudadanos.json', 'cs'],
    /*['csv/vox/vox.json', 'vox'],*/
];

for (const args of political) grid(...args);
