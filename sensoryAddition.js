window.SensoryAddition = {
    cameraIn: async function(canvas){
        //https://www.damirscorner.com/blog/posts/20170317-RenderCapturedVideoToFullPageCanvas.html
        var video = document.createElement('video');
        document.body.appendChild(video);
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
    }
}
