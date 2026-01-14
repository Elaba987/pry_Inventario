// productos.js - Módulo para gestión de productos

import { StorageManager, STORAGE_KEYS } from './storage.js';

export class ProductosManager {
    constructor() {
        this.productos = this.cargarProductos();
    }

    cargarProductos() {
        return StorageManager.load(STORAGE_KEYS.PRODUCTOS) || [];
    }

    guardar() {
        return StorageManager.save(STORAGE_KEYS.PRODUCTOS, this.productos);
    }

    obtenerTodos() {
        return this.productos;
    }

    obtenerPorClave(clave) {
        return this.productos.find(p => p.clave === parseInt(clave));
    }

    existeClave(clave) {
        return this.productos.some(p => p.clave === parseInt(clave));
    }

    agregar(producto) {
        if (this.existeClave(producto.clave)) {
            return { success: false, message: 'Clave en uso' };
        }

        this.productos.push({
            clave: parseInt(producto.clave),
            nombre: producto.nombre,
            precio: parseFloat(producto.precio),
            stock: parseInt(producto.stock)
        });

        this.guardar();
        return { success: true, message: 'Producto registrado exitosamente' };
    }

    actualizar(clave, datos) {
        const index = this.productos.findIndex(p => p.clave === parseInt(clave));
        if (index === -1) {
            return { success: false, message: 'Producto no encontrado' };
        }

        this.productos[index] = { ...this.productos[index], ...datos };
        this.guardar();
        return { success: true, message: 'Producto actualizado' };
    }

    actualizarStock(clave, nuevoStock) {
        return this.actualizar(clave, { stock: parseInt(nuevoStock) });
    }

    eliminar(clave) {
        const index = this.productos.findIndex(p => p.clave === parseInt(clave));
        if (index === -1) {
            return { success: false, message: 'Producto no encontrado' };
        }

        this.productos.splice(index, 1);
        this.guardar();
        return { success: true, message: 'Producto eliminado' };
    }

    buscar(termino) {
        const busqueda = termino.toLowerCase();
        return this.productos.filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            p.clave.toString().includes(busqueda)
        );
    }

    ordenar(criterio) {
        const productosOrdenados = [...this.productos];
        
        switch (criterio) {
            case 'mayor':
                return productosOrdenados.sort((a, b) => b.stock - a.stock);
            case 'menor':
                return productosOrdenados.sort((a, b) => a.stock - b.stock);
            default:
                return productosOrdenados;
        }
    }

    obtenerBajoStock(umbral = 5) {
        return this.productos.filter(p => p.stock < umbral);
    }

    reducirStock(clave, cantidad) {
        const producto = this.obtenerPorClave(clave);
        if (!producto) {
            return { success: false, message: 'Producto no encontrado' };
        }

        if (producto.stock < cantidad) {
            return { success: false, message: 'Stock insuficiente' };
        }

        producto.stock -= cantidad;
        this.guardar();
        return { success: true, producto };
    }
}