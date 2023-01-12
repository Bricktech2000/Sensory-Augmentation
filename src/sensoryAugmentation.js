window.SensoryAugmentation = {
  cameraIn: async function (resolution) {
    this.resolution = resolution;
    this.size = Math.pow(2, resolution);
    //https://www.damirscorner.com/blog/posts/20170317-RenderCapturedVideoToFullPageCanvas.html
    let video = document.createElement('video');
    document.body.appendChild(video);
    let canvas = document.createElement('canvas');
    canvas.width = canvas.height = this.size;
    let ctx = canvas.getContext('2d');

    if (navigator.mediaDevices.getUserMedia) {
      let stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        //video: true,
        //the following crashes both Chrome and Chromium Edge...
        video: { facingMode: { ideal: 'environment' } },
      });
      video.setAttribute('playsinline', ''); //prevent iOS black screen
      video.srcObject = stream;
      video.play();
    } else throw new Error('getUserMedia not supported');

    function draw() {
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
  toData: async function (ctx) {
    let canvas = ctx.canvas;
    let self = this.toData;
    self.data = new Array(this.size * this.size);

    let canvas2 = document.createElement('canvas');
    canvas2.width = canvas2.height = this.size;
    let ctx2 = canvas2.getContext('2d');

    return new Promise((resolve, reject) => {
      canvas.addEventListener('draw', () => {
        //https://en.wikipedia.org/wiki/Hilbert_curve
        function xy2d(n, x, y) {
          let xa = [x],
            ya = [y];
          let rx,
            ry,
            s,
            d = 0;
          for (s = n / 2; s > 0; s /= 2) {
            rx = (xa[0] & s) > 0;
            ry = (ya[0] & s) > 0;
            d += s * s * ((3 * rx) ^ ry);
            rot(n, xa, ya, rx, ry);
          }
          return d;

          function rot(n, xa, ya, rx, ry) {
            if (ry == 0) {
              if (rx == 1) {
                xa[0] = n - 1 - xa[0];
                ya[0] = n - 1 - ya[0];
              }
              //Swap x and y
              let t = xa[0];
              xa[0] = ya[0];
              ya[0] = t;
            }
          }
        }
        //https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
        function getColorIndicesForCoord(x, y, width) {
          let red = y * (width * 4) + x * 4;
          return [red, red + 1, red + 2, red + 3];
        }

        const pixelDarkener = 5; //a constant to darken the image, reducing noise
        let imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;
        let average =
          ((imageData.reduce((a, v) => a + v, 0) / imageData.length -
            255 / 4) /*alpha*/ /
            3) *
          pixelDarkener;
        let modData = new Uint8ClampedArray(this.size * this.size * 4);

        for (let x = 0; x < canvas.width; x++) {
          for (let y = 0; y < canvas.height; y++) {
            let colorIndices = getColorIndicesForCoord(x, y, canvas.width);
            let pixelData = [
              imageData[colorIndices[0]],
              imageData[colorIndices[1]],
              imageData[colorIndices[2]],
            ];
            let pixelAverage = Math.floor(
              pixelData.reduce((a, b) => a + b, 0) / 3
            );
            let delta =
              Math.abs(pixelAverage - average) * /*noise multiplier*/ 2 -
              /*noise floor*/ 128;
            modData[colorIndices[0]] = delta;
            modData[colorIndices[1]] = delta;
            modData[colorIndices[2]] = delta;
            modData[colorIndices[3]] = 255; //100% opaque
            self.data[xy2d(this.size, x, y)] = delta / 256;
          }
        }

        //https://stackoverflow.com/questions/22823752/creating-image-from-array-in-javascript-and-html5
        let data = ctx2.createImageData(this.size, this.size);
        data.data.set(modData);
        ctx2.putImageData(data, 0, 0);
        resolve([self.data, ctx2]);
        //console.log(Math.max.apply(null, data));
        //console.log(data);
        /*let d = [];
                let i = 0;
                for(let x = 0; x < this.size; x++){
                    d[x] = [];
                    for(let y = 0; y < this.size; y++){
                        d[x][y] = xy2d(this.size, x, y);
                        i++;
                    }
                }
                console.log(d);*/
        //console.log(self.data);
      });
    });
  },
  soundOut: function (data, min, max) {
    //https://stackoverflow.com/questions/43386277/how-to-control-the-sound-volume-of-audio-buffer-audiocontext
    let ctx = new (window.AudioContext || window.webkitAudioContext)();
    let gainNodes = [];
    let outputGain = ctx.createGain();
    //let i = 0;
    //console.log(data.length);
    for (let i = 0; i < data.length; i++) {
      let gain = ctx.createGain();
      gain.gain.value = 0;
      //gain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + Math.random());
      let osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value =
        min * Math.pow(max / min, i / (this.size * this.size));

      osc.connect(gain);
      gain.connect(outputGain);
      gainNodes.push(gain);
      osc.start();
    }
    //https://stackoverflow.com/questions/55937201/how-to-fix-sound-multiple-oscillators-playing-at-the-same-time-with-javascript-w
    outputGain.gain.value = (1 / data.length) * 4;
    outputGain.connect(ctx.destination);

    function update() {
      //https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques
      for (let i = 0; i < data.length; i++) {
        //if(i % 8 != 0) continue;
        gainNodes[i].gain.linearRampToValueAtTime(
          Math.max(0, data[i]),
          ctx.currentTime + 0.1
        );
      }
      //gainNodes[i].gain.value = data[i];
      requestAnimationFrame(update);
    }
    update();
  },
};
