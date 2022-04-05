let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btn = document.querySelector('#guardar-cliente');
btn.addEventListener('click', savePedido);

function savePedido(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    const camposVacios = [mesa, hora].some((el) => el === '');

    if(camposVacios){
        const existeAlert = document.querySelector('.invalid-feedback');

        if(!existeAlert){
            const alert = document.createElement('div');
            alert.classList.add('invalid-feedback', 'd-block', 'text-center');
            alert.textContent = 'Todos los campos son obligatorios';
            document.querySelector('.modal-body form').appendChild(alert);

            //Eliminar alert
            setTimeout(() => {
                alert.remove();
            }, 3000)
        }
        return;

    }

    //Asignando datos del formulario a cliente
    cliente = {...cliente, mesa, hora}
    console.log(cliente)

    //Ocultar Modal
    const modalFormulario = document.querySelector('#formulario');
    const modalBootstrap =  bootstrap.Modal.getInstance(modalFormulario);
    modalBootstrap.hide();

    //Mostrar las secciones
    showSecciones();

    //Obtener platillos de la API JSON-server
    getPlatillos();
}

function showSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'))
}

function getPlatillos(){
    const url = 'http://localhost:4000/platillos';

    fetch(url)
    .then(response => response.json())
    .then(data => showPlatillos(data))
    .catch(err => console.log(err))
}

function showPlatillos(platillos){
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach((platillo) => {
        const row = document.createElement('div');
        row.classList.add('row');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = platillo.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3');
        precio.textContent = `$${platillo.precio}`

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        categoria.textContent = categorias[platillo.categoria]


        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${platillo.id}`;
        inputCantidad.classList.add('form-control')

        inputCantidad.onchange = () => {
           const cantidad = parseInt(inputCantidad.value);
           addPlatillo({...platillo, cantidad})
        }


        const agregar =  document.createElement('div');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad)



        row.appendChild(nombre);
        row.appendChild(precio)
        row.appendChild(categoria);
        row.appendChild(agregar)
        contenido.appendChild(row)

    })

}


function addPlatillo(producto){
    //Extraer el pedido
    let {pedido} = cliente;


    //Revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0){
        //Comprueba si el producto en el array
        if(pedido.some(art => art.id === producto.id)){
            //Si existe, actualizar el articulo
            const pedidoActualizado = pedido.map((art) => {
                if(art.id === producto.id){
                    art.cantidad = producto.cantidad;
                }
                return art;
            });
            //Se asigna el neuvo array al cliente.pedido
            cliente.pedido = [...pedidoActualizado]
        }else{
            //El articulo no existe lo agregamos al array
            cliente.pedido = [...pedido, producto]
        }
    }else{
        //Elminar elementos cuando la cantidad es 0
        const resultado = pedido.filter((art) => art.id !== producto.id);
        cliente.pedido = [...resultado]; 
    }

    console.log(cliente.pedido)

    //Limpiar html
    limpiarHtml();

    if(cliente.pedido.length){
        //Mostrar resumen
    actualizarResumen();

    }else{
        mensajePedidoVacio();
    }

    /*
    //Mostrar resumen
    actualizarResumen();*/
}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido');
    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    //Informacion de la mesa
    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');


    //Informacion de la hora
    const hora = document.createElement('p');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //Agregar a los elementos padre
    mesa.appendChild(mesaSpan)
    hora.appendChild(horaSpan)

    //Titulo de la seccion
    const heading = document.createElement('h3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');

    //Iterar sobre el array de pedidos
    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    const { pedido } = cliente;
    pedido.forEach((el) => {
        const {id, nombre, precio, cantidad } = el;

        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        const nombreEl = document.createElement('h4');
        nombreEl.classList.add('my-4');
        nombreEl.textContent = nombre;

        //Precio del pedido
        const precioEl = document.createElement('p');
        precioEl.classList.add('fw-bold');
        precioEl.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //Cantidad del pedido
        const cantidadEl = document.createElement('p');
        cantidadEl.classList.add('fw-bold');
        cantidadEl.textContent = 'Precio: ';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `$${precio}`

        // subtotal del pedido
        const subtotalEl = document.createElement('p');
        subtotalEl.classList.add('fw-bold');
        subtotalEl.textContent = 'Subtotal: ';

        const subtotalValor = document.createElement('span');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularCantidad(precio, cantidad);

        //Btn para eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-outline-danger');
        btnEliminar.textContent = 'Eliminar pedido'

        //Método para eliminar pedido
        btnEliminar.onclick = () => {
            eliminarProducto(id)
        }


        //Agregar valores a sus contenedores
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);
        

        //Agregar elementos al Li
        lista.appendChild(nombreEl);
        lista.appendChild(cantidadEl);
        lista.appendChild(precioEl);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar)

        //Agregar elementos al grupo princiapl
        grupo.appendChild(lista)
    })

    //Agregar al contenido
    resumen.appendChild(heading)
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo)

    contenido.appendChild(resumen);

    //Mostrar formulario propinas
    formularioPropinas();

}

function limpiarHtml(){
    const contenido = document.querySelector('#resumen .contenido');

    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularCantidad(precio, cantidad){
    return `$${precio * cantidad}`;
}

function eliminarProducto(id){
    const {pedido} = cliente;
    const resultado = pedido.filter((el) => el.id !== id);
    cliente.pedido = [...resultado];

    //limpiarHtml
    limpiarHtml();

    //Mostar resumen
    actualizarResumen();

    /* Reemplazar...
      if(cliente.pedido.length){
        //Mostrar resumen
    actualizarResumen();

    }else{
        mensajePedidoVacio();
    }
    */

    //El producto se elimino, debemos regresara 0 el formulario
    const productoEliminado = `#{producto-${id}}`;
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;

}

function mensajePedidoVacio(){
    const contenido = document.querySelector('#resumen .contenido');

    const text = document.createElement('p');
    text.classList.add('text-center');
    text.textContent = 'Añade los elementos del pedido';

    contenido.appendChild(text);
}

function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('div');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow')

    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    //Radio button 10%
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = '10';
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('label');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check')

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    //Radio button 25%
    const radio25 = document.createElement('input');
    radio25.type = 'radio';
    radio25.name = 'propina';
    radio25.value = '25';
    radio25.classList.add('form-check-input');
    radio25.onclick = calcularPropina;

    const radio25Label = document.createElement('label');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('div');
    radio25Div.classList.add('form-check')

    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);

    //Radio button 50%
    const radio50 = document.createElement('input');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularPropina;

    const radio50Label = document.createElement('label');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('div');
    radio50Div.classList.add('form-check')

    radio50Div.appendChild(radio50);
    radio50Div.appendChild(radio50Label);

    
    //Agregando al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio25Div);
    divFormulario.appendChild(radio50Div);

    //Agregar al formulario
    formulario.appendChild(divFormulario);


    contenido.appendChild(formulario);
}

