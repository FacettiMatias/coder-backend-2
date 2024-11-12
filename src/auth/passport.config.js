import passport from "passport"
import local from "passport-local"
import userManager from "../dao/users.manager.js";
import { createHash,validateHash } from "../utils.js"
import GithubStrategy from "passport-github2"
import config from "../config.js";

const manager = new userManager()
const localStrategy = local.Strategy;

const initAuthStrategies = ()=>{
    passport.use("login", new localStrategy(
        {passReqToCallback:true, userNameField:"username"},
        async (req,username,password,done)=>{
            try {
                const foundUser = await manager.getOne({email:username})
                if (foundUser && validateHash(password,foundUser.password)) {
                    
                    const {password, ...filteredUser} = foundUser;
                    
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
    passport.use("githubLogin",new GithubStrategy(
        {
            clientID:config.githubClientId,
            clientSecret:config.githubClientSecret,
            callbackURL:config.githubCallbackURL
        },
        async(req,accessToken,refreshToken,profile,done,)=>{
            try {
                console.log(profile);
                const email = profile._json.email ||  null
                console.log(email);
                if (email) {
                    const foundUser = await manager.getOne(email)
                    if (!foundUser) {
                        const user ={
                            email:email,
                            firstname:profile._json.name,
                            lastname:" ",
                            password:"none",
                            age:""
                        }
                        const process = await manager.add(user)
                        return done(null,process)
                    }
                    else{
                        return foundUser;
                    }
                }
            } catch (error) {
                return done(new Error ("faltan datos del login"),false)
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