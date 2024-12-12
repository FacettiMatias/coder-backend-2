import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import config from "./config.js"

export const createHash = password => bcrypt.hashSync(password,bcrypt.genSaltSync(10))

export const validateHash = (passwordToVerify,storedHash) =>bcrypt.compareSync(passwordToVerify,storedHash)
export const createToken = (payload,duration) => jwt.sign(payload,config.SECRET,{expressIn:duration})

export const validateToken = (req,res,next) =>{
    const headerToken = req.headers.authorization ? req.headers.authorization.split(' ')[1] : undefined;
    const cookieToken = req.signedCookies && req.signedCookies[`${config.appName}_cookie`] ? req.cookies[`${config.appName}_cookie`] : undefined;
    const queryToken = req.query.access_token ? req.query.access_token : undefined;
    const receivedToken = headerToken || cookieToken || queryToken;
    if (!receivedToken) return res.status(401).send({ error: 'Se requiere token', data: [] });

    jwt.verify(receivedToken, config.SECRET, (err, payload) => {
        if (err) return res.status(403).send({ error: 'Token no válido', data: [] });
        
        req.user = payload;
        next();

    });

}
export const handlePolicies = (policies) =>{
    const role = req.user.role
    if(!policies.includes(role)) return res.status(403).send("usted no cuenta con la autorizacion")
        next()
}

