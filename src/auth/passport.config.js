import passport from "passport"
import local from "passport-local"
import userManager from "../dao/users.manager.js";
import { createHash,validateHash } from "../utils.js"

const manager = new userManager()
const localStrategy = local.Strategy;

const initAuthStrategies = ()=>{
    passport.use("login", new localStrategy(
        {passReqToCallback:true, userNameField:"username"},
        async (req,username,password,done)=>{
            try {
                const foundUser = await manager.getOne({email:username})
                if (foundUser && validateHash(password,foundUser.password)) {
                    const {password,...filteredUser} = foundUser;
                    return done (null,filteredUser)
                }
                else{
                    return done(null,false)
                }
            } catch (error) {
                return done(error,false)
            }
        }

    ))
    passport.use("register", new localStrategy(
        {passReqToCallback:true, userNameField:"username"},
        async(req,passUsername,passPassword,done)=>{
            const {username,firstname,lastname,age,password}= req.body
            try {
                let user = await manager.getOne({email:username})
                if (user) {
                    const error = "el usuario ya existe"
                    return done(error,user)
                }
                else{
                    const newUser = await manager.add({email:username,name:firstname,age,password:createHash(password),lastname})
                    return done(null,newUser)
                }
                
                
                
            } catch (error) {
                console.log(error);
            }
        }

    ))

    passport.serializeUser((user,done)=>{
        done(null,user._id)
    })
    passport.deserializeUser(async (id,done) =>{
        let user = await manager.getById(id)
        done(null,user)
    })

}
export default initAuthStrategies