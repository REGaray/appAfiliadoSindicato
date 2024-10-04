export interface ElectronAPI {
    sendMessage: (channel: string, data: any) => void;
    onMessage: (channel: string, callback: (...args: any[]) => void) => void;

    crearAfiliado: (afiliado: any) => void;
    onCrearAfiliado: (callback: (data: any) => void) => void;

    listarAfiliado: (afiliado: any) => any;
    onListarAfiliado: (callback: (data: any) => void) => any;

    actualizarAfiliado: (afiliado: any) => void;
    onActualizarAfiliado: (callback: (data: any) => void) => void;

    darBajaAfiliado: (afiliado: any) => any;
    onDarBajaAfiliado: (callback: (data: any) => void) => void;
}

declare global {
    interface Window {
        electronApi: ElectronAPI;
    }
}

export {};