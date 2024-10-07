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

//This event is invoked when Electron is fully loaded
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

ipcMain.on('dar-baja-afiliado', (event, id) => {
    const sql = 'UPDATE afiliados SET estado = "baja", fecha_baja = CURRENT_DATE WERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            event.reply('respuesta-dar-baja-afiliado', {success: false, error: err.message});
        } else {
            event.reply('respuesta-dar-baja-afiliado',{success: true});
        }
    });
});

ipcMain.on('listar-afiliados', (event, filtro) => {
    let sql;

    if (filtro === 'activos') {
        sql = 'SELECT * FROM afiliados WHERE estado = "activo"';
    } else if (filtro === 'baja') {
        sql = 'SELECT * FROM afiliados WHERE estado = "baja"';
    } else {
        sql = 'SELECT * FROM afiliados'
    }

    connection.query(sql, (err,results) => {
        if (err) {
            event.reply('respuesta-listar-afiliados', {success: false, error: err.message});
        } else {
            event.reply('respuesta-listar-afiliados', {status: true, afiliados: results});
        }
    });
});

ipcMain.on('actualizar-afiliado', (event, afiliado) => {
    const {id, nombre, apellido, dni, empresa, fecha_ingreso} = afiliado;

    const sql = 'UPDATE afiliados SET nombre = nombre = ?, apellido = ?, dni = ?, empresa = ?, fecha_ingreso = ?';
    connection.query(sql, [nombre, apellido, dni, empresa, fecha_ingreso, id], (err, result) => {
        if (err) {
            event.reply('respuesta-actualizar-afiliado', {success: false, error: err.message});
        } else {
            event.reply('respuesta-actualizar-afiliado', {success: true});
        }
    });
});

//Eliminar afiliado
ipcMain.on('dar-baja-afiliado', (event, id) => {
    const sql = 'UPDATE afiliados SET estado = "baja", fecha_baja = CURRENT_DATE WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if(err) {
            event.reply('respuesta-dar-baja-afiliado', {success: false, error: err.message});
        } else {
            event.reply('respuesta-dar_baja_afiliado', {succes: true});
        }
    });
});

ipcMain.on('crear-afiliado', (even,afiliado) => {
    let errores = [];

    //validaciones en el backend
    if(!afiliado.nombre || afiliado.nombre.trim() === '') errores.push("El nombre es obligatorio");
    if(!afiliado.apellido || afiliado.apellido.trim() === '') errores.push("El apellido es obligatorio");
    if(!afiliado.dni || !/^\d+$/.test(afiliado.dni)) errores.push("El Dni es obligatorio");
    if(!afiliado.empresa) errores.push("La empresa es obligatoria");
    if(!afiliado.fecha_ingreso || isNaN(Date.parse(afiliado.fecha_ingreso))) {
        errores.push("La fecha de ingreso es obligatoria y debe ser válida");
    } 

    //verificamos si hay errores
    if(errores.length > 0) {
        event.reply('respuesta-crear-afiliado', {success: false, error: errores.join(', ')});
        return;
    }

    //si está todo bien, se inserta el afiliado en la base de datos
    const sql = 'INSERT INTO afiliados (nombre, apellido, dni, empresa, fecha_ingreso, estado) VALUES (?, ?, ?, ?, ?, "activo")';
    connection.query(sql, [afiliado.nombre, afiliado.apellido, afiliado.dni, afiliado.empresa, afiliado.fecha_ingreso], (err, result) => {
        if(err) {
            event.reply('respuesta-crear-afiliado', {success: false, error: err.message});
        } else {
            event.reply('respuesta-crear-afiliado', {success: true});
        }
    });
});

ipcMain.on('asignar-beneficio', (event, {afiliadoId, beneficioId,hijoEdad}) => {
    let errores = [];

    //validamos si es correcto el beneficio de escolaridad
    if(beneficioId === 'escolaridad' && hijoEdad > 18) {
        errores.push("El beneficio de escolaridad no puede ser asignado a hijos mayores de 18 años");
    }

    //si hay algún error en la asignación del beneficio, devolvemos el error
    if(errores.length > 0) {
        event.reply('respuesta-asignar-beneficio', {success: false, error: errores.join(', ')});
        return;
    }

    //en caso de no encontrar errores, asignamos el beneficio
    const sql = 'INSERT INTO beneficios_asignados (afiliado_id, beneficio_id, fecha_asignacion) VALUES (?, ?, CURRENT DATE)';
    connection.query(sql, [afiliadoId, beneficioId], (err,result) => {
        if(err) {
            event.reply('respuesta-asignar-beneficio', {success: false, error: err.message});
        } else {
            event.reply('respuesta-asignar-beneficio', {success: true});
        }
    });
});



//Validaciones y autenticaciones de roles (por medio de una tabla en la base de datos)
ipcMain.handle('autenticar-usuario', async(event, username, password) => {
    const usuario = await autenticarUsuarioEnBD(username, password);
    if(usuario) {
        return {rol: usuario.rol};
    } else {
        throw new Error('Usuario o contraseña incorrectos');
    }
});

//PARA QUE FUNCIONEN LOS ROLES, SE TIENE QUE AGREGAR EN LA BASE DE DATOS UNA TABLA PARECIDA A LA SIGUIENTE:
/* CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),  -- Debes usar hashing de contraseñas
    rol ENUM('sysadmin', 'administrador', 'secretaria', 'contable')
);
 */