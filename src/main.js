const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const mysql = require('mysql2');
const fs = require('fs');
const csvParser = require('csv-parser');
const xlsx = require('xlsx');

//We create the main window of the desktop app
/* function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Ruta al archivo preload.js
        }
    });

    win.loadFile('index.html');
} */

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
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        };
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

//Lógica para manejar la importación de un archivo
ipcMain.handle('importar-archivo', async (event, filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    let registros;

    if (extension === 'csv') {
        registros = await importarCSV(filePath);
    } else if (extension === 'xlsx') {
        registros = await importarExcel(filePath);
    } else {
        throw new Error('Formato de archivo no soportado. Sólo csv o xlsx');
    }

    const registrosValidados = validarRegistros(registros);
    await insertarRegistrosEnBD(registrosValidados);

    return 'Importación exitosa';
});

function importarCSV(filePath) {
    return new Promise((resolve, reject) => {
        const registros = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                registros.push(row);
            })
            .on('end', () => {
                resolve(registros);
            })
            .on('error', (error) => reject(error));
    });
}

function importarExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const registros = xlsx.utils.sheet_to_json(sheet);
    return registros;
}

function validarRegistros(registros) {
    const errores = [];
    registros.forEach((registro, index) => {
        if(!registro.nombre || registro.apellido) {
            errores.push(`Fila ${index + 1}: Nombre o Apellido faltante`);
        }
        if(!registro.dni || isNaN(registro.dni)) {
            errores.push(`Fila ${index +1}: DNI inválido`);
        }
    });

    if (errores.length > 0) {
        throw new Error(`Errores encontrados: \n${errores.join('\n')}`);
    }

    return registros;
}

//EJEMPLO DE INSERCIÓN MASIVA A LA BASE DE DATOS
/* const mysql = require('mysql2/promise');

async function insertarRegistrosEnBD(registros) {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        database: 'sindicato'
    });

    try {
        await connection.beginTransaction();

        for (const registro of registros) {
            const [result] = await connection.execute(
                `INSERT INTO afiliados (nombre, apellido, dni, empresa, localidad)
                VALUES (?, ?, ?, ?, ?)`,
                [registro.nombre, registro.apellido, registro.dni, registro.empresa, registro.localidad]
            );
        }

        await connection.commit();
        console.log('Registros importados exitosamente');
    } catch (error) {
        await connection.rollback();
        throw new Error('Error al insertar registros: ' + error.message);
    } finally {
        await connection.end();
    }
} */

//Lógica que abre un cuadro de diálogo nativo del sistema para seleccionar un archivo
app.whenReady().then()(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    mainWindow.loadFile('index.html');
});


/* app.whenReady().then()(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    mainWindow.loadFile('index.html');
}); */

//Lógica del cuadro de diálogo para seleccionar el archivo
/* ipcMain.handle('dialog:openFile', async () => {
    const {canceled, filePaths} = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {name: 'Archivos CSV o Excel', extensions: ['csv', 'xlsx']}
        ]
    });

    if (canceled) {
        //si el usuario cancela, no se devuelve nada (null)
        return null;
    } else {
        //si el usuario confirma, se devuelve el archivo seleccionado
        return filePaths[0];
    }
}); */

ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Archivos CSV o Excel', extensions: ['csv', 'xlsx'] }
        ]
    });
    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0]; // Aseguramos que filePaths está definido
    }
});

//Lógica para importar archivo
ipcMain.handle('archivo:importar', async (event, filePath) => {
    // Lógica para procesar el archivo
    try {
        // Aquí agregas la lógica para leer y procesar el archivo
        return 'Archivo importado exitosamente';
    } catch (error) {
        throw new Error('Error al importar archivo');
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});