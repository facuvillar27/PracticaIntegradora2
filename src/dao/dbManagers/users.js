import { userModel } from "../models/users.model.js"
import  cartModel  from "../models/carts.model.js"

export default class Users {
    constructor() {
        console.log(`Working users with Database persistence in mongodb`)
    }
    getAll = async () => {
        let users = await userModel.find().populate('cart');
        return users.map(user=>user.toObject())
    }
    saveUser = async (user) => {
        if (!user.cart) {
            const newCart = new cartModel({ products: [] });
            const savedCart = await newCart.save();
            user.cart = savedCart._id;
        }
        let result = await userModel.create(user);
        return result;
    }
    getBy = async(params) => {
        let result = await userModel.findOne(params).populate({
            path: 'cart',
            populate: { path: 'products.product' } // Pobla los productos dentro del carrito
        }).lean();
        return result;
    };
    
    updateUser = async(id,user) =>{
        delete user._id;
        let result = await userModel.updateOne({_id:id},{$set:user})
        return result;
    }
}