// 익명함수 처리 + 초기화 호출 + object 형식 객체 선언
(function(){
    
    PARTICLE_COUNT  = 40;
    MIN_DISTANCE    = 80;
    OW =640;
    OH =480;
    
    /**
    ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        color convert method
    ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
    */   
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    function hexToRgb(hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function getRandomColor(){
        return rgbToHex(parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255));
    }


    function getDistance( sx, sy, tx, ty ){
        var dx = tx - sx;
        var dy = ty - sy;
        return Math.sqrt( dx*dx + dy*dy);
    }
   
    function getMinMax( min, max ){
        var value = Math.floor( Math.random()*(max - min) + 1 ) + min;
        return value;
    }
      

    /**
    ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
       생성자 
    ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
    */         
    var ParticleNode =function( objScreen ){
        this.iScreen     =objScreen;
        this.init();
    }
    
    /**
    ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
       prototype
    ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
    */        
    ParticleNode.prototype ={
        repeatID:null,
        generatorID:null,
        iScreen:null,
        context:null,
        particles:null,
        
        init : function(){
            this.context     =this.iScreen.getContext("2d");
            this.particles   =[];
            // 시작 값 저장
            
            this.mx;
            this.my; // mouse position;
            this.groupColor = getRandomColor();
            window.addEventListener( "resize", this.onResize );
            this.onResize();
        },
        /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            resize처리 
                - canvas의 현재 상태를 temp에 저장
                - resize처리 ( 스케일 비율 유지 )
                - temp를 이용한 상태 복원
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        onResize:function(){
            
            if( this.context ){
                var temp =this.context.getImageData( 0, 0, this.iScreen.width, this.iScreen.height );
                // browser viewport size
                var w = window.innerWidth;
                var h = window.innerHeight; 
                // scale 구하기 
                var scale = Math.min(w/OW, h/OH);
                this.iScreen.width = w;//OW * scale;
                this.iScreen.height = h;//OH * scale;
                this.context.putImageData(temp, 0, 0);
            }
            
        },
        
        /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            particle생성 및 초기화 
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        createParticle:function( color ){
            var startLife = getMinMax( 30, 60 );
            var sx = parseInt(Math.random()*window.innerWidth);
            var sy = parseInt(Math.random()*window.innerHeight);
            
            var p={
                radius:2+parseInt(Math.random()*5),
                opacity:Math.random(),
                color:color,
                x: sx,
                y: sy,
                tx:getMinMax( sx-100, sx+100),
                ty:getMinMax( sy-100, sy+100),
                life:startLife,
                startLife:startLife,
                delay:1
            }
            return p;
        
        },
        
        initializeParticle: function(){
          var c = this.groupColor;
          for( var i=0; i<PARTICLE_COUNT; i++) {
                this.particles.push(this.createParticle(c));    
            }
        },
        
        createParticleWithPosition:function( cx, cy, color ){
            var startLife = getMinMax( 30, 60 );
            var p={
                radius:2+parseInt(Math.random()*5),
                opacity:Math.random(),
                color:color,
                x:cx,
                y:cy,
                tx:getMinMax( cx - 200 , cx + 200 ),
                ty:getMinMax( cy - 200 , cy + 200 ),
                life:startLife,
                startLife:startLife,
                delay:getMinMax(10, 15)
            }
            
            return p;
        },
        
        getParticleCount: function(){
            return this.particles.length;
        },
        
        
        appendParticlesFromMouse: function( cx, cy ){
            var c = this.groupColor;
            this.particles.push( this.createParticleWithPosition(cx, cy, c) );
        },
        
         /**   
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            particle 업데이트 처리 
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        drawParticles: function(){
            var i, j, p, n, hex, index;
            var distance;
            var pVisible;
             for( i=0; i<this.getParticleCount(); i++ ){
                
                p = this.particles[i];
                if( p ){
                    pVisible    =(p.life - p.delay) < 0 ? true : false;
                    hex     = hexToRgb( p.color );
                    this.context.beginPath();
                    this.context.arc( p.x, p.y, p.radius, 0, 2 * Math.PI );
                    this.context.fillStyle = "rgba("+ hex.r +","+ hex.g + "," + hex.b + ","+ p.opacity  +")";
                    this.context.fill();
                    
                   for( j=0; j<this.getParticleCount(); j++ ){
                    if( i == j ) continue;
                     
                     n = this.particles[j];
                     distance = getDistance( p.x, p.y, n.x, n.y );
                     
                     if( distance < MIN_DISTANCE && ( pVisible || (n.life - n.delay)<0 || (p.life - n.delay) < 0) ){
                        this.context.lineWidth = 1;    
                        this.context.strokeStyle = "rgba("+ hex.r +","+ hex.g + "," + hex.b + ","+ p.opacity +")";
                        this.context.moveTo( p.x, p.y );
                        this.context.lineTo( n.x, n.y );
                        this.context.stroke(); 
                        p.opacity = (p.life/p.startLife);
                     }
                   }
                    
                    this.context.closePath();
                    p.life--;
                    if( p.life <= 0 ){
                        this.particles.splice(i, 1);
                    }
                    
                }
                
            }
        },
        
        /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            particle위치 갱신
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        updateParticle:function(){
            var count = this.getParticleCount();
            var p;
            for( var i=0; i<count; i++){
                p = this.particles[i];
                if( Math.floor(Math.random()*50) == 0 ){
                  p.tx = p.x+getMinMax(-150, 150);
                  p.ty = p.y+getMinMax(-150, 150);
                }
                p.x -=(p.x-p.tx)*.012;
                p.y -=(p.y-p.ty)*.012;
            }
            
        },
        
        updateScreenBlur: function(){
            this.context.beginPath();
            this.context.fillStyle = "rgba(0, 0, 0, 0.3)";
            this.context.fillRect( 0, 0, this.iScreen.width, this.iScreen.height );
            this.context.closePath();
        },
        
        /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            render 처리 
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        render :function(){
            this.updateScreenBlur();
            this.updateParticle();
            this.drawParticles();
        },
        
        updateGroupColor : function(){
            this.groupColor = getRandomColor();
        },
        
        
        start: function(){
            this.iScreen.addEventListener( 'mousemove', this.onMouseMove_Document.bind(this) );
            this.initializeParticle();    
            this.repeatID    =setInterval( this.render.bind(this), 50 );
            this.generatorID =setInterval( this.initializeParticle.bind(this), 3000 );      
        },
        
        
        onMouseMove_Document:function(e){
            var mouse   = {x:e.layerX, y:e.layerY};
            var c       = this.getParticleCount();
            if(  getDistance(mouse.x, mouse.y, this.mx, this.my) > MIN_DISTANCE/15 ){
                this.appendParticlesFromMouse(this.mx, this.my);           
            }
            
            if( c%15 == 0 ){
                this.updateGroupColor();
            }
            this.mx = mouse.x;
            this.my = mouse.y;
        }
      
    }
   
    
    /**
        window에 객체 할당
        global 윈도우 속성을 변경하는 것이라 객체 override될수 있음.
    */
    window.ParticleNode = ParticleNode;
    
})();


