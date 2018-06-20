const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');//body-parser中间件，解析post请求中的body
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const SessionStore = require('express-mysql-session')
// const domain = require('domain')
const path = require('path')

var app = express();

var options = {
    host: '数据库地址',
    port: 3306,
    user: '账号',
    password: '密码',
    database: 'jobsql'//数据库名
}

app.set('env', 'production');

const db_job = mysql.createPool(options);

var arr = [];
for (var i = 0; i < 10; i++) {
    arr.push('dffd' + Math.random())  //随机生成数组
}

var session = expressSession({
    secret: arr,
    cookie: { maxAge: 60000 * 24 },
    store: new SessionStore(options)
})

app.use(bodyParser.json({
    verify: function (req, res, buf, encoding) {
        req.rawBody = buf;
    }
}));

app.use(bodyParser.urlencoded({
    extended: false,
    verify: function (req, res, buf, encoding) {
        console.log('buf:', buf);
        req.rawBody = buf;
    }
}));

var teacherMap = new Map();
var SADMap = new Map();

app.use('/', express.static(path.join(__dirname, 'hhh')));
app.use(cookieParser());
app.use(session);

app.get('/get',(req,res)=>{
    res.json({
        'code': 0,
        '_id':req.session.user
    });
});

//登录
app.post('/login',(req,res)=>{
    var user = req.body.user;
    var pw = req.body.pw;
    var job = req.body.j;
    var _url = '';
    console.log(job);
    if(!user || !pw){
        res.json({
            'code': -1,
            'msg': "err"
        });
        return;
    }
    if (job == "stud"){
        job = "studentUser";
        _url = "/student.html";
    }else if(job == "teach"){
        job = "teacherUser";
        _url = "/teacher.html";
    }else if(job == "SAD"){
        job = "SADUser";
        _url = "/SAD.html";
    }else{
        res.json({
            'code':-1,
            'msg':'err'
        })
        return;
    }
    db_job.query(`SELECT pw FROM ?? WHERE user = ?`,[job,user],(err,data)=>{   
        if (err){
            // console.log('1');
            console.log('error:',err);
            return res.json({'code':-1,'msg':'database err'});
        }else{    
            // console.log('2');
            console.log('seccess',data);
            // console.log('success',data[0].pw);
            // res.json({'ok':0,'msg':'succ'});
            if (data.length == 0){
                console.log('msg:no user')
                return res.json({'code':-1,'msg':'no user'});                
            }
            else if (pw == data[0].pw) {
                req.session.user = user;
                console.log('成功seccess');
                // res.redirect(301,'../student.html'); 
                return res.json({
                    'code':0,
                    'msg': "ok",
                    'url': _url
                });
            }else{
                console.log('msg:pw err')
                return res.json({'code':-1,'msg':'pw err'});
            }
        }       
    });
});

//学生填写数据接口
app.post('/student',(req,res)=>{
        if(req.body.radio == 'l'){
            var stat = 0;
            req.body.companyName='';
            req.body.address='';
            req.body.department='';
            req.body.charge='';
            req.body.chargePhone=-1;
            req.body.studentPhone=-1;
        }else if(req.body.radio == 'p'){
            var stat = 1;
        }else{
            return res.json({
                'code':-1,
                'msg':'date err'
            });
        }
    
        db_job.query(`UPDATE job set status=?,companyName=?,address=?,department=?,charge=?,chargePhone=?,studentPhone=? where id = ?`, [stat,req.body.companyName,req.body.address,req.body.department,req.body.charge,req.body.chargePhone,req.body.studentPhone,parseInt(req.session.user)], (err, data) => {
            if (err) {
                console.log('error:', err);
                return res.json({ 'code': -1, 'msg': 'err' });
            } else {
                return res.json({ 'code': 0, 'msg': 'ok' });
            }
        });
});

