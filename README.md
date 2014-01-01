tipJSP(JavaScript Page) - JavaScript template engine.
======

#Features
- Complies with the Express3 framework view system
- Web browser(IE 7+, Chrome, Firefox, Safari, etc...) and Node.js support
- error line number support
- Includes
- Simple loop syntax
- Simple condition syntax
- Custom seperator
- String modifier
- Custom user modifier support

#Quick example
Below is quick example how to use tipJSP.js:
```
var vdata = {
	name : "peku",
	age : 20
};

var html = tipJSP.render("<ul><li><@=name@></li><li><@=age@></li></ul>", vdata);
// output "<ul><li>peku</li><li>20</li></ul>"
```

#Installation
###Node.js
```
npm install tipjsp -save
```
###Web browser
```
<script src='tipJSP.js'></script>
```

#Express3 framework view system
```
app.engine( 'jsp', require('tipjsp') );
app.set('views', __dirname + '/views');
app.set('view engine', 'jsp');
// or
app.engine( 'jsp', require('tipjsp').setSep('<%', '%>') );
...
```

#Rendering
###tipJSP.render(string, data)
#####template  

```
<script type='text/tipJSP' id='template'>
<ul>
<@ for(var i=0; i<arr.length; i++){ @>
	<li><@= arr[i] @></li>
<@ } @>
</ul>
</script>
```
#####script  

```
var vdata = {
	arr : ["peku1","peku2","peku3"]
};

var html = tipJSP.render(document.getElementById("template").innerHTML, vdata);
console.log(html);
```
#####output  

```
<ul>
	<li>peku1</li>
	<li>peku2</li>
	<li>peku3</li>
</ul>
```
###tipJSP.renderFile(path, data);
```
var vdata = {
	arr : ["peku1","peku2","peku3"]
};

var html = tipJSP.renderFile("./template.jsp", vdata);
console.log(html);
```

#Simple loop syntax
## Array
#####template  

```
<ul>
<@# i in arr @>
	<li><@= arr[i] @></li>
<@ } @>
</ul>
```
#####script  

```
var vdata = {
	arr : ["peku1","peku2","peku3"]
};

var html = tipJSP.render(templateStr, vdata);
```
#####output  

```
<ul>
	<li>peku1</li>
	<li>peku2</li>
	<li>peku3</li>
</ul>
```

## Object
#####template  

```
<ul>
<@# k in obj @>
	<li><@= obj[k] @></li>
<@ } @>
</ul>
```
#####script  

```
var vdata = {
	obj : {a:"peku1",b:"peku2",c:"peku3"}
};

var html = tipJSP.render(templateStr, vdata);
```
#####output  

```
<ul>
	<li>peku1</li>
	<li>peku2</li>
	<li>peku3</li>
</ul>
```

#Simple condition syntax
#####template  

```
<@# input @> or <@# input == true @>
	<h1><@=value1@></h1>
<@ } @>
<@# !input @> or <@# input == false @>
	<h1><@=value2@></h1>
<@ } @>
```
#####script  

```
var vdata = {
	input : true,
	value1 : 'true',
	value2 : 'false'
};

var html = tipJSP.render(templateStr, vdata);
```
#####output  

```
<h1>true</h1>
```

#Includes
#####header.jsp  

```
<h1>HEADER</h1>
```
#####body.jsp  

```
<html>
<body>
<@ include header.jsp @>
</body>
</html>
```
#####output  

```
<html>
<body>
<h1>HEADER</h1>
</body>
</html>
```

#String modifier
###cr2(to)
```
// input = 'peku1\r\npeku2\rpeku3';
<@= input|cr2,'\n' @>
// output = 'peku1\npeku2\npeku3';
```
###cr2br()
```
// input = 'peku1\r\npeku2\npeku3';
<@= input|cr2br @>
// output = 'peku1<br />peku2<br />peku3';
```
###cutStrb(length[, reststr])
```
// input = '가나다abc';
<@= input|cutStrb,2 @>
// output = '가나...';
<@= input|cutStrb,5,'..' @>
// output = '가나다ab..';
```
###escapeHtml()
```
// input = '<h1>abc</h1>&\'"';
<@= input|escapeHtml @>
// output = '&lt;h1&gt;abc&lt;/h1&gt;&amp;&apos;&quot;';
```
###escapeBackslash()
```
// input = 'a\\b\\c';
<@= input|escapeBackslash @>
// output = 'a\\\\b\\\\c';
```
###numcomma([unit])
```
// input = 1234567;
<@= input|numcomma @>
// output = '1,234,567';
<@= input|numcomma,'원' @>
// output = '1,234,567원';
```
###stripTag()
```
// input = '<h1>abc</h1>&\'"';
<@= input|stripTag @>
// output = 'abc&\'"';
```
###trim()
```
// input = '  abc d ef  ';
<@= input|trim @>
// output = 'abc d ef';
```

#Change seperator
#####template  

```
<ul>
<% for(var i=0; i<arr.length; i++){ %>
	<li><%= arr[i] %></li>
<% } %>
</ul>
```
#####script  

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

#Thanks
- Maeng,KiWan / hikaMaeng
