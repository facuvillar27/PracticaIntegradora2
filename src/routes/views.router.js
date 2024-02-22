import {Router} from 'express';
import Users from '../dao/dbManagers/users.js';
import Carts from '../dao/dbManagers/carts.js';
import Product from '../dao/dbManagers/products.js';
import { passportCall } from '../utils.js';

const usersManager = new Users();
const cartsManager = new Carts();
const productsManager = new Product();

const router = Router();

router.get('/', async (req,res)=>{
    res.render('login');
})

router.get('/signup', async (req,res)=>{
    res.render('signup');
})


router.get('/users', async (req,res) => {
    let users = await usersManager.getAll();
    res.render('users',{users})
})

router.get('/products', async (req,res) => {
    let products = await productsManager.getAll();
    res.render('products',{products})
})

router.get('/perfil', passportCall("jwt"), async (req,res) => {
    let user = await usersManager.getBy({ "email": req.user.email });
    let product = await productsManager.getAll();
    let cartProducts = user.cart.products;
    res.render("perfil", {
        user,
        product,
        cartProducts,
    })
})



export default router;