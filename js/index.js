window.onload=function(){
	/*var a=new Engine();   //这样写下面就可以不用写thi.init()
	a.init()*/
	new Engine();
}
	function Engine(){
		this.init();
	};
	Engine.prototype.init=function(){
		this.ele=tools.$("#body_main");//因为我们的游戏都是在div里面进行的 所以名个属性
		var _this=this;
		var ul=tools.$("#options");
		ul.onclick=function(e){
			e=e||window.event;
			var target=e.target||e.srcElement;
			if(target.nodeName==="LI"){
				//获取难度系数
				_this.hd=target.getAttribute("data-value");
				//console.log(_this.hd);
				//移除ul
				_this.ele.removeChild(ul) ;   //这里的this指的window				
				//开始入场动画
				_this.startAnimation();
			}						
		}
	};
	
	Engine.prototype.startAnimation=function(){
		var log=tools.createDiv("logo");
		var loading=tools.createDiv("loading");
		var _this=this;
		var n=1;
		var y=0;
		var count=0;
		var main=tools.$("#body_main");
		var timer=setInterval(function(){
			//var一个计数器 当开始动画执行到一定时候清楚logo和飞机开始游戏(简便写法直接用n当技术器)
			count++;
			if(count>5){
				clearInterval(timer);
				document.body.removeChild(log);
				document.body.removeChild(loading);
				_this.startGame();
				
			}
			//入场小飞机动画 通过三张背景图实现动画效果
			n+=1;
			if(n>3)n=1;
			loading.style.backgroundImage="url(img/loading"+n+".png)";			
		},500)		
		//背景图运动
		setInterval(function(){
			y+=10;
			main.style.backgroundPositionY=y+"px";
		},30)
		
	};
	Engine.prototype.startGame=function(){
		var _this=this;
		plane.init();
		plane.fire(_this.hd);
		//按照如下比例每隔一秒产生一架敌机 
		/*难度1：30%小飞机  30%中飞机  20%大飞机  20%不生产飞机 
		难度2：40%小飞机  30%中飞机  15%大飞机  15%不生产飞机
		。。。。。。
		* */
		setInterval(function(){
			var rand=Math.random();//0~1
			if(_this.hd=1){
				if(rand<0.3){
				new Enemy().init(1);
			}else if(rand<0.6){
				new Enemy().init(2);
			}else if(rand<0.8){
				new Enemy().init(3);
			}
			};
			if(_this.hd=2){
				if(rand<0.4){
				new Enemy().init(1);
			}else if(rand<0.7){
				new Enemy().init(2);
			}else if(rand<0.85){
				new Enemy().init(3);
			}
			};
			if(_this.hd=3){
				if(rand<0.5){
				new Enemy().init(1);
			}else if(rand<0.7){
				new Enemy().init(2);
			}else if(rand<0.75){
				new Enemy().init(3);
			}
			};
			if(_this.hd=4){
				if(rand<0.6){
				new Enemy().init(1);
			}else if(rand<0.7){
				new Enemy().init(2);
			}else if(rand<0.75){
				new Enemy().init(3);
			}
			}
			
			
		},2000)
	};
	
	var plane={
		aBullet:[],
		init:function(){
			this.myPlane=tools.createDiv("my-warplain");
			let main=tools.$("#body_main");
			//console.log(this.myPlane.offsetWidth);
			//写在css里面的设置都要加style
			this.myPlane.style.left=main.offsetLeft+main.offsetWidth/2-this.myPlane.offsetWidth/2+"px";
			this.myPlane.style.top=main.offsetHeight-this.myPlane.offsetHeight+"px";
			this.move();
			
		},
		move:function(){
			let _this=this;
			//取得body直接document.body
			document.body.onmousemove=function(e){//让飞机跟随鼠标移动
				e=e||window.event;
				let main=tools.$("#body_main"); 
				let left=e.clientX-_this.myPlane.offsetWidth/2,
					top=e.clientY-_this.myPlane.offsetHeight/2;
					//console.log(main.offsetLeft+_this.myPlane.offsetWidth/2);
				if(left<main.offsetLeft) left=main.offsetLeft;
				if(left>main.offsetWidth+main.offsetLeft-_this.myPlane.offsetWidth)
				left=main.offsetWidth+main.offsetLeft-_this.myPlane.offsetWidth;
				if(top>main.offsetHeight-_this.myPlane.offsetHeight)
				top=main.offsetHeight-_this.myPlane.offsetHeight;
				_this.myPlane.style.left=left+"px";
				_this.myPlane.style.top=top+"px";
			}
			
		},
		fire:function(hard){
			var _this=this;
			var hd=parseInt(200/hard+90);
			setInterval(function(){//每隔多少时间创建一个子弹 根据难度来 new一个子弹的实例
			//this.bullet=tools.createDiv("bullet"); 应该直接创建实例
				//new Bullet().init(); 首先初始化的时候建造
				_this.aBullet.push(new Bullet().init());//接着要将页面中的子弹push进单个子弹数组里面 为下面的子弹碰撞创建对象
				//console.log(_this.aBullet);
			},hd)
		}
		
	}
	
	function Bullet(){};
	Bullet.prototype.init=function(){//子弹初始化（创建子弹，设定子弹的初始位置）
		this.ele=tools.createDiv("bullet");
		this.ele.style.left=
		plane.myPlane.offsetLeft+plane.myPlane.offsetWidth/2-this.ele.offsetWidth/2+"px";
		this.ele.style.top=plane.myPlane.offsetTop-this.ele.offsetHeight+"px";
		this.move();
		//方便在plane的fire方法里push
		return this;
	}
	Bullet.prototype.move=function(){
		let _this=this;
		this.timer=setInterval(function(){
			_this.ele.style.top=_this.ele.offsetTop-10+"px";//因为子弹要跟着飞机移动 所有top等于子弹的实时top减去向上移动的高度
			if(_this.ele.offsetTop<-40){//因为一直在不停创建子弹，所以我们要让子弹超出屏幕边界时移除，提高性能
				_this.die();
			}
		
		},30)
	}
	Bullet.prototype.die=function(){
		//alert(12) 能弹出来说明调用成功
		var _this=this;
		plane.aBullet.forEach(function(bullet,index){
			if(_this===bullet){
				plane.aBullet.splice(index,1);				
			}			
		})
		
		clearInterval(this.timer);
		this.ele.className="bullet_die";
		setTimeout(
			function(){
				_this.ele.className="bullet_die2";
				setTimeout(function(){
					document.body.removeChild(_this.ele);
				},100)
			},100)
		
	}

	function Enemy(){};
	Enemy.prototype.init=function(type){
		let main=tools.$("#body_main");
		this.type=type;
		switch(this.type){
			case 1:
				this.ele=tools.createDiv("enemy-small");
				this.speed=5;
				this.hp=1;
			break;
			case 2:
				this.ele=tools.createDiv("enemy-middle");
				this.speed=3;
				this.hp=5;
			break;
			case 3:
				this.ele=tools.createDiv("enemy-large");
				this.speed=1;
				this.hp=10;
			break;
			
		}
		//初始位置在顶部， 水平位置随机出现
		this.ele.style.top=0+"px";
		this.ele.style.left=Math.random()*(main.offsetWidth-this.ele.offsetWidth)+main.offsetLeft+"px";
		
		this.move();
		
	}
	Enemy.prototype.move=function(){
		var _this=this;
		let main=tools.$("#body_main");
		
		this.timer=setInterval(function(){
			//敌机根据机型有不同的速度（speed） 没隔一段时间敌机top+speed降落
			_this.ele.style.top=_this.ele.offsetTop+_this.speed+"px";
			if(_this.ele.offsetTop>main.offsetHeight+20){
				_this.die();
				if(confirm("游戏结束")){
					location.reload();
				}else{
					location.reload();
				}
			}
			var left=_this.ele.offsetLeft,
			right=_this.ele.offsetLeft+_this.ele.offsetWidth,
			top=_this.ele.offsetTop,
			bottom=_this.ele.offsetTop+_this.ele.offsetHeight;
			
			plane.aBullet.forEach(function(bullet,index){//bullet 是每一个子弹的实例
			let bleft=bullet.ele.offsetLeft,
				bright=bullet.ele.offsetLeft+bullet.ele.offsetWidth,
				btop=bullet.ele.offsetTop,
				bbottom=bullet.ele.offsetTop+bullet.ele.offsetHeight;
				//console.log(bleft,bright,btop);
			if(!(bleft>right||bright<left||btop>bottom||bbottom<top)){
				//alert(2);
				bullet.die();//子弹销毁				
				--_this.hp; //承受子弹的额数量到达顶峰 敌机销毁
				if(_this.hp<=0){
					_this.die();
				}
			}
			var wleft=plane.myPlane.offsetLeft,
				wright=wleft+plane.myPlane.offsetWidth,
				wtop=plane.myPlane.offsetTop,
				wbottom=wtop+plane.myPlane.offsetHeight;
			if(!(wleft>right-10||wright<left-10||wtop>bottom-10||wbottom<top-10)){
				document.body.removeChild(plane.myPlane);
				if(confirm("游戏结束")){
					location.reload();
				}
			}			
			
			})
		},30)
		//遍历每一发子弹 根据子弹的位置和敌机的位置判断是否发生碰撞
		/*var left=this.ele.offsetLeft, //敌机的位置获取应该放在定时器里面实时获取
			right=this.ele.offsetLeft+this.ele.offsetWidth,
			top=this.ele.offsetTop,
			bottom=this.ele.offsetTop+this.ele.offsetHeight;
			console.log(left,right,top,bottom);*/
		}
	
	Enemy.prototype.die=function(){
		clearInterval(this.timer);		
		document.body.removeChild(this.ele);
		
	}
