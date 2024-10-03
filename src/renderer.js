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

document.getElementById('darBajaAfiliado').addEventListener('click', () => {
    const afiliadoId = document.getElementById('afiliadoId').value;
    
})