// reportes.js - Módulo para generación de reportes

export class ReportesManager {
    constructor(ventasManager) {
        this.ventasManager = ventasManager;
    }

    generarReporteDiario() {
        const ahora = new Date();
        const ventasFiltradas = this.ventasManager.obtenerVentasPorFecha(ahora);
        
        return {
            titulo: 'Ventas del Día',
            ventas: ventasFiltradas,
            cantidadVentas: ventasFiltradas.length,
            totalVentas: this.calcularTotal(ventasFiltradas)
        };
    }

    generarReporteSemanal() {
        const ahora = new Date();
        const semanaAtras = new Date(ahora);
        semanaAtras.setDate(ahora.getDate() - 7);
        
        const ventasFiltradas = this.ventasManager.obtenerVentasPorRango(semanaAtras, ahora);
        
        return {
            titulo: 'Ventas de la Semana',
            ventas: ventasFiltradas,
            cantidadVentas: ventasFiltradas.length,
            totalVentas: this.calcularTotal(ventasFiltradas)
        };
    }

    generarReporteMensual() {
        const ahora = new Date();
        const ventas = this.ventasManager.obtenerTodas();
        
        const ventasFiltradas = ventas.filter(v => {
            const fechaVenta = new Date(v.fecha);
            return fechaVenta.getMonth() === ahora.getMonth() &&
                   fechaVenta.getFullYear() === ahora.getFullYear();
        });
        
        return {
            titulo: 'Ventas del Mes',
            ventas: ventasFiltradas,
            cantidadVentas: ventasFiltradas.length,
            totalVentas: this.calcularTotal(ventasFiltradas)
        };
    }

    calcularTotal(ventas) {
        return ventas.reduce((sum, v) => sum + v.total, 0);
    }

    generarReporte(tipo) {
        switch (tipo) {
            case 'diario':
                return this.generarReporteDiario();
            case 'semanal':
                return this.generarReporteSemanal();
            case 'mensual':
                return this.generarReporteMensual();
            default:
                return null;
        }
    }
}