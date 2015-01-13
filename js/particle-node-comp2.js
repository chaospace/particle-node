// 익명함수 처리 + 초기화 호출 로직을 넣고 싶다면!
(function(){
    
    var ParticleNode =function( objScreen ){
    
    
        var iScreen     =objScreen;
        var context     =iScreen.getContext("2d");
        var particles   =[];
        var PARTICLE_COUNT = 40;    
    
        // 시작 값 저장
        var ow = 640; 
        var oh = 480; 
        var mx, my; // mouse position;
        var groupColor = getRandomColor();
        var MIN_DISTANCE = 80;
    
    
    
    
          /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            resize처리 
                - canvas의 현재 상태를 temp에 저장
                - resize처리 ( 스케일 비율 유지 )
                - temp를 이용한 상태 복원
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        function onResize_Window(){
            var temp =context.getImageData( 0, 0, iScreen.width, iScreen.height );
            
            // browser viewport size
            var w = window.innerWidth;
            var h = window.innerHeight; 
            // scale 구하기 
            var scale = Math.min(w/ow, h/oh);
            iScreen.width = ow * scale;
            iScreen.height = oh * scale;
            
            context.putImageData(temp, 0, 0);
        }


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


        /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            particle생성 및 초기화 
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        function createParticle( color ){            
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
        }


        function initializeParticle(){
            for( var i=0; i<PARTICLE_COUNT; i++) {
                particles.push(createParticle(groupColor));    
            }
        }

        function getParticleCount(){
            return particles.length;
        }

        function createParticleWithPosition( cx, cy, color ){
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
        }


        function appendParticlesFromMouse( cx, cy ){
            particles.push( createParticleWithPosition(cx, cy, groupColor) );
        }

        function getDistance( sx, sy, tx, ty ){
            var dx = tx - sx;
            var dy = ty - sy;
            return Math.sqrt( dx*dx + dy*dy);
        }
        /**   
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            particle 업데이트 처리 
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        function drawParticles(){
            var i, j, p, n, hex, index;
            var distance;
            var pVisible;
             for( i=0; i<getParticleCount(); i++ ){
                
                p = particles[i];
                if( p ){
                    pVisible    =(p.life - p.delay) < 0 ? true : false;
                    hex     = hexToRgb( p.color );
                    context.beginPath();
                    context.arc( p.x, p.y, p.radius, 0, 2 * Math.PI );
                    context.fillStyle = "rgba("+ hex.r +","+ hex.g + "," + hex.b + ","+ p.opacity  +")";
                    context.fill();
                    
                   for( j=0; j<getParticleCount(); j++ ){
                    if( i == j ) continue;
                     
                     n = particles[j];
                     distance = getDistance( p.x, p.y, n.x, n.y );
                     
                     if( distance < MIN_DISTANCE && ( pVisible || (n.life - n.delay)<0 || (p.life - n.delay) < 0) ){
                        context.lineWidth = 1;    
                        context.strokeStyle = "rgba("+ hex.r +","+ hex.g + "," + hex.b + ","+ p.opacity +")";
                        context.moveTo( p.x, p.y );
                        context.lineTo( n.x, n.y );
                        context.stroke(); 
                        p.opacity = (p.life/p.startLife);
                     }
                   }
                    
                    context.closePath();
                    p.life--;
                    if( p.life <= 0 ){
                        particles.splice(i, 1);
                    }
                    
                }
                
            }
            
        }


        /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            particle위치 갱신
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        function getMinMax( min, max ){
            var value = Math.floor( Math.random()*(max - min) + 1 ) + min;
            return value;
        }

        function updateParticle(){
            var count = getParticleCount();
            var p;
            for( var i=0; i<count; i++){
                p = particles[i];
                if( Math.floor(Math.random()*50) == 0 ){
                  p.tx = p.x+getMinMax(-150, 150);
                  p.ty = p.y+getMinMax(-150, 150);
                }
                p.x -=(p.x-p.tx)*.012;
                p.y -=(p.y-p.ty)*.012;
            }
            
        }

        function updateScreenBlur(){
            context.beginPath();
            context.fillStyle = "rgba(0, 0, 0, 0.3)";
            context.fillRect( 0, 0, iScreen.width, iScreen.height );
            context.closePath();
        }

        /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            render 처리 
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */
        function render(){
            updateScreenBlur();
            updateParticle();
            drawParticles();
        }

        function onMouseMove_Document( e ){
            
            var mouse   = {x:e.layerX, y:e.layerY};
            var c       = getParticleCount()
            if(  getDistance(mouse.x, mouse.y, mx, my) > MIN_DISTANCE/15 ){
                appendParticlesFromMouse(mx, my);           
            }
            
            if( c%15 == 0 ){
                updateGroupColor();
            }
            mx = mouse.x;
            my = mouse.y;
            
        }

        function updateGroupColor(){
            groupColor = getRandomColor();
        }

        onResize_Window();
        window.addEventListener( "resize", onResize_Window );
        
        var repeatID;
        var generatorID;
        /**
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
            start처리 
        ▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧▧
        */    
        iScreen.addEventListener( 'mousemove', onMouseMove_Document );
        initializeParticle();    
        repeatID    =setInterval( render, 50 );
        generatorID =setInterval( initializeParticle, 3000 );      
        
    
    }
    
    /**
        window에 객체 할당
        global 윈도우 속성을 변경하는 것이라 객체 override될수 있음.
    */
    window.ParticleNode = ParticleNode;
    
})();


