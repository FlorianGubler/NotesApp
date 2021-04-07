const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            // whitelist channels
            let validChannels = ["toMain"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            ipcRenderer.once(channel, (event, args) => {
                func(JSON.parse(args))
                args = null;
            });
        },
        receiveEndless: (channel, func) => {
            ipcRenderer.on(channel, (event, args) => {
                func(JSON.parse(args))
                args = null;
            });
        }
    }
);