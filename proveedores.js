// proveedores.js - Módulo para gestión de proveedores

import { StorageManager, STORAGE_KEYS } from './storage.js';

export class ProveedoresManager {
    constructor() {
        this.proveedores = this.cargarProveedores();
    }

    cargarProveedores() {
        return StorageManager.load(STORAGE_KEYS.PROVEEDORES) || [];
    }

    guardar() {
        return StorageManager.save(STORAGE_KEYS.PROVEEDORES, this.proveedores);
    }

    obtenerTodos() {
        return this.proveedores;
    }

    agregar(proveedor) {
        this.proveedores.push({
            nombre: proveedor.nombre,
            telefono: proveedor.telefono,
            email: proveedor.email,
            fechaVisita: proveedor.fechaVisita
        });

        this.guardar();
        return { success: true, message: 'Proveedor registrado exitosamente' };
    }

    eliminar(index) {
        if (index >= 0 && index < this.proveedores.length) {
            this.proveedores.splice(index, 1);
            this.guardar();
            return { success: true, message: 'Proveedor eliminado' };
        }
        return { success: false, message: 'Proveedor no encontrado' };
    }

    ordenarPorFecha() {
        return [...this.proveedores].sort((a, b) =>
            new Date(a.fechaVisita) - new Date(b.fechaVisita)
        );
    }

    obtenerProveedoresHoy() {
        const hoy = new Date().toDateString();
        return this.proveedores.filter(p =>
            new Date(p.fechaVisita).toDateString() === hoy
        );
    }

    esVisitaHoy(fechaVisita) {
        const hoy = new Date();
        const fecha = new Date(fechaVisita);
        hoy.setHours(0, 0, 0, 0);
        fecha.setHours(0, 0, 0, 0);
        return fecha.getTime() === hoy.getTime();
    }
}