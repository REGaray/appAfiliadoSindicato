//Integración con index.hmtl
//Mostrar y cargar afiliados
document.getElementById('nav-afiliados').addEventListener('click', () => {
    ocultarSecciones();
    document.getElementById('form-afiliados').style.display = 'block';
    document.getElementById('lista-afiliados').style.display = 'block';
    //cargarAfiliados();
});

//Mostrar Sección Beneficios
document.getElementById('nav-beneficios').addEventListener('click', () => {
    mostrarSeccion('form-beneficios');
});

//Mostrar Sección Ayuda
document.getElementById('nav-ayudas').addEventListener('click', () =>{
    mostrarSeccion('form-ayudas');
});

//Mostrar Sección Usuarios
document-getElementById('nav-usuarios').addEventListener('click', () => {
    mostrarSeccion('form-usuarios');
});

//Función reutilizable para Mostrar Secciones
function mostrarSeccion(seccionId) {
    document.getElementById('form-afiliados').style.display = 'none';
    document.getElementById('lista-afiliados').style.display = 'none';
    document.getElementById(seccionId).style.display = 'block';
}

//Función que muestra los formularios asociados a Afiliados al hacer click en "Afiliados"
/* document.getElementById('nav-afiliados').addEventListener('click', () => {
    ocultarSecciones();
    document.getElementById('form-afiliados').style.display = 'block';
    document.getElementById('lista-afiliados').style.display = 'block';
}) */

//Función reutilizable para Ocultar Secciones
function ocultarSecciones() {
    document.getElementById('form-afiliados').style.display = 'none';
    document.getElementById('lista-afiliados').style.display = 'none';
    //agregar las otras secciones del menú
}

//Función para Cargar Afiliados
Window.electronApi.obtenerAfiliados((afiliados) => {
    const tablaBody = document.getElementById('tablaAfiliadosBody');
    tablaBody.innerHTML = '';
    afiliados.forEach(afiliado => {
        const fila =
        `<tr>
            <td>${afiliado.id}</td>
            <td>${afiliado.nombre}</td>
            <td>${afiliado.apellido}</td>
            <td>${afiliado.dni}</td>
            <td>${afiliado.empresa}</td>
            <td>${afiliado.fecha_ingreso}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarAfiliado(${afiliado.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarAfiliado(${afiliado.id})">Eliminar</button>            
            </td>
        </tr>`;
        tablaBody.innerHTML += fila;
    });
});

document.getElementById('crearAfiliado').addEventListener('click', () => {
    const afiliado = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        dni: document.getElementById('dni').value,
        empresa: document.getElementById('empresa').value,
        fecha_ingreso: document.getElementById('fecha_ingreso').value
    };

    //Se envían los datos al backend para crear el afiliado
    Window.electronApi.crearAfiliado(afiliado);
    
});

//Se habilita la escucha del backend
Window.electronApi.onCrearAfiliado((response) => {
    if (response.success) {
        console.log('Afiliado creado exitosamente (ID: ',response.id);
    } else {
        console.log('Error al crear afiliado: ', response.error);
    }
});

//Botón listar afiliados activos
document.getElementById('listarAfiliadosActivos').addEventListener('click', () => {
    Window.electronApi.listarAfiliados('activos');
});

//Botón listar afiliados inactivos
document.getElementById('listarAfiliadosInactivos').addEventListener('click', () => {
    Window.electronApi.listarAfiliados('baja');
});

//Se escucha la respuesta del backend a los botones de listar afiliados
Window.electronApi.onListarAfiliados((response) => {
    if(response.success) {
        const afiliados = response.afiliados;
        let html = '';
        afiliados.forEach(afiliado => {
            html += `<li>${afiliado.nombre} ${afiliado.apellido} - ${afiliado.empresa} - Estado: ${afiliado.estado}</li>`;
        });
        document.getElementById('listarAfiliados').innerHTML = `<ul>${html}</ul>`;
    } else {
        console.error('Error al listar los afiliados: ',response.error);
    }
});

//lectura del contenido del formulario para actualizar afiliado
document.getElementById('actualizarAfiliado').addEventListener('click'), () => {
    const afiliado = {
        id: document.getElementById('afiliadoId').value,
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        dni: document.getElementById('dni').value,
        empresa: document.getElementById('empresa').value,
        fecha_ingreso: document.getElementById('fecha_ingreso').value
    };

    Window.electronApi.actualizarAfiliado(afiliado);
};

//escuchamos la respuesta del backend
Window.electronApi.onActualizarAfiliado((response) => {
    if (response.success) {
        console.log('Afiliado actualizado exitosamente');
    } else {
        console.error('Error al actualizar afiliado: ', response.error);
    }
});

//Lógica del botón para dar de baja afiliado
document.getElementById('darBajaAfiliado').addEventListener('click', () => {
    const afiliadoId = document.getElementById('afiliadoId').value;
    Window.electronApi.darBajaAfiliado(afiliadoId);
});

//Escucha desde el backend la función para dar de baja afiliado
Window.electronApi.onDarBajaAfiliado((response) => {
    if(response.success) {
        console.log('Afiliado dado de baja exitosamente');
    } else {
        console.log('Error al dar de baja al afiliado: ',response.error);
    }
});


//VALIDACIONES DE DATOS

//Validaciones de Afiliados
function validarAfiliado(afiliado) {
    let errores = [];

    //validamos los campos que consideramos requeridos como obligatorios
    if(!afiliado.nombre) errores.push("El nombre es obligatorio");
    if(!afiliado.apellido) errores.push("El apellido es obligatorio");
    if(!afiliado.dni) errores.push("El DNI es obligatoorio");
    if(!afiliado.empresa) errores.push("La empresa es obligatoria");
    if(!afiliado.fecha_ingreso) errores.push("La fecha de ingreso es obligatoria");

    //validamos que el DNI sea de tipo numérico (sólo números)
    if(afiliado.dni && !/^\d+$/.test(afiliado.dni)) {
        errores.push("El DNI debe contener sólo números");
    }

    //validamos que la fecha de ingreso no es posterior a la de hoy
    const fechaActual = new Date();
    const fechaIngreso = new Date(afiliado.fecha_ingreso);
    if (fechaIngreso > fechaActual) {
        errores.push("La fecha de ingreso no puede ser futura");
    }

    return errores;
};

//integración de la validación con el evento de crear o actualizar afiliado
document.getElementById('crearAfiliado').addEventListener('click', () => {
    const afiliado = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        dni: document.getElementById('dni').value,
        empresa: document.getElementById('empresa').value,
        fecha_ingreso: document.getElementById('fecha_ingreso').value
    };

    //Validación
    const errores = validarAfiliado(afiliado);

    if (errores.length > 0){
        alert('Se han encontrado errores en la operación: \n'+errores.join('\n'));
    } else {
        //si no hay errores, se continúa con la modificación o alta del afiliado
        Window.electronApi.crearAfiliado(afiliado);
    }
});


//Mensajes de Retroalimentación (errores y ok)
Window.electronApi.onCrearAfiliado((response) => {
    if(response-success) {
        alert('Afiliado creado exitosamente');
    } else {
        alert('Error al crear afiliado: '+response.error);
    }
});


//Lógica que maneja la carga masiva de Afiliados
document.getElementById('btnImportar').addEventListener('click', () => {
    //Abre el cuadro de diálogo para seleccionar el archivo
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if(file) {
        //Envía la ruta de acceso del archivo al backend para procesar
        Window.electronApi.importarArchivo(file.path);
    }
})