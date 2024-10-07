const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronApi', {
    crearAfiliado: (afiliado) => ipcRenderer.send('crear-afiliado', afiliado),
    onCrearAfiliado: (callback) => ipcRenderer.on('respuesta-crear-afiliado', (event, data) => callback(data)),

    //Listar afiliados
    listarAfiliados: (filtro) => ipcRenderer.send('listar-afiliados', filtro),
    onListarAfiliados: (callback) => ipcRenderer.on('respuesta-listar-afiliados', (event, data) => callback(data)),

    //Actualizar afiliados
    actualizarAfiliado: (afiliado) => ipcRenderer.send('actualizar-afiliado',afiliado),
    onActualizarAfiliado: (callback) => ipcRenderer.on('respuesta-actualizar-afiliado', (event, data) => callback(data)),

    //Dar de Baja afiliados
    darBajaAfiliado: (id) => ipcRenderer.send('dar-baja-afiliado', id),
    onDarBajaAfiliado: (callback) => ipcRenderer.on('respuesta-dar-baja-afiliado', (event, data) => callback(data)),

    //Importar archivos
    importarArchivo: (filePath) => ipcRenderer.invoke('importar-archivo', filePath)
});


window.addEventListener('DOMContentLoaded', () => {

});