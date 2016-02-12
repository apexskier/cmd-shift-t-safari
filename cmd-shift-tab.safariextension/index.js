(function() {
    // Maybe to be used when I've got a settings page
    //document.getElementById('shortcut').addEventListener('keydown', function(e) {
    //    var shortcut = '';
    //    if (e.metaKey) shortcut += '⌘';
    //    if (e.altKey) shortcut += '⌥';
    //    if (e.ctlKey) shortcut += '^';
    //    if (e.shiftKey) shortcut += '⇧';
    //    // don't add modifier keys as text
    //    if ([16, 17, 18, 91, 93].indexOf(e.keyCode) < 0) {
    //        shortcut += String.fromCharCode(e.keyCode).toUpperCase();
    //    }
    //    e.target.value = shortcut;
    //});

    // Not using settings obj because I'll need to adjust my history
    // traversal if it changes.
    var max = 1000; // safari.extension.settings.historyLength
    var history;
    if (safari.extension.settings.storage === 'memory') {
        // in memory history
        history = [];
    } else {
        // localStorage history, implements a subset of an array
        history = (function() {
            var obj = {
                shift: function() {
                    var l = this.length;
                    var s = this.start;
                    if (l === 0) return null;
                    this.length = l - 1;
                    this.start = (s + 1) % max;
                    return JSON.parse(localStorage.getItem(s % max));
                },
                push: function(v) {
                    var l = this.length;
                    var e = this.end;
                    if (l >= max) throw new Error('full');
                    localStorage.setItem(e % max, JSON.stringify(v));
                    this.length = l + 1;
                    this.end = (e + 1) % max;
                },
                pop: function() {
                    var l = this.length;
                    var e = this.end;
                    e = (e > 0) ? (e - 1) : (max - 1);
                    if (l === 0) return null;
                    this.length = l - 1;
                    this.end = e;
                    return JSON.parse(localStorage.getItem(e));
                },
                get length() {
                    return parseInt(localStorage.getItem('length') || 0);
                },
                set length(v) {
                    localStorage.setItem('length', v);
                },
                get start() {
                    return parseInt(localStorage.getItem('start') || 0);
                },
                set start(v) {
                    localStorage.setItem('start', v);
                },
                get end() {
                    return parseInt(localStorage.getItem('end') || 0);
                },
                set end(v) {
                    localStorage.setItem('end', v);
                }
            }

            function debug() {
                console.log('l = ' + obj.length);
                console.log('s = ' + obj.start);
                console.log('e = ' + obj.end);
            }

            if (safari.extension.settings.reset) {
                obj.start = 0;
                obj.end = 0;
                obj.length = 0;
                safari.extension.settings.reset = false;
            }

            return obj;
        })();
    }

    safari.application.addEventListener('close', function(e) {
        var tab = e.target;
        // no tracking private windows, untested...
        if (tab.private) return;

        // don't overflow
        if (history.length >= max) {
            history.shift();
        }

        var isTab = tab instanceof SafariBrowserTab;
        // closing a window emits two events: first the tab, then the window
        // we'll mark the tab as a window, because the second event doesn't
        // have a url.
        if (history.length > 0 && !isTab) {
            // slightly inefficient for arrays, but works with localStorage obj
            var item = history.pop();
            item.tab = isTab;
            history.push(item);
        } else {
            history.push({
                url: tab.url,
                tab: isTab
            });
        }
    }, true);

    // Since in window scripts can't access settings, we send each
    // keydown event here and process it globally
    safari.application.addEventListener('message', function(e) {
        if (e.name === 'openlast') {
            var shortcut = safari.extension.settings.shortcut.toUpperCase();
            if ((e.message.metaKey || false) === (shortcut.indexOf('⌘') >= 0)
                && (e.message.shiftKey || false) === (shortcut.indexOf('⇧') >= 0)
                && (e.message.ctlKey || false) === (shortcut.indexOf('^') >= 0)
                && (e.message.altKey || false) === (shortcut.indexOf('⌥') >= 0)
                && shortcut.indexOf(String.fromCharCode(e.message.keyCode).toUpperCase()) >= 0) {
                var tab = history.pop();
                if (tab) {
                    var newTab;
                    if (tab.tab !== false) {
                        newTab = safari.application.activeBrowserWindow.openTab('foreground');
                    } else {
                        var newWindow = safari.application.openBrowserWindow();
                        newWindow.activate();
                        newTab = newWindow.activeTab;
                    }
                    newTab.url = tab.url;
                }
            }
        }
    }, false);
})();
