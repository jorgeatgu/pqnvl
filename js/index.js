const widthMobile=window.innerWidth>0?window.innerWidth:screen.width,color=d3.scaleOrdinal(["#35618f","#70a5c1","#3444bc","#c8aee7","#c20da6","#ea88e2","#812050","#2eece6"]);function grid(t,a){const e=d3.select(`.grid-chart-${a}`),o=d3.select(".grid-charts");let s,i;widthMobile>544?(s=12,i=o.node().offsetWidth/3):(s=20,i=o.node().offsetWidth);const n=d3_iconarray.layout().width(s).height(8),l=6,c={top:l,right:l,bottom:l,left:l},r=48,d=d3.scaleLinear().range([0,i-(c.left+c.right)]).domain([0,s]),p=e.append("div").attr("class","tooltip").style("opacity",0);function h(t){e.selectAll(".temas").data(t).enter().append("div").attr("class",t=>t.key+" temas").call(function(t,a){n.widthFirst(a),t.append("h3").attr("class","tema-label").html(t=>t.key),t.append("svg").attr("width",i).attr("height",r).append("g").attr("transform",`translate(0,${c.top})`).attr("class","temas").selectAll("rect").data(t=>n(d3.range(0,t.values.length,1))).enter().append("rect").attr("class","rects").attr("x",t=>d(t.position.x)).attr("y",t=>d(t.position.y)).attr("rx",2.5).attr("ry",2.5).attr("fill","#780448").attr("width",2.5*l).attr("height",2.5*l).data(t=>t.values).attr("fill",t=>color(t.nombre)).on("click",t=>{p.attr("class",`tooltip ${t.party}`).style("opacity",0).transition().duration(300).style("opacity",1).style("display","block"),p.html(`<img src="img/times-light.svg" class="tooltip-close"/><h4 class="tooltip-party">${t.party}</h4>\n                            <span class="tooltip-candidate">${t.candidato} el ${t.date}</span>\n                            <p class="tooltip-text">${t.texto}</p>\n                            <a href="${t.fuente}" class="tooltip-source">Fuente</span>\n                            `).style("top",`${d3.event.pageY+r}px`).style("left",`${d3.event.pageX-28}px`),p.select(".tooltip-close").on("click",()=>p.style("opacity",0).style("display","none").transition().duration(300))})},!0)}window.addEventListener("resize",()=>{h()}),d3.json(t).then(t=>{const a=t;a.forEach(t=>{t.partido=t.party,t.candidato=t.candidate,t.propuesta=t.proposal,t.fuente=t.source,t.tema=t.topic,t.texto=t.statement}),h(d3.nest().key(t=>t.tema).entries(a))})}const political=[["csv/poletika.json","total"],["csv/partido-popular/partido-popular.json","pp"],["csv/partido-socialista/partido-socialista.json","psoe"],["csv/unidas-podemos/unidas-podemos.json","up"],["csv/ciudadanos/ciudadanos.json","cs"]];for(const t of political)grid(...t);