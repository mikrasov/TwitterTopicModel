var fullscreen;

function drawEgoNet(graph, prerender){
	
    var width = 640,
    height = 500,
    radius = 20,
    color = d3.scale.category10().domain([
		"Social: twitter social media via use site googl new blog free",
		"News: new post news use world -- say titl music video",
		"Positive: like get go think it one know good time see",
		"Feel-good: thank love quot follow life via day great lol good",
		"Violent: lol new fuck love true rob thank blood pic oh",
		"Politics: tcot iranelect obama health iran care polit via p2 thank",
		"Home: love mom lol thank get kid new blog post follow",
		"Expletive: lol get like got go shit lmao know love good",
		"Business: market get busi job free money make home new time",
		"Travel: thank travel win new great follow food via free love"
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
	
	fullscreen = function(){
	
		svgRoot.style("position", "fixed")
		.style("top", 0)
		.style("bottom", 0)
		.style("left", 0)
		.style("right", 0)
		.style("width", "100%")
		.style("height", "100%")
		.style("background-color", "#ffffff")
		.style("z-index", "99");
		
	}
	
	var button = d3.select("#graph-egonet")
    .append("button")
    .text("Fullscreen")
    .attr("float", "left")
    .on("click", fullscreen);
	
	var container = svg.append("g");
	
	
    var force = d3.layout.force()
        .charge(-10000)
		.gravity(0.7)
		.linkDistance( function(d) { return  20 * radius;  } )
		.linkStrength(function(d) { return  0.8 * d.homophily; })
		
        .size([width*3, height*3]);


	
    force.nodes(graph.nodes)
         .links(graph.links)
         .start();


    var linkG = container.selectAll(".link")
        .data(graph.links)
        .enter().append("g")
		
	var link= linkG.append("line")
        .attr("class", "link")
		.style("stroke-width", function(d) { return  ((2*d.homophily)+0.5) +"px"; } )
		//.style("opacity", function(d) { return  d.homophily; } )
	
	 var edgelabels = linkG
        .append('text')
		.attr("class", "edgelabel")
		.text(function(d){ return  Math.round(Number(d.homophily) * 100) / 100 });
        

    var node = container.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
		.on("mouseover", function(d) {
			d3.select(this).classed({'isFocus': true});
			d3.select(this).select('.node-label').style("display", "initial" );
			d = d3.select(this).node().__data__;
			linkG.select(".edgelabel").style("display", function (o) {
				return d.index==o.source.index | d.index==o.target.index ? "initial" : "none";
			});
			link.style("stroke", function (o) {
				return d.index==o.source.index | d.index==o.target.index ? "#F00" : "#999";
			});
		})
		.on("mouseout", function() {
			d3.select(this).classed({'isFocus': false})
			d3.select(this).select('.node-label').style("display", function(d){ return  ((Number(d.degree)>50)? "initial":"none") })
			link.style("stroke", "#999");
			linkG.select(".edgelabel").style("display","none");
		})
		.on('dblclick', connectedNodes);
		 
	
	  
    node.selectAll("path")
        .data(function(d, i) {return pie(d.proportions); })
        .enter()
        .append("svg:path")
        .attr("d", arc)
        .attr("fill", function(d, i) { return color(d.data.group); });;

	node.append("text")
	  .attr("class", "node-label")
      .attr("dx", -50)
      .attr("dy", 30)
	  .style("display", function(d){ return  ((Number(d.degree)>50)? "initial":"none") })
	  .text(function(d){ return  d.name });
	  
	node.append("text")
	  .attr("class", "node-degree")
      .attr("dx", -20)
      .attr("dy", 50)
	  .text(function(d){ return  "Degree:"+Number(d.degree) });
	  
    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

		edgelabels.attr("x", function(d) { 
			return (d.target.x + d.source.x)/2;
			})
        .attr("y", function(d) { return (d.target.y + d.source.y)/2; }); 
		
		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"});
		
		 
    });
	
	
	
	return force;
}