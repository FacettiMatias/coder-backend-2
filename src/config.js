import * as url from 'url';


const config = {
    PORT: 5050,
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
 
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/uploads` },
    // Constante con la ruta de conexión a la base de datos, en este caso en servidor MongoDB local
    MONGODB_URI: 'mongodb://127.0.0.1:27017/coder70190',
    SECRET:"matisecret"
};


// Array de usuarios de prueba
export const users = [
    { id: 1, firstName: 'Juan', lastName: 'Perez' },
    { id: 2, firstName: 'Carlos', lastName: 'Perren' },
    { id: 3, firstName: 'Luis', lastName: 'Gonzalez' }
];


export default config;
