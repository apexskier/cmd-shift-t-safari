(function() {
    window.addEventListener('keydown', function(e) {
        // send a minimal key event
        safari.self.tab.dispatchMessage('openlast', {
            keyCode: e.keyCode,
            shiftKey: e.shiftKey, // shift
            metaKey: e.metaKey, // cmd
            ctrlKey: e.ctrlKey, // ctl
            altKey: e.altKey, // alt
        });
    }, false);
})();
