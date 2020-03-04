const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.port || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: conf.host,
  user: conf.user,
  password: conf.password,
  port: conf.port,
  database: conf.database
});
connection.connect(function(error){

	if(!!error){
		console.log('error' + error.message);
	}else{
		console.log('OK!');
	}
});

const multer = require('multer');
const upload = multer({dest:'./upload'});

app.get('/api/hello', (req, res) => {
    res.send({message:'Hello Express!!'});
});

app.get('/api/customers', (req,res) => {
    connection.query(
      "select * from customer where isDeleted = 0", 
      (err, rows, fields) => {
        res.send(rows);
      }
    );
});

app.use('/image', express.static('./upload'));

app.post('/api/customers', upload.single('image'), (req,res) => {

  console.log("---------start-------------");

  let sql = 'INSERT INTO CUSTOMER VALUE (null, ?, ?, ?, ?, ?, now(), 0)';
  let image = '/image/' + req.file.filename;
  let name = req.body.name;
  let birthday = req.body.birthday;
  let gender = req.body.gender;
  let job = req.body.job;
  let params = [image, name, birthday, gender, job];

   //console.log(req.file);
  // console.log(name);
  // console.log(birthday);
  // console.log(gender);
   //console.log(job);

  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
      //console.log(err);
    }
  );

});

app.delete('/api/customers/:id', (req, res) => {
  let sql = 'UPDATE CUSTOMER SET isDeleted = 1 where id=?';

  let params = [req.params.id];
  connection.query(sql, params, (err, rows, fields) =>{
    res.send(rows);
  });
});

app.listen(port, () => console.log(`Lisening on port ${port}`));


