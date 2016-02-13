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
    var maxHistory = 1000; // safari.extension.settings.historyLength
    var history;
    if (safari.extension.settings.storage === 'memory') {
        // in memory history
        history = [];
    } else {
        // localStorage history, implements a subset of an array methods
        // with overflow protection and wrapping
        history = (function() {
            var obj = {
                shift: function() {
                    var l = this.length,
                        s = this.start;
                    if (l === 0) return null;
                    this.length = l - 1;
                    this.start = (s + 1) % maxHistory;
                    return JSON.parse(localStorage.getItem(s % maxHistory));
                },
                push: function(v) {
                    var l = this.length,
                        e = this.end;
                    if (l >= maxHistory) throw new Error('full');
                    localStorage.setItem(e % maxHistory, JSON.stringify(v));
                    this.length = l + 1;
                    this.end = (e + 1) % maxHistory;
                },
                pop: function() {
                    var l = this.length,
                        e = this.end;
                    if (l === 0) return null;
                    e = (e > 0) ? (e - 1) : (maxHistory - 1);
                    this.length = l - 1;
                    this.end = e;
                    return JSON.parse(localStorage.getItem(e));
                },
                reset: function() {
                    this.start = 0;
                    this.end = 0;
                    this.length = 0;
                },
                get length() {
                    return parseInt(localStorage.getItem('length')) || 0;
                },
                set length(v) {
                    localStorage.setItem('length', v);
                },
                get start() {
                    return parseInt(localStorage.getItem('start')) || 0;
                },
                set start(v) {
                    localStorage.setItem('start', v);
                },
                get end() {
                    return parseInt(localStorage.getItem('end')) || 0;
                },
                set end(v) {
                    localStorage.setItem('end', v);
                }
            }

            if (safari.extension.settings.reset) {
                obj.reset();
                safari.extension.settings.reset = false;
            }

            return obj;
        })();
    }
    
    var windows = {};

    window.obj = history;

    safari.application.addEventListener('close', function(e) {
        console.log(e);
        var tab = e.target;
        // no tracking private windows, untested...
        if (tab.private) return;

        // don't overflow
        if (history.length >= maxHistory) history.shift();

        // !isTab <=> tab instanceof SafariBrowserWindow
        var isTab = tab instanceof SafariBrowserTab;
        // closing a window emits two events: first the tab, then the window
        // we'll mark the tab as a window, because the second event doesn't
        // have a url.
        if (!isTab) {
            var win = tab;
            var search = Object.keys(windows).map(function(key) {
                return [key, windows[key]];
            }).filter(function(v) {
                return win === v[1];
            });
            if (search.length) delete windows[search[0][0]];
        } else {
            var id,
                win = tab.browserWindow;
            var search = Object.keys(windows).map(function(key) {
                return [key, windows[key]];
            }).filter(function(v) {
                return win === v[1];
            });
            if (search.length) id = search[0][0];
            else {
                id = guid();
                windows[id] = win;
            }
            history.push({
                url: tab.url,
                tab: isTab,
                index: win.tabs.indexOf(tab),
                win: id
            });
        }
    }, true);

    // Since in window scripts can't access settings, we send each
    // keydown event here and process it globally
    safari.application.addEventListener('message', function(e) {
        if (e.name === 'openlast') {
            var shortcut = safari.extension.settings.shortcut.toUpperCase(),
                msg = e.message;
            if ((msg.metaKey || false) === (shortcut.indexOf('⌘') >= 0)
                && (msg.shiftKey || false) === (shortcut.indexOf('⇧') >= 0)
                && (msg.ctlKey || false) === (shortcut.indexOf('^') >= 0)
                && (msg.altKey || false) === (shortcut.indexOf('⌥') >= 0)
                && shortcut.indexOf(String.fromCharCode(msg.keyCode).toUpperCase()) >= 0) {
                var tab = history.pop();
                var reopenEmptyTabs = safari.extension.settings.reopenEmptyTabs;
                if (tab && (tab.url || reopenEmptyTabs)) {
                    var win, newTab;
                    if (windows.hasOwnProperty(tab.win)) {
                        win = windows[tab.win];
                        newTab = win.openTab('foreground', tab.index);
                    } else {
                        win = safari.application.openBrowserWindow();
                        windows[tab.win] = win;
                        newTab = win.activeTab;
                    }
                    win.activate();
                    if (tab.url) newTab.url = tab.url;
                }
            }
        }
    }, false);
})();

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
