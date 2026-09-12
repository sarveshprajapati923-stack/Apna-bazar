const express=require('express'),cors=require('cors'),fs=require('fs'),path=require('path');
const app=express();app.use(cors());app.use(express.json());
const products=[
{id:1,name:'Aashirvaad Atta 5 KG',price:295,category:'Grocery',emoji:'🌾'},
{id:2,name:'Tata Salt 1 KG',price:28,category:'Grocery',emoji:'🧂'},
{id:3,name:'Tea 500 GM',price:210,category:'Beverages',emoji:'☕'},
{id:4,name:'Dishwash Liquid',price:99,category:'Household',emoji:'🧴'},
{id:5,name:'Bath Soap Pack',price:120,category:'Personal Care',emoji:'🧼'},
{id:6,name:'Biscuits Family Pack',price:85,category:'Grocery',emoji:'🍪'}
];
app.get('/api/products',(req,res)=>res.json(products));
app.post('/api/orders',(req,res)=>{
 const order={id:Date.now(),createdAt:new Date().toISOString(),...req.body};
 fs.appendFileSync(path.join(__dirname,'orders.json'),JSON.stringify(order)+'\n');
 res.status(201).json({success:true,orderId:order.id});
});
app.get('/api/health',(req,res)=>res.json({ok:true}));
app.listen(process.env.PORT||5000,()=>console.log('API running'));
