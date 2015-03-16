function drawEgoNet(graph, prerender){
	
    var width = 640,
    height = 500,
    radius = 20,
    color = d3.scale.category10().domain([
		"Topic 0: thank love quot via great follow good day life twitter",
		"Topic 1: iranelect iran via use india d buy p green car",
		"Topic 2: new thank blog food bit post ; week look x",
		"Topic 3: lol get like got go shit lmao know good need",
		"Topic 4: get free site win nice check new market affili list",
		"Topic 5: new news game sport music blog report video event time",
		"Topic 6: like get go think it' one know good love time",
		"Topic 7: twitter new post social media use via blog googl tweet",
		"Topic 8: lol new love thank fuck rob pic get ; follow",
		"Topic 9: tcot health obama news care new say us polit hous"
	]);
	
	//Toggle stores whether the highlighting is on
	var toggle = 0;
	//Create an array logging what is connected to what
	var linkedByIndex = {};
	for (i = 0; i < graph.nodes.length; i++) {
		linkedByIndex[i + "," + i] = 1;
	};
	graph.links.forEach(function (d) {
		linkedByIndex[d.source + "," + d.target] = 1;
	});
	
	//This function looks up whether a pair are neighbours
	function neighboring(a, b) {
		return linkedByIndex[a.index + "," + b.index];
	}

	function connectedNodes() {
		if (toggle == 0) {
			//Reduce the opacity of all but the neighbouring nodes
			d = d3.select(this).node().__data__;
			node.style("opacity", function (o) {
				return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
			});
			link.style("opacity", function (o) {
				return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
			});
			//Reduce the op
			toggle = 1;
		} else {
			//Put them back to opacity=1
			node.style("opacity", 1);
			link.style("opacity", 1);
			toggle = 0;
		}
	}
	
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

	
    var arc = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(0);

	//Clear past content
	d3.select("#graph-egonet").html("")
	
	function zoom() {
		container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

	var svgRoot = d3.select("#graph-egonet")
		.append("svg:svg")
		.attr("width", width)
        .attr("height", height)
		.attr("pointer-events", "all")
	 
    var svg = svgRoot.append("g")
		.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
		.on("dblclick.zoom", null)
	
	
	
	verticalLegend = d3.svg.legend().labelFormat("none").cellPadding(5).orientation("vertical").units("Topics").cellWidth(25).cellHeight(18).inputScale(color).cellStepping(10);
	d3.select("svg").append("g").attr("transform", "translate(15,25)").attr("class", "legend").call(verticalLegend);

	
	var rect = svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("fill", "none")
    .style("pointer-events", "all");
	
	
	var button = d3.select("#graph-egonet")
    .append("button")
    .text("Fullscreen")
    .attr("float", "left")
    .on("click", function(){
	
		svgRoot.style("position", "fixed")
		.style("top", 0)
		.style("bottom", 0)
		.style("left", 0)
		.style("right", 0)
		.style("width", "100%")
		.style("height", "100%")
		.style("background-color", "#ffffff")
		.style("z-index", "99");
		
	});
	
	var container = svg.append("g");
	
	
    var force = d3.layout.force()
        .charge(-1000)
		.gravity(0.1)
		.linkDistance( function(d) { return  10 * radius;  } )
		.linkStrength(function(d) { return  0.5 * d.homophily; })
        .size([width*3, height*3]);

	if(prerender){
		force.theta(0.8)
	}
	
    force.nodes(graph.nodes)
         .links(graph.links)
         .start();


    var link = container.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
		.style("stroke-width", function(d) { return  ((2*d.homophily)) +"px"; } )
		//.style("opacity", function(d) { return  d.homophily; } )


    var node = container.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
		.on("mouseover", function(d) {
			d3.select(this).classed({'isFocus': true})
			d3.select(this).select('.node-label').style("display", "initial" )
		})
		.on("mouseout", function() {
			d3.select(this).classed({'isFocus': false})
			d3.select(this).select('.node-label').style("display", function(d){ return  ((Number(d.degree)>40)? "initial":"none") })
		})
		.on('dblclick', connectedNodes);
		 
	node.append("text")
	  .attr("class", "node-label")
      .attr("dx", -50)
      .attr("dy", 30)
	  .style("display", function(d){ return  ((Number(d.degree)>40)? "initial":"none") })
	  .text(function(d){ return  d.name });
	  
	node.append("text")
	  .attr("class", "node-degree")
      .attr("dx", -20)
      .attr("dy", 50)
	  .text(function(d){ return  "Degree:"+Number(d.degree) });
	  
    node.selectAll("path")
        .data(function(d, i) {return pie(d.proportions); })
        .enter()
        .append("svg:path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return color(d.data.group); });;

    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

		
		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"});
		
		            
    });
	
	return force;
}