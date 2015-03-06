
var curr_volume;

drawEgoNet(0);

 document.getElementById('egonet-selector').addEventListener('change', function() {
    userIndex = this.value;
	console.log("Looking at User Index ", userIndex);
	
	drawEgoNet(userIndex);
  });
  
  
  function drawEgoNet(index){
    graph = data_egonet[index];
	
	
    var width = 640,
    height = 500,
    radius = 30,
    color = d3.scale.category10();

	console.log(color);
	
	root = graph.nodes[0];
	root.fixed = true;
	root.x = width / 2;
	root.y = height/2;

	
	
    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

	
    var arc = d3.svg.arc()
        .outerRadius(radius)
        .innerRadius(0);

	//Clear past content
	d3.select("#graph-egonet").html("")
	
	
    var svg = d3.select("#graph-egonet").append("svg")
        .attr("width", width)
        .attr("height", height);

	
    var force = d3.layout.force()
        .charge(-400)
        .linkDistance(5 * radius)
        .size([width, height]);

    force.nodes(graph.nodes)
         .links(graph.links)
         .start();

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node");

	node.append("text")
	  .attr("class", "node-label")
      .attr("dx", 0)
      .attr("dy", 50)
      .text(function(d) { console.log(d.name); return d.name });
	  
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

		
		node.attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); })
		
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"});
    });
	}
	
	//drawEgoNet(0);