tipJSP(JavaScript Page) - JavaScript template engine.
======

#Features
-Complies with the Express view system
-Web browser and Node.js support
-error line number support
-Includes
-Custom seperator
-String modifier
-Custom user modifier support

#Quick example
Below is quick example how to use tipJSP.js:
```
var vdata = {
	name : "Peku",
	age : 20
};

var html = tipJSP.render("<ul><li><@=name@></li><li><@=age@></li></ul>", vdata);
// output "<ul><li>Peku</li><li>20</li></ul>"
```

#Installation
##Node.js
```
npm install tipjsp -save
```
##Web browser
```
<script src='tipJSP.js'></script>
```
#Rendering
##tipJSP.render(string, data)
-template
```
<script type='text/tipJSP' id='template'>
<ul>
<@ for(var i=0; i<arr.length; i++){ @>
	<li><@= arr[i] @></li>
<@ } @>
</ul>
</script>
```
-script
```
var vdata = {
	arr : ["peku1","peku2","peku3"]
};

var html = tipJSP.render(document.getElementById("template").innerHTML, vdata);
console.log(html);
```
-output
```
<ul>
	<li>peku1</li>
	<li>peku2</li>
	<li>peku3</li>
</ul>
```
##tipJSP.renderFile(path, data);
```
var vdata = {
	arr : ["peku1","peku2","peku3"]
};

var html = tipJSP.renderFile("./template.jsp", vdata);
console.log(html);
```

#Includes
-header.jsp
```
<h1>HEADER</h1>
```
-body.jsp
```
<html>
<body>
<@ include header.jsp @>
</body>
</html>
```
-output
```
<html>
<body>
<h1>HEADER</h1>
</body>
</html>
```
#Change seperator
-template
```
<ul>
<% for(var i=0; i<arr.length; i++){ %>
	<li><%= arr[i] %></li>
<% } %>
</ul>
```
-script
```
var vdata = {
	arr : ["peku1","peku2","peku3"]
};
var str = document.getElementById("template").innerHTML;
tipJSP.setSep('<%', '%>');
var html = tipJSP.render(str, vdata);
// or
var html = tipJSP.setSep('<%', '%>').render(str, vdata);
console.log(html);
```

#Express view system
```
app.engine( 'jsp', require('tipjsp') );
app.set('views', __dirname + '/views');
app.set('view engine', 'jsp');
// or
app.engine( 'jsp', require('tipjsp').setSep('<%', '%>') );
...
```

#Thanks
-Maeng,KiWan / hikaMaeng
