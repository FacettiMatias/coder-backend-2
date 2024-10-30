import { error } from 'console';
import userModel from './models/user.model.js';
import { createHash } from '../utils.js';
import { validateHash } from '../utils.js';




class userManager {
    constructor() {}

    get = async () => {
        try {
            return await userModel.find().lean();
        } catch (err) {
            return null;
        }
    }
    getOne= async(filter)=>{
        try {
            return await userModel.findOne(filter).lean()
        } catch (error) {
            console.log(error);
        }
    }
    getById = async (id)=>{
        try {
            return await userModel.findById(id).lean()
        } catch (error) {
            console.log(error);
        }
    }

    add = async (data) => {
        try {
            return await userModel.create(data);
            
        } catch (err) {
            console.log(err);  
        }
    }

    update = async (filter, update, options) => {
        try {
            return await userModel.findOneAndUpdate(filter, update, options);
        } catch (err) {
            return null;
        }
    }

    delete = async (filter, options) => {
        try {
            return await userModel.findOneAndDelete(filter, options);
        } catch (err) {
            return null;
        }
    }

    /**
     * Agregamos un método simple para autenticar
     * 
     * utiliza findOne para tratar de encontrar un documento que cumpla
     * con el criterio especificado en el filtro, si lo encuentra, lo
     * retorna, caso contrario devuelve null
     */
    authenticate = async (user, pass) => {
        try {
            const filter = { email: user };
            const foundUser = await userModel.findOne(filter).lean();

            if (foundUser && validateHash(pass,foundUser.password)){
                const { password, ...filteredUser } = foundUser;

                return filteredUser;
            }
            
        } catch (err) {
            console.log(err);
        }
    }

    register = async (data) => {
        try {
            const filter = { email: data.username };
            
            const user = await userModel.findOne(filter);

            if (!user) { // No hay usuario con ese email, procedemos a registrar
                data.password = createHash(data.password);

                await this.add(data);
                return data
                
            } else {
                return null;
            }
        } catch (err) {
            return console.log(error);
        }
    }
}


export default userManager;
