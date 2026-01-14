// app.js - Archivo principal de la aplicación

import { ProductosManager } from './modules/productos.js';
import { VentasManager } from './modules/ventas.js';
import { ProveedoresManager } from './modules/proveedores.js';
import { ReportesManager } from './modules/reportes.js';
import { DashboardManager } from './modules/dashboard.js';
import { UIManager } from './modules/ui.js';

class TiendaApp {
    constructor() {
        // Inicializar gestores
        this.productosManager = new ProductosManager();
        this.ventasManager = new VentasManager();
        this.proveedoresManager = new ProveedoresManager();
        this.reportesManager = new ReportesManager(this.ventasManager);
        this.dashboardManager = new DashboardManager(
            this.productosManager,
            this.proveedoresManager,
            this.ventasManager
        );
        this.uiManager = new UIManager();

        // Variable para producto seleccionado en ventas
        this.productoSeleccionado = null;

        // Inicializar la aplicación
        this.init();
    }

    init() {
        this.renderizarMenu();
        this.inicializarEventListeners();
        this.actualizarDashboard();
        this.actualizarVistaProductos();
        this.actualizarVistaProveedores();
    }

    // Renderizar menú de navegación
    renderizarMenu() {
        const menuContainer = document.getElementById('mainMenu');
        this.uiManager.renderizarMenu(menuContainer);

        // Event listeners para navegación
        menuContainer.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem) {
                const seccion = menuItem.dataset.section;
                this.uiManager.mostrarSeccion(seccion);

                // Actualizar vistas según la sección
                if (seccion === 'dashboard') {
                    this.actualizarDashboard();
                } else if (seccion === 'reportes') {
                    this.generarReporte();
                }
            }
        });

        // Event listeners para stats cards
        document.getElementById('statsGrid').addEventListener('click', (e) => {
            const statCard = e.target.closest('.stat-card');
            if (statCard) {
                const seccion = statCard.dataset.section;
                if (seccion) {
                    this.uiManager.mostrarSeccion(seccion);
                }
            }
        });
    }

    // Inicializar todos los event listeners
    inicializarEventListeners() {
        this.inicializarProductos();
        this.inicializarVentas();
        this.inicializarProveedores();
        this.inicializarReportes();
    }

    // === PRODUCTOS ===
    inicializarProductos() {
        // Formulario de registro
        const formProducto = document.getElementById('formProducto');
        formProducto.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarProducto();
        });

        // Búsqueda
        const buscarProducto = document.getElementById('buscarProducto');
        buscarProducto.addEventListener('input', () => {
            this.actualizarVistaProductos();
        });

        // Ordenamiento
        const ordenarStock = document.getElementById('ordenarStock');
        ordenarStock.addEventListener('change', () => {
            this.actualizarVistaProductos();
        });

        // Event delegation para botones de acciones
        const tablaProductos = document.getElementById('tablaProductos');
        tablaProductos.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const accion = btn.dataset.accion;
            const clave = parseInt(btn.dataset.clave);

            if (accion === 'editar') {
                this.editarProducto(clave);
            } else if (accion === 'eliminar') {
                this.eliminarProducto(clave);
            }
        });
    }

    registrarProducto() {
        const producto = {
            clave: document.getElementById('clave').value,
            nombre: document.getElementById('nombre').value,
            precio: document.getElementById('precio').value,
            stock: document.getElementById('stock').value
        };

        const resultado = this.productosManager.agregar(producto);

        if (resultado.success) {
            this.uiManager.mostrarMensaje('mensajeProducto', `✓ ${resultado.message}`, 'success');
            this.uiManager.limpiarFormulario(document.getElementById('formProducto'));
            this.actualizarVistaProductos();
            this.actualizarSelectVentas();
            this.actualizarDashboard();
        } else {
            this.uiManager.mostrarMensaje('mensajeProducto', `⚠️ ${resultado.message}`, 'error');
        }
    }

    editarProducto(clave) {
        const producto = this.productosManager.obtenerPorClave(clave);
        if (!producto) return;

        const nuevoStock = this.uiManager.prompt(`Nuevo stock para ${producto.nombre}:`, producto.stock);
        if (nuevoStock !== null) {
            this.productosManager.actualizarStock(clave, nuevoStock);
            this.actualizarVistaProductos();
            this.actualizarDashboard();
        }
    }

    eliminarProducto(clave) {
        if (this.uiManager.confirmar('¿Eliminar este producto?')) {
            this.productosManager.eliminar(clave);
            this.actualizarVistaProductos();
            this.actualizarDashboard();
        }
    }

    actualizarVistaProductos() {
        const busqueda = document.getElementById('buscarProducto').value;
        const ordenar = document.getElementById('ordenarStock').value;

        let productos = this.productosManager.buscar(busqueda);
        productos = ordenar ? this.productosManager.ordenar(ordenar) : productos;

        const tbody = document.querySelector('#tablaProductos tbody');
        this.uiManager.renderizarTablaProductos(productos, tbody);
    }

    // === VENTAS ===
    inicializarVentas() {
        // Input de clave
        const claveVenta = document.getElementById('claveVenta');
        claveVenta.addEventListener('input', () => {
            this.buscarProductoPorClave();
        });

        // Select de productos
        const selectProducto = document.getElementById('selectProductoVenta');
        selectProducto.addEventListener('change', () => {
            this.seleccionarProductoPorNombre();
        });

        // Input de cantidad
        const cantidadVenta = document.getElementById('cantidadVenta');
        cantidadVenta.addEventListener('input', () => {
            this.actualizarInfoStockVenta();
        });

        // Botón agregar a venta
        const btnAgregar = document.getElementById('btnAgregarVenta');
        btnAgregar.addEventListener('click', () => {
            this.agregarAVenta();
        });

        // Botón finalizar venta
        const btnFinalizar = document.getElementById('btnFinalizarVenta');
        btnFinalizar.addEventListener('click', () => {
            this.finalizarVenta();
        });

        // Event delegation para quitar items
        const listaVenta = document.getElementById('listaVenta');
        listaVenta.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn && btn.dataset.accion === 'quitar-item') {
                const index = parseInt(btn.dataset.index);
                this.quitarDeVenta(index);
            }
        });

        // Actualizar select inicial
        this.actualizarSelectVentas();
    }

    actualizarSelectVentas() {
        const select = document.getElementById('selectProductoVenta');
        const productos = this.productosManager.obtenerTodos();
        this.uiManager.actualizarSelectProductos(productos, select);
    }

    buscarProductoPorClave() {
        const clave = document.getElementById('claveVenta').value;
        const producto = this.productosManager.obtenerPorClave(clave);

        if (producto) {
            this.productoSeleccionado = producto;
            document.getElementById('selectProductoVenta').value = '';
            this.mostrarInfoProductoVenta();
        } else {
            this.productoSeleccionado = null;
            document.getElementById('infoProductoVenta').innerHTML = '';
        }
    }

    seleccionarProductoPorNombre() {
        const select = document.getElementById('selectProductoVenta');
        const index = select.value;

        if (index !== '') {
            const productos = this.productosManager.obtenerTodos();
            this.productoSeleccionado = productos[parseInt(index)];
            document.getElementById('claveVenta').value = this.productoSeleccionado.clave;
            this.mostrarInfoProductoVenta();
        } else {
            this.productoSeleccionado = null;
            document.getElementById('infoProductoVenta').innerHTML = '';
        }
    }

    mostrarInfoProductoVenta() {
        if (!this.productoSeleccionado) return;

        const stockEnCarrito = this.ventasManager.obtenerStockEnCarrito(this.productoSeleccionado.clave);
        const contenedor = document.getElementById('infoProductoVenta');

        this.uiManager.mostrarInfoProducto(this.productoSeleccionado, stockEnCarrito, contenedor);
    }

    actualizarInfoStockVenta() {
        if (this.productoSeleccionado) {
            this.mostrarInfoProductoVenta();
        }
    }

    agregarAVenta() {
        if (!this.productoSeleccionado) {
            this.uiManager.alerta('Seleccione un producto');
            return;
        }

        const cantidad = parseInt(document.getElementById('cantidadVenta').value);
        if (!cantidad || cantidad < 1) {
            this.uiManager.alerta('Ingrese una cantidad válida');
            return;
        }

        const stockEnCarrito = this.ventasManager.obtenerStockEnCarrito(this.productoSeleccionado.clave);
        const stockDisponible = this.productoSeleccionado.stock - stockEnCarrito;

        if (cantidad > stockDisponible) {
            this.uiManager.alerta(`Stock insuficiente. Solo quedan ${stockDisponible} unidades disponibles.`);
            return;
        }

        this.ventasManager.agregarItemVenta(this.productoSeleccionado, cantidad);

        // Limpiar campos
        document.getElementById('cantidadVenta').value = '';
        document.getElementById('claveVenta').value = '';
        document.getElementById('selectProductoVenta').value = '';
        this.productoSeleccionado = null;
        document.getElementById('infoProductoVenta').innerHTML = '';

        this.actualizarVistaVentaActual();
    }

    quitarDeVenta(index) {
        this.ventasManager.quitarItemVenta(index);
        this.actualizarVistaVentaActual();
    }

    actualizarVistaVentaActual() {
        const items = this.ventasManager.obtenerVentaActual();
        const contenedor = document.getElementById('listaVenta');
        const totalElemento = document.getElementById('totalVenta');

        this.uiManager.renderizarListaVenta(items, contenedor);
        this.uiManager.actualizarTotalVenta(this.ventasManager.calcularTotal(), totalElemento);
    }

    finalizarVenta() {
        const resultado = this.ventasManager.finalizarVenta();

        if (!resultado.success) {
            this.uiManager.alerta(resultado.message);
            return;
        }

        // Reducir stock de productos
        resultado.venta.items.forEach(item => {
            this.productosManager.reducirStock(item.producto.clave, item.cantidad);
        });

        // Descargar ticket
        this.ventasManager.descargarTicket(resultado.venta, resultado.venta.numeroTicket);

        this.uiManager.alerta(`Venta realizada exitosamente. Total: $${resultado.venta.total.toFixed(2)}`);

        this.actualizarVistaVentaActual();
        this.actualizarSelectVentas();
        this.actualizarDashboard();
    }

    // === PROVEEDORES ===
    inicializarProveedores() {
        const formProveedor = document.getElementById('formProveedor');
        formProveedor.addEventListener('submit', (e) => {
            e.preventDefault();
            this.registrarProveedor();
        });

        // Event delegation para eliminar
        const tablaProveedores = document.getElementById('tablaProveedores');
        tablaProveedores.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (btn && btn.dataset.accion === 'eliminar-proveedor') {
                const index = parseInt(btn.dataset.index);
                this.eliminarProveedor(index);
            }
        });
    }

    registrarProveedor() {
        const proveedor = {
            nombre: document.getElementById('nombreProveedor').value,
            telefono: document.getElementById('telefonoProveedor').value,
            email: document.getElementById('emailProveedor').value,
            fechaVisita: document.getElementById('fechaVisita').value
        };

        const resultado = this.proveedoresManager.agregar(proveedor);

        if (resultado.success) {
            this.uiManager.alerta(resultado.message);
            this.uiManager.limpiarFormulario(document.getElementById('formProveedor'));
            this.actualizarVistaProveedores();
            this.actualizarDashboard();
        }
    }

    eliminarProveedor(index) {
        if (this.uiManager.confirmar('¿Eliminar este proveedor?')) {
            this.proveedoresManager.eliminar(index);
            this.actualizarVistaProveedores();
            this.actualizarDashboard();
        }
    }

    actualizarVistaProveedores() {
        const proveedores = this.proveedoresManager.obtenerTodos();
        const tbody = document.querySelector('#tablaProveedores tbody');
        this.uiManager.renderizarTablaProveedores(proveedores, tbody, this.proveedoresManager);
    }

    // === REPORTES ===
    inicializarReportes() {
        const tipoReporte = document.getElementById('tipoReporte');
        tipoReporte.addEventListener('change', () => {
            this.generarReporte();
        });
    }

    generarReporte() {
        const tipo = document.getElementById('tipoReporte').value;
        const reporte = this.reportesManager.generarReporte(tipo);

        if (reporte) {
            const contenedor = document.getElementById('contenidoReporte');
            const todasVentas = this.ventasManager.obtenerTodas();
            this.uiManager.renderizarReporte(reporte, contenedor, todasVentas);

            // Event listener para descargar tickets
            contenedor.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (btn && btn.dataset.accion === 'descargar-ticket') {
                    const index = parseInt(btn.dataset.index);
                    const venta = todasVentas[index];
                    this.ventasManager.descargarTicket(venta, index + 1);
                }
            });
        }
    }

    // === DASHBOARD ===
    actualizarDashboard() {
        const contenedor = document.getElementById('statsGrid');
        this.dashboardManager.renderizar(contenedor);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new TiendaApp();
});
