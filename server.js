const express = require('express'),
app = express(),
port = process.env.PORT || 3011,
http = require('http'),
socketIO = require('socket.io'),
// https = require('https'),
// { Server } = require('socket.io'),
ejs = require("ejs"),
session = require("express-session");

var fs = require('fs'),
path = require('path');

// const options = {
//     key: fs.readFileSync(path.join(__dirname, 'ssl_credential/Privatekey.pem')),
//     cert: fs.readFileSync(path.join(__dirname, 'ssl_credential/app_synergicbanking_in.pem')),
//     ca: [
//         fs.readFileSync(path.join(__dirname, 'ssl_credential/DigiCertCA.crt')),
//         fs.readFileSync(path.join(__dirname, 'ssl_credential/My_CA_Bundle.crt'))
//     ]
//   };

  // TO ACCEPT ALL DATA FROM CLIENT SIDE USING GET/POST REQUEST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// END

app.set("views", path.join(__dirname, "views"));
app.use(express.static(__dirname + "/assets"));

app.set("view engine", "ejs");

app.use(
  session({
    secret: "PDPECCS",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
    },
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.active = req.path.split("/")[2];
  // console.log(res.locals.active);
  res.locals.message = req.session.message;
  req.io = io;
  delete req.session.message;
  next();
});

// ROUTERS INITIALIZATION
const { salRouter } = require("./router/salaryRouter");
const { appApiRouter } = require("./router/appApiRouter");
const { SendNotification } = require('./controller/masterController');
const { Notification_cnt } = require('./controller/masterController');
const { UpdateNotification } = require('./controller/masterController');
const { adminRouter } = require("./router/adminRouter");
const { AboutRouter } = require('./router/aboutRouter');
const { transRouter } = require('./router/transactionRouter');
const { appFormRouter } = require('./router/applicationFormRouter');
const { galleryRouter } = require('./router/galleryRouter');
const { boardMembRouter } = require('./router/boardMemberRouter');
const { holidayHomeRouter } = require('./router/holidayHomeRouter');
const {SecDeskRouter} = require('./router/secDeskRouter')
// END



// USE ROUER FOR SPECIFIC URL
// app.use("/sal", salRouter);
// app.use("/api", apiRouter);
app.use("/api", appApiRouter);
app.use("/admin", adminRouter);
app.use("/admin", AboutRouter);
app.use("/admin", transRouter);
app.use("/admin", appFormRouter);
app.use("/admin", galleryRouter);
app.use("/admin", boardMembRouter);
app.use("/admin", holidayHomeRouter);
app.use("/admin", SecDeskRouter);
// app.use('/bccs', bccsApkApiRouter);
// app.use('/bccs_admin', bccsAdminRouter);
// END

app.get('/', (req, res) => {
  var enc = Buffer.from('A').toString('base64')
  console.log(encodeURIComponent(enc));
  res.redirect('/admin')
  // var bcrypt = require("bcrypt")
  // var password = bcrypt.hashSync('3118', 10);
  // console.log(password);
  //   res.send('Helow World1');
})

app.get('/test', (req, res) => {
  var raw_data = {
    "Block": {
      "Name": "NANDIGRAM-I",
      "Year": [
        {
          "period": "2019",
          "Party": [
            {
              "PartyName": "BJP",
              "Value": {
                "Booth": "25",
                "Percentage": "0.26"
              }
            },
            {
              "PartyName": "TMC",
              "Value": {
                "Booth": "191",
                "Percentage": "0.66"
              }
            },
            {
              "PartyName": "Other",
              "Value": {
                "Booth": "0",
                "Percentage": "0.01"
              }
            },
            {
              "PartyName": "Left",
              "Value": {
                "Booth": "0",
                "Percentage": "0.04"
              }
            }
          ]
        },
        {
          "period": "2021",
          "Party": [
            {
              "PartyName": "TMC",
              "Value": {
                "Booth": "86",
                "Percentage": "0.50"
              }
            },
            {
              "PartyName": "Other",
              "Value": {
                "Booth": "0",
                "Percentage": "0.01"
              }
            },
            {
              "PartyName": "Left",
              "Value": {
                "Booth": "1",
                "Percentage": "0.02"
              }
            },
            {
              "PartyName": "BJP",
              "Value": {
                "Booth": "134",
                "Percentage": "0.47"
              }
            }
          ]
        }
      ]
    }
  }
  var req_dt = req.query
  var year = req_dt.year.split(','), party = req_dt.party.split(',');
  var newArr = [], pr_arr = []
  var data = raw_data.Block.Year
  var i = 0
  for(let yr of year){
    pr_arr.length = 0
    var year_filter_data = data.filter(dt => dt.period == yr)
    newArr.push(year_filter_data[0])
    // // console.log(year_filter_data, 'qweqee');
    // // var filterData = data.filter(dt => dt.period == yr)
    // // filterData[0].Party.length = 0
    // // newArr.push(filterData[0])
    // // console.log(year_filter_data, 'WWWWW');
    // for(let py of party){
      
    //   var party_arr = year_filter_data[0].Party.filter(dt => dt.PartyName == py)
    //   console.log(party_arr, 'HERE');
      
    //   pr_arr.push(party_arr[0])
    // }
    // newArr[i].Party.length = 0
    // newArr[i].Party.push(pr_arr)
    // i++
  }
  console.log(newArr);
  
  res.send({raw_data, year, party, newArr})
})

// https.createServer(options, function (req, res) {
//     res.writeHead(200);
//     res.end("hello world\n");
//   }).listen(3000);

// var server = https.createServer(options, app);
// const io = new Server(server);

var server = http.createServer(app);
const io = socketIO(server);

io.on('connection', async function (socket) {
    console.log(`Connected succesfully to the socket ... ${socket.id}`);
    socket.on('notification', async (data) => {
      console.log(socket.id + ' in notification');
      var res_dt = await SendNotification(data);
      socket.emit('notification', res_dt);
    })
	socket.on('notification_cnt', async (data) => {
     // console.log(socket.id + ' in notification');
      var res_dt = await Notification_cnt();
    //  var res_dt = 'test data';
      socket.emit('notification_cnt', res_dt);
    })
	socket.on('redu_noti_cnt', async (data) => {
    //  console.log(socket.id + ' in notification');
      var res_dt = await UpdateNotification(data);
		 var res_dt_send = await SendNotification(data);
      socket.emit('notification', res_dt_send);
		// var res_dt = data;
      socket.emit('redu_noti_cnt', res_dt);
    })
    // socket.on('notification', (data) => {
    //   var sql = `SELECT sl_no, ardb_id, narration, send_user_id user_id, created_by, created_dt FROM td_notification WHERE ardb_id = "${data.ardb_id}" AND send_user_id = "${data.user_id}" ORDER BY DATE(created_dt) DESC LIMIT ${data.max}`
    //   db.query(sql, (err, result) => {
    //     // console.log(result);
    //     if (err) res_dt = { suc: 0, msg: err };
    //     else res_dt = { suc: 1, msg: result };
    //     socket.emit('notification', res_dt);
    //   })
    // });
  })

// server.listen(port);

server.listen(port, (err) => {
    if(err) throw err;
    else console.log(`App is running at port ${port}`);
})