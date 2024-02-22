import {Router} from 'express';
import Users from '../dao/dbManagers/users.js';
import Carts from '../dao/dbManagers/carts.js';
import Products from '../dao/dbManagers/products.js';
import _ from 'mongoose-paginate-v2';
import { passportCall } from '../utils.js';
import mongoose from 'mongoose';

const usersManager = new Users();
const cartManager = new Carts();
const productManger = new Products();
const router = Router();

router.get('/', async (req,res)=>{
    let users = await usersManager.getAll();
    if(!users) return res.status(500).send({status:"error",error:"Couldn't get users due to internal error"})
    res.send({status:"success",payload:users})
})

router.put('/product/:pid', passportCall("jwt"), async (req, res) => {
    const { pid } = req.params;
    const uid = req.user.id;
    
    // Verifica que el producto exista
    const product = await productManger.getById(pid);
    if (!product) {
        return res.status(404).send({ status: "error", error: "Product not found" });
    }
    
    // Encuentra el usuario y su carrito
    const user = await usersManager.getBy({ _id: uid });
    if (!user || !user.cart) {
        return res.status(404).send({ status: "error", error: "User or cart not found" });
    }
    // Verifica si el producto ya está en el carrito
    const productInCart = user.cart.products.find(item => item.product._id.toString() === pid);
    
    let update;
    let arrayFilters;

    if (productInCart) {
        // Si el producto ya está en el carrito, incrementa la cantidad
        update = {
            $inc: { 'products.$[elem].quantity':   1 }
        };
        arrayFilters = [{ 'elem.product': mongoose.Types.ObjectId(pid) }];
    } else {
        // Si el producto no está en el carrito, lo agrega con cantidad  1
        update = {
            $push: { products: { product: mongoose.Types.ObjectId(pid), quantity:  1 } }
        };
    }

    try {
        const cartUpdate = await cartManager.updateCart(user.cart._id, update, { arrayFilters });
        
        if (cartUpdate.modifiedCount >  0) {
            res.send({ status: "success", message: "Product quantity updated in cart" });
        } else {
            res.status(400).send({ status: "error", error: "Couldn't update product quantity in cart" });
        }
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).send({ status: "error", error: "Internal server error" });
    }
});

router.put('/empty-cart', passportCall("jwt"), async (req, res) => {
    const uid = req.user.id;

    const user = await usersManager.getBy({ _id: uid });
    if (!user || !user.cart) {
        return res.status(404).send({ status: "error", error: "User or cart not found" });
    }

    try {
        const cartUpdate = await cartManager.emptyCart(user.cart._id);
        if (cartUpdate.modifiedCount > 0) {
            res.send({ status: "success", message: "Cart emptied" });
        } else {
            res.status(400).send({ status: "error", error: "Couldn't empty cart" });
        }
    } catch (error) {
        console.error('Error emptying cart:', error);
        res.status(500).send({ status: "error", error: "Internal server error" });
    }
});


// router.post('/',async(req,res)=>{
//     let {first_name,last_name,dni,email,birthDate,gender} = req.body;
//     if(!first_name||!last_name||!dni||!email||!birthDate) return res.status(400).send({status:"error",error:"Incomplete values"})
//     //Muy importante! La inserción actual de la fecha de nacimiento está pensada para hacerse en el formato
//     // MM - DD - YYYY. De otra forma, arrojará un error. puedes enseñar a tus estudiantes el parseo que tú necesites
//     //para llegar a este formado, por defecto, se espera que se mande así desde postman.
//     let result = await usersManager.saveUser({
//         first_name,
//         last_name,
//         email,
//         dni,
//         birthDate,
//         gender
//     })
//     if(!result) return res.status(500).send({status:"success",payload:result})
//     res.send({status:"success",payload:result})
// })

// router.post('/:uid/courses/:cid',async(req,res)=>{
//     const {uid,cid} = req.params;
//     const course = await coursesManager.getById(cid);
//     if(!course) return res.status(404).send({status:"error",error:"Course not found"})
//     const user = await usersManager.getBy({_id:uid});
//     if(!user) return res.status(404).send({status:"error",error:"User not found"});
//     //checamos si el usuario ya tenía ese curso registrado
//     let courseExists = user.courses.some(c=>c._id.toString()===cid);
//     if(courseExists) return res.status(400).send({status:"error",error:"The user is already registered in this course"});
//     //Si todo está bien, insertamos de ambos lados.
//     user.courses.push(course._id);
//     course.students.push(user._id);
//     await usersManager.updateUser(uid,user);
//     await coursesManager.updateCourse(cid,course);
//     res.send({status:"success",message:"User added to course"})
// })

export default router;