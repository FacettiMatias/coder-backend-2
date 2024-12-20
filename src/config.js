import * as url from 'url';



const config = {
    PORT: 5050,
    DIRNAME: url.fileURLToPath(new URL('.', import.meta.url)),
    /**
     * Función tipo getter
     * Configuramos dinámicamente UPLOAD_DIR() de acuerdo al valor de DIRNAME
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
     */
    get UPLOAD_DIR() { return `${this.DIRNAME}/public/uploads` },
    // Constante con la ruta de conexión a la base de datos, en este caso en servidor MongoDB local
    MONGODB_URI: 'mongodb+srv://facettimatias:mati123@cluster.zn61n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster',
    // MONGODB_URI: 'mongodb+srv://coder70190:coder2024@cluster0.4qaobt3.mongodb.net/coder70190',
    SECRET: process.SECRET, // lo utilizamos para firmar cookies, sessions, etc
    githubClientId: process.env.githubClientId,
    githubAppId: process.env.githubAppId,
    githubClientSecret:process.env.githubClientSecret,
    githubCallbackURL:"http://localhost:5050/api/users/githubcallback",
    appName:process.env.appName,
    gmailUser:process.env.gmailUser,
    gmailPassword:process.env.gmailPassword
};


export default config;
