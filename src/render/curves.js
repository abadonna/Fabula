import Bezier from 'bezier-js'

//--------------------------------------------------------------------------------------//

export let linear = function(start, end) {
	let k = (end.y - start.y)/(end.x - start.x),
		tg = -k,
		a = (end.x > start.x) ? -(Math.atan(tg) * 180)/Math.PI : 180 - (Math.atan(tg) * 180)/Math.PI ,
		transform = 'translate(' + Math.max(0, end.x) + ',' + Math.max(0, end.y) + ') rotate(' + a + ')',
		path = <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}></line>

	return {path:path, transform:transform, x: "50%", y: "50%"}
}

//--------------------------------------------------------------------------------------//

export let best = function(start, end) {
	let k = (end.y - start.y)/(end.x - start.x),
		tg = -k,
		a = (Math.atan(tg) * 180)/Math.PI,
		isCubic = (Math.abs(a) > 20) && (Math.abs(a) < 70)
	
	if (isCubic) {
		if (((start.p == "E") && (end.p == "W")) ||
			((start.p == "W") && (end.p == "E")) ||
			((start.p == "S") && (end.p == "N"))||
			((start.p == "N") && (end.p == "S")))
		return cubic(start, end)
	}
	
	return quadric(start, end)
}

//--------------------------------------------------------------------------------------//

export let quadric = function(start, end) {
	let v = {
		x: end.x - start.x, 
		y: end.y - start.y
	}
	
	let flip = ((start.p == "N") && (end.p == "N") && (end.x < start.x)) ||
	((start.p == "S") && (end.p == "S") && (end.x > start.x)) ||
	((start.p == "S") && (end.p == "N") && (end.x < start.x)) ||
	((start.p == "E") && (end.p == "E") && (end.y > start.y)) ||
	((start.p == "E") && (end.p == "N") && (end.y < start.y)) ||
	((start.p == "E") && (end.p == "S") && (end.x > start.x)) ||
	((start.p == "S") && (end.p == "E") && (end.y < start.y)) ||
	((start.p == "W") && (end.p == "W") && (end.y < start.y)) ||
	((start.p == "N") && (end.p == "W") && (end.y > start.y)) ||
	((start.p == "N") && (end.p == "S") && (end.x > start.x)) ||
	((start.p == "W") && (end.p == "N") && (end.y > start.y)) ||
	((start.p == "S") && (end.p == "W") && (end.x > start.x)) ||
	((start.p == "W") && (end.p == "S") && (end.y > start.y)) ||
	((start.p == "W") && (end.p == "E") && (end.y < start.y)) ||
	((start.p == "E") && (end.p == "W") && (end.y > start.y))


	let n = flip ? {x: -v.y, y: v.x} : {x: v.y, y: -v.x},
		l = Math.sqrt(n.x*n.x + n.y*n.y),
		d = Math.min(75, Math.sqrt(v.x*v.x + v.y*v.y) / 4)

	n = {x: n.x/l, y: n.y/l}
	let point = {
		x: (start.x + end.x)/2 + d * n.x, 
		y: (start.y + end.y)/2 + d * n.y
	}

	let path =  "M" + start.x + " " + start.y + 
				" Q " + point.x + " " + point.y + 
				" " + end.x + " " + end.y,
		curve = Bezier.SVGtoBeziers(path).curve(0),
		s = curve.get(0.9),
		center = curve.get(0.5)

	let k = (end.y - s.y)/(end.x - s.x),
		tg = -k,
		a = (end.x > s.x) ? -(Math.atan(tg) * 180)/Math.PI : 180 - (Math.atan(tg) * 180)/Math.PI ,
		transform = 'translate(' + Math.max(0, end.x) + ',' + Math.max(0, end.y) + ') rotate(' + a + ')'

	return {path:<path d={path} fill="transparent"/>, transform:transform, x: center.x, y: center.y}
}

//--------------------------------------------------------------------------------------//

export let cubic = function(start, end) {
	let v = {
		x: end.x - start.x, 
		y: end.y - start.y
	}
	
	let flip = ((start.p == "N") && (end.p == "S") && (end.x < start.x)) ||
		((start.p == "W") && (end.p == "E") && (end.y > start.y)) ||
		((start.p == "S") && (end.p == "N") && (end.x > start.x)) ||
		((start.p == "E") && (end.p == "W") && (end.y < start.y))

	let n = flip ? {x: -v.y, y: v.x} : {x: v.y, y: -v.x},
		l = Math.sqrt(n.x*n.x + n.y*n.y),
		d = Math.min(75, Math.sqrt(v.x*v.x + v.y*v.y) / 4)

	n = {x: n.x/l, y: n.y/l}

	let temp = Bezier.SVGtoBeziers("M" + start.x + " " + start.y + 
	" Q " + (start.x + end.x)*0.5 + " " + (start.y + end.y)*0.5 + 
	" " + end.x + " " + end.y).curve(0)

	/*
	let flip = 1
	if (
		((end.x > start.x) && (end.y < start.y)) 
		|| ((end.x < start.x) && (end.y > start.y))
	)
		flip = -1
	
	let pointA = temp.get(0.25)
	pointA.x += flip * d * n.x
	pointA.y += flip * d * n.y

	let pointB = temp.get(0.75)
	pointB.x -= flip * d * n.x
	pointB.y -= flip * d * n.y
	*/

	let pointA = temp.get(0.25)
	pointA.x += d * n.x
	pointA.y += d * n.y

	let pointB = temp.get(0.75)
	pointB.x -= d * n.x
	pointB.y -= d * n.y

	let path =  "M" + start.x + " " + start.y + 
				" C " + pointA.x + " " + pointA.y + 
				" " + pointB.x + " " + pointB.y + 
				" " + end.x + " " + end.y,
		curve = Bezier.SVGtoBeziers(path).curve(0),
		s = curve.get(0.9),
		center = curve.get(0.5)

	let k = (end.y - s.y)/(end.x - s.x),
		tg = -k,
		a = (end.x > s.x) ? -(Math.atan(tg) * 180)/Math.PI : 180 - (Math.atan(tg) * 180)/Math.PI ,
		transform = 'translate(' + Math.max(0, end.x) + ',' + Math.max(0, end.y) + ') rotate(' + a + ')'
	
	return {path:<path d={path} fill="transparent"/>, transform:transform, x: center.x, y: center.y}
}