
const { faker } = require('@faker-js/faker');

const mysql = require('mysql2');

const express = require("express");
const app = express();

const path = require("path");

const methodOverride = require("method-override");
const { connect } = require('http2');
app.use(methodOverride("_method"));

app.use(express.urlencoded({extended:true}));

app.set("view engine","ejs");
app.set("views", path.join(__dirname, "views"));


const connection = mysql.createConnection({
    host:'localhost',
    user: 'root',
    database: 'delta_app',
    password: "mysqlpassword@123"
});

let getRandomUser=()=> {
  return [
    faker.string.uuid(),
    faker.internet.username(), // before version 9.1.0, use userName()
    faker.internet.email(),
    faker.internet.password(),
  ];
}

//to insert data in database
// let q = "insert into user (id,username,email,password) values ?";
// let data=[];
// for(let i = 1; i<10; i++){
//     data.push(getRandomUser());
// }
// try{
// connection.query(q,[data],(err,result)=>{
//     if (err) throw err;
//     console.log(result);
// })
// }catch(err){
//     console.log(err);
// }
// connection.end();


// home route
app.get("/",(req,res)=>{
    let q = "select count(*) from user";
    try{
    connection.query(q,(err,result)=>{
    if (err) throw err;
    let count = result[0]["count(*)"];
    res.render("home.ejs",{count});
    })
    }catch(err){
    console.log(err);
    res.send("error in database");
    }
})

//show route
app.get("/user",(req,res)=>{
    let q = `select * from user`;
    try{
    connection.query(q,(err,users)=>{
    if (err) throw err;
    res.render("showusers.ejs",{users});
    })
    }catch(err){
    console.log(err);
    res.send("error in database");
    }
})


//edit route
app.get("/user/:id/edit",(req,res)=>{
    let {id} = req.params;

    let q = `select * from user where id = '${id}'`;

    try{
    connection.query(q,(err,result)=>{
    if (err) throw err;
    let user = result[0];
    console.log(result);
    res.render("edit.ejs",{user});
    })
    }catch(err){
    console.log(err);
    res.send("error in database");
    }
});

//update route
app.patch("/user/:id",(req,res)=>{
    let {id} = req.params;
    let q = `select * from user where id = '${id}'`;
    let {password : formPass,username: newUsername} = req.body;
     try{
    connection.query(q,(err,result)=>{
    if (err) throw err;
    let user = result[0];
    if(formPass != user.password){
        res.send("wrond password");
    }else{
        let q2 = `update user set username = '${newUsername}' where id = '${id}'`;
        connection.query(q2,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
        });
    }
    });
    }catch(err){
    console.log(err);
    res.send("error in database");
    }
})



//add new user route

app.get("/user/new",(req,res)=>{
    res.render("newuser.ejs");
})
app.post("/user",(req,res)=>{
    let {id : formId, username: formUsername, email : formEmail, password : formPass} = req.body;
    let data = [formId,formUsername,formEmail,formPass];
    let q = `insert into user (id,username,email,password) values (?,?,?,?)`;

    connection.query(q,data,(err,result)=>{
        if(err) throw err;
        console.log(data);
        res.redirect("/user");
    });
})



//delete route

app.delete("/user/:id",(req,res)=>{
    let {id} = req.params;
    let q = `delete from user where id = '${id}'`;

    connection.query(q,(err,result)=>{
        if(err) throw err;
        res.redirect("/user");
    })
    
});

app.listen("8080",()=>{
    console.log("server is listening to port 8080");
});



