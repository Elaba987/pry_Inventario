// ui.js - Módulo para manejo de la interfaz de usuario

export class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
    }

    // Navegación
    mostrarSeccion(seccionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar la sección seleccionada
        const seccion = document.getElementById(seccionId);
        if (seccion) {
            seccion.classList.remove('hidden');
            this.currentSection = seccionId;
        }

        // Actualizar menú activo
        this.actualizarMenuActivo(seccionId);
    }

    actualizarMenuActivo(seccionId) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === seccionId) {
                item.classList.add('active');
            }
        });
    }

    // Mensajes y alertas
    mostrarMensaje(contenedorId, mensaje, tipo = 'success') {
        const contenedor = document.getElementById(contenedorId);
        if (!contenedor) return;

        const clase = tipo === 'success' ? 'alert-success' : 'alert-danger';
        contenedor.innerHTML = `<div class="alert ${clase}">${mensaje}</div>`;

        setTimeout(() => {
            contenedor.innerHTML = '';
        }, 3000);
    }

    confirmar(mensaje) {
        return window.confirm(mensaje);
    }

    prompt(mensaje, valorDefault = '') {
        return window.prompt(mensaje, valorDefault);
    }

    alerta(mensaje) {
        window.alert(mensaje);
    }

    // Renderizado de menú
    renderizarMenu(contenedor) {
        const menuItems = [
            { id: 'dashboard', icono: '📊', texto: 'Dashboard' },
            { id: 'productos', icono: '📦', texto: 'Productos' },
            { id: 'ventas', icono: '💰', texto: 'Realizar Venta' },
            { id: 'proveedores', icono: '🚚', texto: 'Proveedores' },
            { id: 'reportes', icono: '📈', texto: 'Reportes' }
        ];

        const html = menuItems.map(item => `
            <div class="menu-item ${item.id === 'dashboard' ? 'active' : ''}" data-section="${item.id}">
                ${item.icono} ${item.texto}
            </div>
        `).join('');

        contenedor.innerHTML = html;
    }

    // Renderizado de productos
    renderizarTablaProductos(productos, tbody) {
        if (!tbody) return;

        tbody.innerHTML = productos.map((producto, index) => `
            <tr>
                <td>${producto.clave}</td>
                <td>${producto.nombre}</td>
                <td>$${producto.precio.toFixed(2)}</td>
                <td class="${producto.stock < 5 ? 'low-stock' : ''}">${producto.stock}</td>
                <td>
                    <button class="btn btn-primary" data-accion="editar" data-clave="${producto.clave}">Editar</button>
                    <button class="btn btn-danger" data-accion="eliminar" data-clave="${producto.clave}">Eliminar</button>
                </td>
            </tr>
        `).join('');
    }

    // Renderizado de select de productos
    actualizarSelectProductos(productos, select) {
        if (!select) return;

        const opciones = productos.map((producto, index) => 
            `<option value="${index}">${producto.nombre} - Stock: ${producto.stock}</option>`
        ).join('');

        select.innerHTML = '<option value="">-- Seleccione --</option>' + opciones;
    }

    // Renderizado de información del producto en venta
    mostrarInfoProducto(producto, stockEnCarrito, contenedor) {
        if (!contenedor) return;

        const stockDisponible = producto.stock - stockEnCarrito;

        contenedor.innerHTML = `
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <strong>${producto.nombre}</strong><br>
                Precio: $${producto.precio.toFixed(2)}<br>
                Stock disponible: <span class="${stockDisponible < 5 ? 'low-stock' : ''}">${stockDisponible}</span>
                ${stockEnCarrito > 0 ? `<br><small>(${stockEnCarrito} ya en carrito)</small>` : ''}
            </div>
        `;
    }

    // Renderizado de lista de venta actual
    renderizarListaVenta(items, contenedor) {
        if (!contenedor) return;

        if (items.length === 0) {
            contenedor.innerHTML = '';
            return;
        }

        const html = '<h4>Productos en la venta:</h4>' + items.map((item, index) => `
            <div class="venta-item">
                <div>
                    <strong>${item.producto.nombre}</strong><br>
                    Cantidad: ${item.cantidad} x $${item.producto.precio.toFixed(2)}
                </div>
                <div>
                    <strong>$${item.subtotal.toFixed(2)}</strong>
                    <button class="btn btn-danger" data-accion="quitar-item" data-index="${index}">X</button>
                </div>
            </div>
        `).join('');

        contenedor.innerHTML = html;
    }

    // Actualizar total de venta
    actualizarTotalVenta(total, elemento) {
        if (elemento) {
            elemento.textContent = total.toFixed(2);
        }
    }

    // Renderizado de proveedores
    renderizarTablaProveedores(proveedores, tbody, proveedoresManager) {
        if (!tbody) return;

        const proveedoresOrdenados = proveedores.sort((a, b) => 
            new Date(a.fechaVisita) - new Date(b.fechaVisita)
        );

        tbody.innerHTML = proveedoresOrdenados.map((proveedor, index) => {
            const esHoy = proveedoresManager.esVisitaHoy(proveedor.fechaVisita);
            const fecha = new Date(proveedor.fechaVisita);
            const estiloFecha = esHoy ? 'font-weight: bold; color: #667eea;' : '';

            return `
                <tr>
                    <td>${proveedor.nombre}</td>
                    <td>${proveedor.telefono}</td>
                    <td>${proveedor.email}</td>
                    <td style="${estiloFecha}">${fecha.toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-danger" data-accion="eliminar-proveedor" data-index="${index}">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Renderizado de reportes
    renderizarReporte(reporte, contenedor, ventas) {
        if (!contenedor) return;

        const html = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h4>Total Ventas</h4>
                    <div class="stat-value">${reporte.cantidadVentas}</div>
                </div>
                <div class="stat-card">
                    <h4>Ingresos Totales</h4>
                    <div class="stat-value">$${reporte.totalVentas.toFixed(2)}</div>
                </div>
            </div>
            <h4>${reporte.titulo}</h4>
            <table>
                <thead>
                    <tr>
                        <th>Ticket</th>
                        <th>Fecha</th>
                        <th>Productos</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${reporte.ventas.map((venta) => {
                        const numeroTicket = ventas.indexOf(venta) + 1;
                        return `
                            <tr>
                                <td>#${numeroTicket}</td>
                                <td>${new Date(venta.fecha).toLocaleString()}</td>
                                <td>${venta.items.length} producto(s)</td>
                                <td>$${venta.total.toFixed(2)}</td>
                                <td>
                                    <button class="btn btn-secondary" data-accion="descargar-ticket" data-index="${ventas.indexOf(venta)}">
                                        Descargar Ticket
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        contenedor.innerHTML = html;
    }

    // Limpiar formulario
    limpiarFormulario(formulario) {
        if (formulario) {
            formulario.reset();
        }
    }
}