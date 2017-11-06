


var express = require('express');
var router = express.Router();
var mysql = require('mysql')

var connection = mysql.createConnection({
	host:"127.0.0.1",
	user:'x',
	password:'x',
	database:'voteApp'
});

connection.connect((error)=>{
	if(error){
		console.log(error.stack);
	}else{
		console.log('Connected as id' + connection.threadId)
	}
});

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.get('/', function(req,res,next){
	var selectQuery = 'SELECT name FROM voteUser;';
	connection.query(selectQuery,(error,results,field)=>{
		console.log(error);
		res.render('index',{results});
	})
})

router.get('/register',(req,res,next)=>{
	res.render('register',{})
})

router.post('/registerProcess', (req,res,next)=>{
	res.json(req.body);
})

router.get('/login',(req,res,next)=>{
	res.render('login',{})
})

router.post('/loginProcess', (req,res,next)=>{
	res.json(req.body);
})

module.exports = router;
