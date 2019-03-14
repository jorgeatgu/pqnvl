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
    let dataz;

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
            .attr('fill', (d) => color(d.tema))
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

        const legendData = d3.group(dataz.map((d) => d.tema));
        let unique = legendData.filter(
            (elem, pos) => legendData.indexOf(elem) === pos
        );

        unique = unique.reverse((d) => d.tema);

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
                    d.tema = d.tema;
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

forceLayout();
