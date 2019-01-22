var tools = {
	/* 查找DOM对象
	 * @param selector string css基本选择器
	 * @param [parent] DOMobj 父级元素对象
	 * @return   DOMobj || HTMLCollection
	 */
	$: function(selector ,parent){
		parent = parent || document;
		switch(selector.charAt(0)){
			case "#":
				return document.getElementById(selector.slice(1));
			case ".":
				return parent.getElementsByClassName(selector.slice(1));
			default:
				return parent.getElementsByTagName(selector);
		}
	},
	
	/*获取外部样式
	 * @param obj  DOMobj 要获取属性的DOM对象 
	 * @param attr string 获取某一条属性的属性名
	 * @return  string  obj的attr属性值
	 */
	getStyle: function(obj, attr){
		if(obj.currentStyle){ //针对IE
			return obj.currentStyle[attr];
		}else{
			return getComputedStyle(obj,false)[attr];
		}
	},
	
	/* 获取body宽高
	 * 
	 * @return obj {width,height}
	 * */
	getBody: function(){
		return {
			width: document.documentElement.clientWidth || document.body.clientWidth,
			height: document.documentElement.clientHeight || document.body.clientHeight
		};
	},
	
	/*让元素在body里绝对居中
	 * @param obj  DOMobj 居中的那个元素对象
	 */
	
	showCenter: function(obj){
		
		//console.log(this);
		//this在不同执行环境指向的对象是不一样的，所以用一个变量在指向变化之前先存下来
		var _this = this;
		
		//obj相对于body定位
		document.body.appendChild(obj);
		obj.style.position = "absolute";
		
		function center(){
			//console.log(_this);
			var _left = (_this.getBody().width - obj.offsetWidth)/2,
				_top = (_this.getBody().height - obj.offsetHeight)/2;
			obj.style.left = _left + "px";
			obj.style.top = _top + "px";
		}
		
		center();
		window.onresize = center;
		
	},
	/* 获取和设置样式
	 * @param obj DOMobj 设置谁的样式
	 * @param oAttr string 获取属性值  @return string  oAttr对应的属性值
	 * @param oAttr obj  {left:"200px",top:"100px"} 设置css
	 * */
	css: function(obj,oAttr){
		if(typeof oAttr === "string"){
			return obj.style[oAttr];
		}else{
			for(var key in oAttr){
				obj.style[key] = oAttr[key]; 
			}
		}
		
	},
	
	/*添加事件监听
	 * @param obj DOMobj 添加事件的DOM元素
	 * @param type string 事件句柄
	 * @param fn Function 事件处理函数
	 * */
	on: function(obj, type, fn){
		//兼容判断
		if(window.attachEvent){
			obj.attachEvent("on"+type, fn);
		}else{
			obj.addEventListener(type, fn, false); //第三个参数指是否捕获，默认是false
		}
	},
	
	/*移除事件监听
	 * @param obj DOMobj 添加事件的DOM元素
	 * @param type string 事件句柄
	 * @param fn Function 事件处理函数
	 * */
	off: function(obj, type, fn){
		window.detachEvent ?
			obj.detachEvent("on"+type, fn) :
			obj.removeEventListener(type, fn, false);
	},
	
	/* 存取cookie
	 * @param key string cookie的名称
	 * @param [value] string cookie的值  如果不传，获取cookie
	 * @param [exp] object  {expires:3,path:"/"} 
	 * */
	cookie: function(key, value, exp){
		//判断value是否有效
		if(value === undefined){
			//获取
			var obj = new Object();
			var str = document.cookie;
			var arr = str.split("; ");
			for(var i = 0; i < arr.length; i++){
				var item = arr[i].split("=");
				obj[item[0]] = item[1];
			}
			//判断有没有取到
			
			//是否传了key(没传key取所有的key值)
			if(key){
				return obj[key] ? decodeURIComponent(obj[key]) : undefined;
			}else{return obj;
			}						
			
		}else{
			//拼接expires
			var str = "";
			if(exp){
				//如果传了过期时间
				if(exp.expires){
					//设置new Date到过期的那一天
					var d = new Date();
					d.setDate(d.getDate()+exp.expires);
					str += ";expires="+d;
				}
				//如果传了path
				if(exp.path){
					str += ";path="+exp.path;
				}
			}
			
			document.cookie = key+"="+encodeURIComponent(value)+str;
		}
	},


/*拖拽
*/
//如果传了title，那么就拖title，如果没有传，那就拖整个obj
		drag: function(obj, title){
			
			title  = title || obj;
			
			var maxLeft = tools.getBody().width - obj.offsetWidth;
			var maxTop = tools.getBody().height - obj.offsetHeight;
			
			title.onmousedown = function(e){
				e = e || window.event;
				var disX = e.offsetX,
					disY = e.offsetY;
				
				console.log(disX, disY);
				
				document.onmousemove = function(e){
					e = e || window.event;
					//计算坐标
					var _left = e.clientX - disX,
						_top = e.clientY  - disY;
					//判断范围
					if(_left < 0) _left = 0;
					if(_top < 0) _top = 0;
					if(_left > maxLeft) _left = maxLeft;
					if(_top > maxTop) _top = maxTop;
					//console.log(_left, _top);
					tools.css(obj, {
						left : _left + 'px',
						top : _top + "px"
					})
					
				}
				
				document.onmouseup = function(){
					document.onmousemove = null;
				}
				
				//阻止默认行为，避免圈选文字造成bug
				return false;
			}
		},
		//多属性匀速运动，兼容透明度
		
			/*
			move(obj, {
				left:300,
				width:200,
				opacity:0.5
			}, 2000);
			*/
			move: function (obj, endObj, time, fn){
				//预定义速度
				var timeObj = {
					"slow": 2000,
					"normal": 1200,
					"fast": 700
				};
				if(typeof time === "string"){
					time = timeObj[time];
					if(typeof time === "undefined") time = timeObj.normal;
				}
				
				var startObj = {};
				var disObj = {};
				var speedObj = {};
				var steps = parseInt(time/30); //步数一样的
			
				for(var key in endObj){
					//通过遍历计算开始结束和距离，速度（都是对象）
					endObj[key] = key === "opacity" ? 
						endObj[key].toFixed(2)*100 : 
						parseInt(endObj[key]);
			
					startObj[key] = key === "opacity" ?
						Number(tools.getStyle(obj, key)).toFixed(2)*100 :
						parseInt(tools.getStyle(obj, key));
			
					disObj[key] = endObj[key] - startObj[key];
			
					speedObj[key] = disObj[key] / steps;
				}
			
				//开始运动
				clearInterval(obj.timer);
				obj.timer = setInterval(function(){
					for(var key in startObj){
						startObj[key] += speedObj[key];
			
						obj.style[key] = key === "opacity" ? 
							startObj[key]/100 : 
							startObj[key]+"px";
			
					}
					//判断终点
					if(Math.abs(endObj[key] - startObj[key]) < Math.abs(speedObj[key])){
						clearInterval(obj.timer);
						
						
						//每一个属性都要拉到终点
						for(var key1 in startObj){
							obj.style[key1] = key1 === "opacity" ?
								endObj[key1]/100:
								endObj[key1]+"px";
						}
						//逻辑短路，传了才调
						fn && fn();
					}
				},30);
			
			
			
			},
			
			//多属性缓冲运动，兼容透明度
			smove :function (obj, endObj, fn){
				var startObj = {};
				var speedObj = {};
				var disObj = {};
				var speedObj = {};
			
				for(let key in endObj){
					endObj[key] = key === "opacity" ? endObj[key].toFixed(2)*100 : parseInt(endObj[key]);
			
					startObj[key] = key === "opacity" ? 
						Number(tools.getStyle(obj, key)).toFixed(2)*100 :
						parseInt(tools.getStyle(obj, key));
				}
				//1				
				//开始运动
				clearInterval(obj.timer);
				obj.timer = setInterval(function(){
					//每次定时器标志位都要回复默认值，重新做判断
					//true代表默认结束
					var flag = true;
					for(var key in endObj){
						disObj[key] = endObj[key] - startObj[key];
						speedObj[key] = disObj[key] > 0 ? Math.ceil(disObj[key]/10) : Math.floor(disObj[key]/10);
			
						startObj[key] += speedObj[key];
			
						obj.style[key] = key === "opacity" ? startObj[key]/100 : startObj[key]+"px";
			
						//只要有任意一个属性没有到达终点，flag都为false
						if(startObj[key] != endObj[key]) flag = false;
						
					}
					//判断终点
					if (flag) {
						clearInterval(obj.timer);
						fn && fn();
					}
			
				},30);
			
			},
			/*
			* 计算obj到浏览器边缘的距离
			* @param obj DOMObj 要计算的元素对象
			* @return object  {left,top},返回值为一个对象 取值 obj.left/top
			*/
			getPosition: function(obj){
				var left = 0, top = 0;
				//只要obj的offsetParent不等于null，那么就要继续计算
				while(obj.offsetParent){
					left += obj.offsetLeft;
					top += obj.offsetTop;
					//把offsetParent作为obj继续算下一段
					obj = obj.offsetParent;
				}
				return {left,top};
			},
			createDiv: function(className){
			var div = document.createElement("div");
			div.className = className;
			document.body.appendChild(div);
			return div;
	
		}
			
		}
	