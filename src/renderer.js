document.getElementById('crearAfiliado').addEventListener('click', () => {
    const afiliado = {
        nombre: document.getElementById('nombre').value,
        apellido: document.getElementById('apellido').value,
        dni: document.getElementById('dni').value,
        empresa: document.getElementById('empresa').value,
        fecha_ingreso: document.getElementById('fecha_ingreso').value
    };

    //Se envían los datos al backend para crear el afiliado
    window.electronAPI.crearAfiliado(afiliado);
});

//Se habilita la escucha del backend
window.electronAPI.onCrearAfiliado((responde) => {
    if (response.success) {
        console.log('Afiliado creado exitosamente (ID: ',response.id);
    } else {
        console.log('Error al crear afiliado: ', response.error);
    }
});

//Botón listar afiliados activos
document.getElementById('listarAfiliadosActivos').addEventListener('click', () => {
    window.electronAPI.listarAfiliados('activos');
});

//Botón listar afiliados inactivos
document.getElementById('listarAfiliadosInactivos').addEventListener('click', () => {
    window.electronAPI.listarAfiliados('baja');
});

//Se escucha la respuesta del backend a los botones de listar afiliados
window.electronAPI.onListarAfiliados((response) => {
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

    window.electronAPI.actualizarAfiliado(afiliado);
};

//escuchamos la respuesta del backend
window.electronAPI.onActualizarAfiliado((response) => {
    if (responde.success) {
        console.log('Afiliado actualizado exitosamente');
    } else {
        console.error('Error al actualizar afiliado: ', response.error);
    }
});

//Lógica del botón para dar de baja afiliado
document.getElementById('darBajaAfiliado').addEventListener('click', () => {
    const afiliadoId = document.getElementById('afiliadoId').value;
    window.electronAPI.darBajaAfiliado(afiliadoId);
});

//Escucha desde el backend la función para dar de baja afiliado
window.electronAPI.onDarBajaAfiliado((response) => {
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
        window.electronAPI.crearAfiliado(afiliado);
    }
});