function calcularPropina(){
    const {pedido} = cliente;
    let subtotal = 0;
    
    //Subtotal a pagar
    pedido.forEach(el => {
        subtotal += el.precio * el.cantidad;
    });

    //Seleccionar el radio button con la propina del cliente

    const propinaSeleccionada = document.querySelector('[name="propina"]:checked').value;
    
    //calcular propina
    const propina = ((subtotal*parseInt(propinaSeleccionada)) / 100);

    //calcular el total
    const total = subtotal + propina;
    
    mostrarTotalHtml(subtotal, total, propina);
}

function mostrarTotalHtml(subtotal, total, propina){
    const divTotales = document.createElement('div');
    divTotales.classList.add('total-pagar');


    //subTotal
    const  subTotalParrafo = document.createElement('p');
    subTotalParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    subTotalParrafo.textContent = 'Subtotal Consumo: '

    const subTotalSpan  = document.createElement('span');
    subTotalSpan.classList.add('fw-normal')
    subTotalSpan.textContent = `$${subtotal}`;

    subTotalParrafo.appendChild(subTotalSpan);


    //Propinas
    const  propinaParrafo = document.createElement('p');
    propinaParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    propinaParrafo.textContent = 'Propina: '

    const propinaSpan  = document.createElement('span');
    propinaSpan.classList.add('fw-normal')
    propinaSpan.textContent = `$${propina}`;

    propinaParrafo.appendChild(propinaSpan);

    //Total
    const  totalParrafo = document.createElement('p');
    totalParrafo.classList.add('fs-3', 'fw-bold', 'mt-5');
    totalParrafo.textContent = 'Total a pagar: '

    const totalSpan  = document.createElement('span');
    totalSpan.classList.add('fw-normal')
    totalSpan.textContent = `$${total}`;

    //Eliminar el último resultado
    const totalPagarDiv = document.querySelector('.total-pagar');
    if(totalPagarDiv){
        totalPagarDiv.remove();
    }

    totalParrafo.appendChild(totalSpan);


    divTotales.appendChild(subTotalParrafo);
    divTotales.appendChild(propinaParrafo);
    divTotales.appendChild(totalParrafo);

    const formulario = document.querySelector('.formulario');
    formulario.appendChild(divTotales);


}