// storage.js - Módulo para manejo de datos en localStorage

export const StorageManager = {
    // Guardar datos
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error al guardar datos:', error);
            return false;
        }
    },

    // Cargar datos
    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al cargar datos:', error);
            return null;
        }
    },

    // Eliminar datos
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error al eliminar datos:', error);
            return false;
        }
    },

    // Limpiar todo
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error al limpiar datos:', error);
            return false;
        }
    }
};

// Claves para localStorage
export const STORAGE_KEYS = {
    PRODUCTOS: 'productos',
    PROVEEDORES: 'proveedores',
    VENTAS: 'ventas'
};