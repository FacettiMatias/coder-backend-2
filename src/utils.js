import bcrypt from "bcrypt"

export const createHash = password => bcrypt.hashSync(password,bcrypt.genSaltSync(10))

export const validateHash = (passwordToVerify,storedHash) =>bcrypt.compareSync(passwordToVerify,storedHash)

