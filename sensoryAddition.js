window.SensoryAddition = {
    cameraIn: async function(){
        //https://www.damirscorner.com/blog/posts/20170317-RenderCapturedVideoToFullPageCanvas.html
        var video = document.createElement('video');
        document.body.appendChild(video);
        if(navigator.mediaDevices.getUserMedia){
            var stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                //video: { facingMode: { ideal: 'environment' } },
                video: true,
            });
            video.srcObject = stream;
            video.play();
        }else throw new Error('getUserMedia not supported');
    }
}
