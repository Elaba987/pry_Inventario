// dashboard.js - Módulo para el panel de control

export class DashboardManager {
    constructor(productosManager, proveedoresManager, ventasManager) {
        this.productosManager = productosManager;
        this.proveedoresManager = proveedoresManager;
        this.ventasManager = ventasManager;
    }

    obtenerEstadisticas() {
        return {
            ventasHoy: this.calcularVentasHoy(),
            proveedoresHoy: this.contarProveedoresHoy(),
            productosBajoStock: this.contarProductosBajoStock()
        };
    }

    calcularVentasHoy() {
        const hoy = new Date();
        const ventasHoy = this.ventasManager.obtenerVentasPorFecha(hoy);
        return ventasHoy.reduce((sum, v) => sum + v.total, 0);
    }

    contarProveedoresHoy() {
        return this.proveedoresManager.obtenerProveedoresHoy().length;
    }

    contarProductosBajoStock(umbral = 5) {
        return this.productosManager.obtenerBajoStock(umbral).length;
    }

    renderizar(contenedor) {
        const stats = this.obtenerEstadisticas();
        
        const html = `
            <div class="stat-card" data-section="reportes">
                <h4>Ventas Hoy</h4>
                <div class="stat-value">$${stats.ventasHoy.toFixed(2)}</div>
            </div>
            <div class="stat-card" data-section="proveedores">
                <h4>Proveedores Hoy</h4>
                <div class="stat-value">${stats.proveedoresHoy}</div>
            </div>
            <div class="stat-card" data-section="productos">
                <h4>Productos Bajo Stock</h4>
                <div class="stat-value">${stats.productosBajoStock}</div>
            </div>
        `;

        contenedor.innerHTML = html;
    }
}