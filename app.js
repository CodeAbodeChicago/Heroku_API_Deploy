/*
	API building time - see api-documentation.pdf.
	
	We are going to build a simple API backend using Express.  This is the type
	of thing that sits on Echonest's and the Internet Movie Database's servers.

	Build a /super endpoint that is a super[hero/villain] name generator.  You 
	will need two npm packages that can generate random names:
		- https://www.npmjs.com/package/supervillains
		- https://www.npmjs.com/package/superheroes

	Bonus: 
		Build an /ascii endpoint that is a figlet renderer.
*/

var superheroes = require("superheroes");
var supervillains = require("supervillains");
var figlet = require("figlet");

var figletFonts = figlet.fontsSync();

var express = require("express");
var app = express();

app.get("/super", function(req, res) {
	var qs = req.query; // Shorthand, since we'll be using this variable often

	// Results to send back
	var results = {
		status: {
			version: 1.0,
			message: "Success"
		},
		num: 0,
		type: "",
		list: []
	};

	// Validate the more important parameter (super name type) first
	if (qs.type !== "hero" && qs.type !== "villain") {
		results.status.message = "Bad request";
		res.status(400).send(results);
		return;
	}
	// We've passed super name type validation, continue building response
	results.type = qs.type;

	// Validate num parameter second
	qs.num = Math.round(Number(qs.num)); // Convert from string to integer
	if (isNaN(qs.num) || qs.num < 1) qs.num = 1;
	else if (qs.num > 20) qs.num = 20;
	// We've passed num, continue building response
	results.num = qs.num;

	// Generate random names for the results
	for (var i = 0; i < qs.num; i += 1) {
		if (qs.type === "hero") var name = superheroes.random();
		else var name = supervillains.random();
		results.list.push(name);
	}

	// Send the results
	res.send(results);
}); 


app.get("/ascii", function(req, res) {
	var qs = req.query; // Shorthand, since we'll be using this variable often

	res.set("content-type", "text/plain; charset=utf-8");

	// Validate the more important parameter (text) first
	if (qs.text === undefined) {
		res.status(400);
		figlet.text("Error!", "Big Money-ne", function (err, data) {
			if (err) throw err;
			res.send(data);
		});
		return;
	}
	// We've passed text validation

	// Validate font parameter second
	if (qs.font === undefined) qs.font = "graffiti";
	qs.font = qs.font.toLowerCase();
	var foundFont = false;
	for (var i = 0; i < figletFonts.length; i++) {
		if (qs.font === figletFonts[i].toLowerCase()) {
			foundFont = true;
			qs.font = figletFonts[i];
			break;
		}
	}
	if (!foundFont) {
		res.status(400);
		figlet.text("Font not found.", "Big Money-ne", function (err, data) {
			if (err) throw err;
			res.send(data);
		});
		return;		
	}
	// We've passed font validation
	
	figlet.text(qs.text, qs.font, function (err, data) {
		if (err) throw err;
		res.send(data);
	});
}); 

// 404 - catching anything not handled above
app.all("*", function(req, res) {
	res.status(404).send("404. Nothing here, keep moving.");
});


var envPort = process.env.PORT;
if (envPort !== undefined) app.listen(envPort);
else app.listen(8080);

// Alternative, shorter way to do things:
// var port = process.env.PORT || 8080;
// app.listen(port);
