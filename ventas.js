// ventas.js - Módulo para gestión de ventas

import { StorageManager, STORAGE_KEYS } from './storage.js';

export class VentasManager {
    constructor() {
        this.ventas = this.cargarVentas();
        this.ventaActual = [];
    }

    cargarVentas() {
        return StorageManager.load(STORAGE_KEYS.VENTAS) || [];
    }

    guardar() {
        return StorageManager.save(STORAGE_KEYS.VENTAS, this.ventas);
    }

    obtenerTodas() {
        return this.ventas;
    }

    obtenerVentaActual() {
        return this.ventaActual;
    }

    agregarItemVenta(producto, cantidad) {
        const item = {
            producto: { ...producto },
            cantidad: parseInt(cantidad),
            subtotal: producto.precio * cantidad
        };

        this.ventaActual.push(item);
        return { success: true, item };
    }

    quitarItemVenta(index) {
        if (index >= 0 && index < this.ventaActual.length) {
            this.ventaActual.splice(index, 1);
            return { success: true };
        }
        return { success: false, message: 'Índice inválido' };
    }

    calcularTotal() {
        return this.ventaActual.reduce((sum, item) => sum + item.subtotal, 0);
    }

    obtenerStockEnCarrito(clave) {
        return this.ventaActual
            .filter(item => item.producto.clave === clave)
            .reduce((sum, item) => sum + item.cantidad, 0);
    }

    finalizarVenta() {
        if (this.ventaActual.length === 0) {
            return { success: false, message: 'No hay productos en la venta' };
        }

        const venta = {
            fecha: new Date().toISOString(),
            items: [...this.ventaActual],
            total: this.calcularTotal()
        };

        this.ventas.push(venta);
        this.guardar();

        const ventaFinalizada = { ...venta, numeroTicket: this.ventas.length };
        this.ventaActual = [];

        return { success: true, venta: ventaFinalizada };
    }

    limpiarVentaActual() {
        this.ventaActual = [];
    }

    obtenerVentasPorFecha(fecha) {
        return this.ventas.filter(v =>
            new Date(v.fecha).toDateString() === fecha.toDateString()
        );
    }

    obtenerVentasPorRango(fechaInicio, fechaFin) {
        return this.ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta >= fechaInicio && fechaVenta <= fechaFin;
        });
    }

    generarTicket(venta, numeroTicket) {
        const fecha = new Date(venta.fecha);
        const contenido = `======= TICKET DE VENTA =======
Fecha: ${fecha.toLocaleDateString()} ${fecha.toLocaleTimeString()}
Ticket #${numeroTicket}

PRODUCTOS:
${venta.items.map(item =>
`${item.producto.nombre}
  Cantidad: ${item.cantidad} x $${item.producto.precio.toFixed(2)} = $${item.subtotal.toFixed(2)}`
).join('\n')}

================================
TOTAL: $${venta.total.toFixed(2)}
================================

¡Gracias por su compra!
`;
        return contenido;
    }

    descargarTicket(venta, numeroTicket) {
        const contenido = this.generarTicket(venta, numeroTicket);
        const blob = new Blob([contenido], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const fecha = new Date(venta.fecha);
        
        a.href = url;
        a.download = `TICKET_${numeroTicket}_${fecha.getDate()}-${fecha.getMonth() + 1}-${fecha.getFullYear()}_${fecha.getHours()}-${fecha.getMinutes()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}