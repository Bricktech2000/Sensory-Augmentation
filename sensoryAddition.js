window.SensoryAddition = {
    cameraIn: async function(resolution){
        this.resolution = resolution;
        this.size = Math.pow(2, resolution);
        //https://www.damirscorner.com/blog/posts/20170317-RenderCapturedVideoToFullPageCanvas.html
        var video = document.createElement('video');
        document.body.appendChild(video);
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = this.size;
        var ctx = canvas.getContext('2d');

        if(navigator.mediaDevices.getUserMedia){
            var stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: { facingMode: { ideal: 'environment' } },
            });
            video.srcObject = stream;
            video.play();
        }else throw new Error('getUserMedia not supported');

        function draw(){
            canvas.dispatchEvent(new Event('draw'));
            aspectRatio = video.videoWidth / video.videoHeight;
            videoWidth = canvas.height * aspectRatio;
            videoHeight = canvas.width / aspectRatio;
            videoWidthCut = Math.max(0, videoWidth - canvas.width);
            videoHeightCut = Math.max(0, videoHeight - canvas.height);
            ctx.drawImage(
                video,
                0 - videoWidthCut / 2,
                0 - videoHeightCut / 2,
                canvas.width + videoWidthCut,
                canvas.height + videoHeightCut
            );
            requestAnimationFrame(draw);
        }
        draw();

        return ctx;
    },
    toData: async function(ctx){
        var canvas = ctx.canvas;
        var self = this.toData;
        if(self.data === undefined) self.data = [];

        canvas.addEventListener('draw', () => {
            //https://en.wikipedia.org/wiki/Hilbert_curve
            function xy2d(n, x, y){
                var xa = [x], ya = [y]
                var rx, ry, s, d=0;
                for(s=n/2; s>0; s/=2){
                    rx = (xa[0] & s) > 0;
                    ry = (ya[0] & s) > 0;
                    d += s * s * ((3 * rx) ^ ry);
                    rot(n, xa, ya, rx, ry);
                }
                return d;
    
                function rot(n, xa, ya, rx, ry){
                    if(ry == 0){
                        if(rx == 1){
                            xa[0] = n-1 - xa[0];
                            ya[0] = n-1 - ya[0];
                        }
                        //Swap x and y
                        var t = xa[0];
                        xa[0] = ya[0];
                        ya[0] = t;
                    }
                }
            }
            //https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
            function getColorIndicesForCoord(x, y, width) {
                var red = y * (width * 4) + x * 4;
                return [red, red + 1, red + 2, red + 3];
            }

            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            self.data = new Array(this.size * this.size);
            for(var x = 0; x < canvas.width; x++){
                for(var y = 0; y < canvas.height; y++){
                    var colorIndices = getColorIndicesForCoord(x, y, canvas.width);
                    var pixelData = [imageData[colorIndices[0]], imageData[colorIndices[1]], imageData[colorIndices[2]]];
                    var pixelAverage = pixelData.reduce((a, b) => a + b, 0) / 3;
                    self.data[xy2d(this.size, x, y)] = pixelAverage;
                }
            }
            //console.log(Math.max.apply(null, data));
            //console.log(data);
            /*var d = [];
            var i = 0;
            for(var x = 0; x < this.size; x++){
                d[x] = [];
                for(var y = 0; y < this.size; y++){
                    d[x][y] = xy2d(this.size, x, y);
                    i++;
                }
            }
            console.log(d);*/
            console.log(self.data);
            
        });

        return self.data;
    },
}
