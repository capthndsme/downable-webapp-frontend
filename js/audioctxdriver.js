if (Preferences.useAudioCtx || true) {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audioCtx = new AudioContext();
    window.MediaCtx = audioCtx.createMediaElementSource(AudioPlayer);
    window.MediaCtx.connect(audioCtx.destination);
   
}

if (Preferences.enableMilkdrop || true) {
    let da = audioCtx.createDelay();
    da.delayTime.value = 0.26;
    da.connect(audioCtx.destination);
    // initialize audioContext and get canvas
    let _BackdropCanvas = document.getElementById("BackdropCanvas");
    window.visualizer = butterchurn.default.createVisualizer(audioCtx, _BackdropCanvas, {
    width: window.innerWidth,
    height: window.innerHeight
    });

    // get audioNode from audio source or microphone

    visualizer.connectAudio(MediaCtx);

    // load a preset

    let presets = butterchurnPresets.getPresets();
    let preset = presets['Flexi, martin + geiss - dedicated to the sherwin maxawow'];

    visualizer.loadPreset(preset, 4.0); // 2nd argument is the number of seconds to blend presets

    // resize visualizer

    visualizer.setRendererSize(window.innerWidth , window.innerHeight);

    // render a frame

    visualizer.render();
}