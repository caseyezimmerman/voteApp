


var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var config = require('../config/config');

var connection = mysql.createConnection(config.db);

connection.connect((error)=>{
	if(error){
		throw error;
	}else{
		console.log('Connected as id' + connection.threadId)
	}
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/', function(req,res,next){
	if(req.session.name === undefined){
		res.redirect('/login?msg=mustlogin')
		return;
	}

	//we want to select all the image that the user has not voted on
	var selectQuery = `
		SELECT * FROM images WHERE id NOT IN(
			SELECT imgID FROM votes WHERE userID = ?
		);
	`
	// var selectQuery = 'SELECT * FROM images;';
	connection.query(selectQuery,[req.session.uid],(error,results,field)=>{
		var rand = Math.floor(Math.random() * results.length);
		if(results.length == 0){
		res.render('standings')
		}else{
		res.render('index',{
			results:results[rand],
			name: req.session.name,
			loggedIn: true
		});
	}
	})
	
})

router.get('/register',(req,res,next)=>{
	// if(req.session.name != undefined){
		// res.redirect('/?msg=alreadyloggedin')
		res.render('register',{})
	
})

router.get('/logout',(req,res)=>{
	req.session.destroy();
	res.redirect('/login');
})



router.post('/registerProcess', (req,res,next)=>{
	// res.json(req.body);
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	const selectQuery = `SELECT * FROM users WHERE email = ?;`;
	connection.query(selectQuery,[email],(error,results)=>{
		// did this return a row? if so,,,user aready exisist
		if (results.length != 0){
			res.redirect('/login?msg=registered')
		}else{
			// this is a new user...insert them
			// hash the password first
			var hash = bcrypt.hashSync(password)
			var insertQuery = `INSERT INTO users (name,email,password) VALUES(?,?,?);`;
			connection.query(insertQuery,[name,email,hash],(error)=>{
				if (error){
					throw error
				}else{
					res.redirect('/?msg=registered')
				}
			})
		}
	})
})

router.get('/login',(req,res,next)=>{
	res.render('login',{})
})

router.post('/loginProcess', (req,res,next)=>{
	// res.json(req.body);
	var email = req.body.email;
	var password = req.body.password //not encripted yet
	// write a query to check is the user is in the db
	var selectQuery = `SELECT * FROM users WHERE email = ?;`;
	connection.query(selectQuery,[email],(error,results)=>{
		if(error){
			throw error
		}else{
			if(results.length == 0){
				//this user isn't in the db...they don't belong here,password isn't necessary
				res.redirect('/login?msg=emailnotfound')
			}else{
				// the email is in the db..check the password
				// call compareSync
				//pass bcrypt compare two things...(engligh version, database version)
				var passwordMatch = bcrypt.compareSync(password,results[0].password)
				if (passwordMatch){
					// user is in the db, password is right...log them in
					req.session.name = results[0].name;
					req.session.uid = results[0].id;
					req.session.email = results[0].email;
					console.log(results[0])
					console.log(req.session.id)
					res.redirect('/')
				}else{
					// user is in db..but password isnt correct..send them back to login
					res.redirect('/login?msg=badpassword')
				}
			}
		}
	})
})

router.get('/vote/:direction/:imageId',(req,res,)=>{
	// res.json(req.params)
	var imageId = req.params.imageId;
	var direction = req.params.direction;
	var insertVoteQuery = `INSERT INTO votes (imgID, voteDirection, userID) VALUES(?,?,?);`;
	connection.query(insertVoteQuery,[imageId,direction,req.session.uid],(error,results)=>{
		if(error){
			throw error
		}else{
			res.redirect('/')
		}
	})
})

module.exports = router;
