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

function grid(csvFile, element) {
    const chart = d3.select(`.grid-chart-${element}`);
    const gridCharts = d3.select('.grid-charts');
    const gridWidth = 16;
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
    const h = 24;
    const w = gridCharts.node().offsetWidth / 3;
    const scale = d3
        .scaleLinear()
        .range([0, w - (margin.left + margin.right)])
        .domain([0, gridWidth]);

    function updateChart(dataz) {
        chart
            .selectAll('.temas')
            .data(dataz)
            .enter()
            .append('div')
            .attr('class', 'temas')
            .call(arrayBars, true);

        function arrayBars(parent, widthFirst) {
            layout.widthFirst(widthFirst);

            parent
                .append('h3')
                .attr('class', 'tema-label')
                .html((d) => d.nombre);

            parent
                .append('svg')
                .attr('width', w)
                .attr('height', h)
                .append('g')
                .attr('transform', `translate(0,${margin.top})`)
                .attr('class', (d) => d.nombre)
                .selectAll('rect')
                .data((d) => layout(d3.range(0, d.total, 1)))
                .enter()
                .append('rect')
                .attr('x', (d) => scale(d.position.x))
                .attr('y', (d) => scale(d.position.y))
                .attr('rx', 2.5)
                .attr('ry', 2.5)
                .attr('class', (d) => d.nombre)
                .attr('width', radius * 2.5)
                .attr('height', radius * 2.5);
        }
    }

    function loadData() {
        d3.csv(csvFile, (error, data) => {
            if (error) {
                console.log(error);
            } else {
                dataz = data;
                dataz.forEach((d) => {
                    d.nombre = d.nombre;
                    d.total = +d.total;
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

forceLayout();

const political = [
    ['csv/partido-popular/partido-popular-total-propuestas.csv', 'pp'],
    ['csv/partido-socialista/partido-socialista-total-propuestas.csv', 'psoe'],
    ['csv/unidas-podemos/unidas-podemos-total-propuestas.csv', 'up'],
    ['csv/ciudadanos/ciudadanos-total-propuestas.csv', 'cs'],
    ['csv/vox/vox-total-propuestas.csv', 'vox'],
];

for (const args of political) grid(...args);
