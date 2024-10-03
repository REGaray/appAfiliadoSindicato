const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    crearAfiliado: (afiliado) => ipcRenderer.send('crear-afiliado', afiliado),
    onCrearAfiliado: (callback) => ipcRenderer.on('respuesta-crear-afiliado', (event, data) => callback(data))
});

//Listar afiliados
contextBridge.exposeInMainWorld('electronApi', {
    listarAfiliados: (filtro) => ipcRenderer.send('listar-afiliados', filtro),
    onListarAfiliados: (callback) => ipcRenderer.on('respuesta-listar-afiliados', (event, (event, data) => callback(data)))
});

//Actualizar afiliados
contextBridge.exposeInMainWorld('electronAPI', {
    actualizarAfiliado: (afiliado) => ipcRenderer.send('actualizar-afiliado',afiliado),
    onActualizarAfiliado: (callback) => ipcRenderer.on('respuesta-actualizar-afiliado', (event, data) => callback(data))
});


window.addEventListener('DOMContentLoaded', () => {

});