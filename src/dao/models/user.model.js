import mongoose from 'mongoose';

// Esta línea nos evitará problemas de nombres si Mongoose crea alguna colección no existente
mongoose.pluralize(null);

const collection = 'users';


const schema = new mongoose.Schema({
    name: { type: String, required: true },
    lastname:{type: String, required: true},
    age:{type: Number, required: true},
    password:{type: String, required:true},
    
    email: { type: String, required: true, unique: true },
    role:{type: String,enum:["admin","premium","user"] , default:"user"}
});

const model = mongoose.model(collection, schema);


export default model;
