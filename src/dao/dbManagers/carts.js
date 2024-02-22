import cartModel from "../models/carts.model.js";

export default class Carts{
    constructor(){
        console.log("Working carts with database in mongodb")
    }
    getAll = async () =>{
        let carts = await cartModel.find().lean().populate('products');
        return carts;
    }
    getById = async(id) =>{
        let cart = await cartModel.findOne({_id:id}).populate('products');
        return cart;
    }
    saveCart = async cart =>{
        let result = await cartModel.create(cart);
        return result;
    }

    deleteCart = async id => {
        let result = await cartModel.findByIdAndDelete(id);
        return result;
    };

    updateCart = async (id, update, options) => {
        try {
            let result = await cartModel.updateOne({ _id: id }, update, options);
            return result;
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error; // Re-lanza el error para que pueda ser manejado por el controlador de rutas
        }
    };

    emptyCart = async id => {
        try {
            let result = await cartModel.updateOne({ _id: id }, { $set: { products: [] }});
            return result;
        } catch (error) {
            console.error('Error emptying cart:', error);
            throw error; // Re-lanza el error para que pueda ser manejado por el controlador de rutas
        }
    };

    
}