//辅导员接口
app.get('/teacher',(req,res)=>{
    if (teacherMap.has(req.session.user)){
        db_job.query(`SELECT * FROM teacherClass as a,job as b where a.class = b.class and a.id = ?`, [req.session.user],(err, data) => {
            if (err) {
                console.log('error:', err);
                return res.json({ 'code': -1, 'msg': 'database err' });
            } else {
                console.log(data);
                return res.json({ 'code': 0, 'msg': 'ok', 'data': data });
            }
        });
    }else{
        return res.json({ 'code': -1, 'msg': 'user err' });
    }
});

//辅导员统计接口
app.get('/teacher/all',(req,res)=>{
    if (teacherMap.has(req.session.user)){
        var all = 0;
        var onwork = 0;
        db_job.query(`SELECT COUNT(status) FROM job as b,teacherClass as a where a.class = b.class and a.id = ?`, [req.session.user],(err, data) => {
            if (err) {
                console.log('error:', err);
                return res.json({ 'code': -1, 'msg': 'database err' });
            } else {
                console.log(data);
                all = data[0]['COUNT(status)'];
                db_job.query(`SELECT COUNT(status) FROM job as b,teacherClass as a  where a.class = b.class and a.id = ? and status = 1`, [req.session.user],(err, data) => {
                    if (err) {
                        console.log('error:', err);
                        return res.json({ 'code': -1, 'msg': 'database err' });
                    } else {
                        console.log(data);
                        onwork = data[0]['COUNT(status)'];
                        return res.json({
                            'code': 0, 'msg': 'ok', 'all': all,'onwork': onwork,'percent': (onwork/all)*100
                        })
                    }
                });
            }
        });
        
    }else{
        return res.json({ 'code': -1, 'msg': 'user err' });
    }
});

//学生处接口
app.get('/SAD',(req,res)=>{
    if (SADMap.has(req.session.user)){
        db_job.query(`SELECT * FROM job`, (err, data) => {
            if (err) {
                console.log('error:', err);
                return res.json({ 'code': -1, 'msg': 'database err' });
            } else {
                return res.json({ 'code': 0, 'msg': 'ok', 'data': data });
            }
        });
    }else{
        return res.json({ 'code': -1, 'msg': 'user err' });
    }
    
});

//学生处统计接口
app.get('/SAD/all',(req,res)=>{
    if (SADMap.has(req.session.user)){
        var all = 0;
        var onwork = 0;
        db_job.query(`SELECT COUNT(status) FROM job`, (err, data) => {
            if (err) {
                console.log('error:', err);
                return res.json({ 'code': -1, 'msg': 'database err' });
            } else {
                all = data[0]['COUNT(status)'];
                db_job.query(`SELECT COUNT(status) FROM job where status = 1`, (err, data) => {
                    if (err) {
                        console.log('error:', err);
                        return res.json({ 'code': -1, 'msg': 'database err' });
                    } else {
                        onwork = data[0]['COUNT(status)'];
                        return res.json({
                            'code': 0, 'msg': 'ok', 'all': all,'onwork': onwork,'percent': (onwork/all)*100
                        })
                    }
                });
            }
        });
    }else{
        return res.json({ 'code': -1, 'msg': 'user err' });
    }
})

//监听端口
var server_ = app.listen(10086, () => {
    var host = server_.address().address
    var port = server_.address().port
    console.log("访问地址为 http://%s:%s", host, port)
})

function teacher_map() {
    db_job.query(`SELECT user FROM teacherUser`, (err, data) => {
        if (err) {
            return
        } else {
            for (var name in data) {
                teacherMap.set(data[name].user, data[name].user)
            }
            console.log('------------------');
        }
    })
}

function SAD_map() {
    db_job.query(`SELECT user FROM SADUser`, (err, data) => {
        if (err) {
            return
        } else {
            for (var name in data) {
                SADMap.set(data[name].user, data[name].user)
            }
        }
    })
}

teacher_map();
SAD_map();
