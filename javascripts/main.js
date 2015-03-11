
var curr_volume;

drawEgoNet( data_egonet );

/*
 document.getElementById('egonet-selector').addEventListener('change', function() {
    userIndex = this.value;
	console.log("Looking at User Index ", userIndex);
	
	drawEgoNet( data_egonet[userIndex]);
  });
  */
  


	
function drawEgoNet(graph){
    
	
    var width = 640,
    height = 500,
    radius = 20,
    color = d3.scale.category10();
	
	root = graph.nodes[0];
	root.fixed = true;
	root.x = width / 2;
	root.y = height/2;

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

    var svg = d3.select("#graph-egonet").append("svg:svg")
        .attr("width", width)
        .attr("height", height)
		.attr("pointer-events", "all")
		.append("g")
		.call(d3.behavior.zoom().scaleExtent([1, 8]).on("zoom", zoom))
		.on("dblclick.zoom", null)

	var rect = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");
	
	var container = svg.append("g");
	
    var force = d3.layout.force()
        .charge(-400)
        .linkDistance(8 * radius)
        .size([width, height]);

    force.nodes(graph.nodes)
         .links(graph.links)
         .start();


		 
    var link = container.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");

    var node = container.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
		.on('dblclick', connectedNodes);
		 
	node.append("text")
	  .attr("class", "node-label")
      .attr("dx", -15)
      .attr("dy", 30)
      .text(function(d) { return d.name });
	  
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
		
		//.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        //.attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); })
		
            
    });

	console.log(data_egonet);
}
	
	//drawEgoNet(0);
	