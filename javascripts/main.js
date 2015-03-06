
var curr_volume;

drawEgoNet(0);

 document.getElementById('egonet-selector').addEventListener('change', function() {

    curr_volume = this.value;

    console.log("curr_volume ", curr_volume);
	drawEgoNet(0);
      // now do something with curr_volume
  });
  
  
  function drawEgoNet(index){
    var width = 640,
    height = 500,
    radius = 25,
    color = d3.scale.category10();

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
        .charge(-120)
        .linkDistance(4 * radius)
        .size([width, height]);

    force.nodes(data_egonet.nodes)
         .links(data_egonet.links)
         .start();

    var link = svg.selectAll(".link")
        .data(data_egonet.links)
        .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(data_egonet.nodes)
        .enter().append("g")
        .attr("class", "node");

	node.append("text")
	  .attr("class", "node-label")
      .attr("dx", 10)
      .attr("dy", 40)
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

        node.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"});
    });
	}
	
	//drawEgoNet(0);