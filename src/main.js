const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mysql = require('mysql2');

//We create the main window of the desktop app
function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname,'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    //Load the main html file
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

};

//This event is invoked whe Electron is fully loaded
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () =>{
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

//Closes the app when all the windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


//Creamos la conexión con la base de datos MySql
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'sindicato_obras'
});

//Conectamos con la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:',err);
        return;
    }
    console.log('Conexión exitosa con la base de datos MySql');
});


ipcMain.on('crear-afiliado', (event, afiliado) => {
    const {nombre, apellido, dni, empresa, fecha_ingreso} = afiliado;

    const sql = 'INSERT INTO afiliados(nombre, apellido, dni, empresa, fecha_ingreso) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, apellido, dni, empresa, fecha_ingreso], (err, result) => {
        if (err) {
            event.reply('respuesta-crear-afiliado', {success: false, error: err.mensaje});
        } else {
            event.reply('respuesta-crear-afiliado', {success: true, id: result.insertId});
        }
    });
});

//Listamos los afiliados activos
ipcMain.on('listar-afiliados', (event) => {
    const sql = 'SELECT * FROM afiliados WHERE estado = "activo"';
    connection.query(sql, (err, results) => {
        if (err) {
            event.reply('respuesta-listar-afiliados', {success: false, error: err.mensaje});
        } else {
            event.reply('respuesta-listar-afiliados', {success: true, afiliados: results});
        }
    });
});

//Actualizar afiliado
ipcMain.on('actualizar-afiliado', (event, afiliado) => {
    const {id, nombre, apellido, dni, empresa, fecha_ingreso} = afiliado;

    const sql = 'UPDATE afiliados SET nombre = ?, apellido = ? dni = ?, empresa = ?, fecha_ingreso = ? WHERE id = ?';
    connection.query(sql, [nombre, apellido, dni, empresa, fecha_ingreso, id], (err, results) => {
        if(err) {
            event.reply('respuesta-actualizar-afiliado', {success: false, error: err.message});
        } else {
            event.reply('respuesta-actualizar-afiliado', {success: true})
        }
    });
});