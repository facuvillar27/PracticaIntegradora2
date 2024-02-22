import mongoose from 'mongoose';
import cartModel from './carts.model.js';

const userCollection = 'users';

const UserSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true
    },
    last_name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    age:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: cartModel.modelName,
        unique: true,
    },
    role:{
        type:String,
        required:true,
        default:'user'
    }
});


export const userModel = mongoose.model(userCollection,UserSchema);