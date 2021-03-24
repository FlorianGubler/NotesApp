const {app, BrowserWindow, screen, Tray, Menu, nativeImage, globalShortcut, Main, ipcMain, nativeTheme } = require('electron');
const path = require("path");
const { defaultApp } = require('process');
const exec = require('child_process').execFile;
const fs = require('fs');
const mysql = require('mysql');

const appName = "GameLauncher";
const iconPath = 'frontend/assets/img/icon.png';

var win;
var trayIcon;
var tray;

function init() {
  createWindow();
  createTray();
}

function shutdown() {
  hideWindow();
  tray.destroy();
  globalShortcut.unregisterAll();
  app.quit();
}

function createWindow () {
  win = new BrowserWindow({
    show: false,
    frame: true,
    center: true,
    backgroundColor: '#1c1c1c',
    resizable: true,
    alwaysOnTop: false,
    icon: path.join(__dirname, 'frontend/assets/img/icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  });
  //win.removeMenu();
  win.loadFile('frontend/login.html');
  showWindow();
  win.maximize()

  win.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'escape') {
      hideWindow();
      event.preventDefault();
    }
  });
}

function showWindow() {
  let currentScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  win.setBounds(currentScreen.bounds);
  win.show();
}

function hideWindow() {
  win.hide();
}

function createTray() {
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { type: 'normal', enabled: false, icon: nativeImage.createFromPath(iconPath).resize({width:16}), label: appName},
    { type: 'separator'},
    { label: 'Show ', type: 'normal', click: () => {showWindow()}},
    { label: 'Quit', type: 'normal', click: () => {shutdown()}},
    { type: 'separator'},
    { label: 'Settings ', type: 'normal', click: () => {openWindow_Settings()}},
    { type: 'separator'},
    { label: 'Exit Menu', type: 'normal'}
  ])
  tray.setToolTip(appName);
  tray.setContextMenu(contextMenu);
  tray.set
}

app.whenReady().then(init);

var con = mysql.createConnection({
  host: "dekinotu.mysql.db.hostpoint.ch",
  user: "dekinotu_user1",
  password: "CBXG2pfrpKkDWsG",
  database: "dekinotu_notenberechnung",
  port: 3306
});
  
con.connect(function(err) {
  if (err) console.log(err);
  console.log("Connected to Notes DB");
});

function getUserNotes(event){
  con.query("SELECT * FROM notes INNER JOIN subjects ON notes.FK_subject = subjects.id INNER JOIN schools ON subjects.FK_school = schools.id INNER JOIN semesters ON notes.FK_semester = semesters.id WHERE FK_user="+login_user.id+";", function (err, result) {
    if (err) console.log(err);
    event.reply('fromMainA', JSON.stringify({type: "replyUserNotes", cmd: "", attributes: JSON.stringify(result)}));
  });  
}

function getSubjects(event){
  con.query("SELECT * FROM subjects INNER JOIN schools ON subjects.FK_school = schools.id;", function (err, result) {
    if (err) console.log(err);
    event.reply('fromMainB', JSON.stringify({type: "replySubjects", cmd: "", attributes: JSON.stringify(result)}));
  });  
}

function getSemesters(event){
  con.query("SELECT * FROM semesters;", function (err, result) {
    if (err) console.log(err);
    event.reply('fromMainD', JSON.stringify({type: "replySemesters", cmd: "", attributes: JSON.stringify(result)}));
  });  
}

var sha256 = require('js-sha256');
var login_user;

function checkLogin(event, loginData){
  con.query("SELECT * from users WHERE username="+con.escape(loginData.username)+";", function (err, result) {
    if (err) throw err;
    var login = false;
    result.forEach(user => {
      if(sha256(loginData.username+loginData.password) == user.passwordhash){
        login = true
        login_user = user;
      }
    });
    event.reply('fromMainA', JSON.stringify({type: "replyLogin", cmd: "", attributes: JSON.stringify(login)}));
    if(loginData.remember && login == true){
      fs.writeFile('frontend/assets/data/data.json', JSON.stringify(loginData), function (err) {
        if (err) return console.log(err);
        console.log('Remember status > frontend/assets/data/data.json');
      });
    }
  });  
}

function checkAutoLogin(event){
  var autoLoginData = fs.readFileSync('frontend/assets/data/data.json', {encoding:'utf8', flag:'r'}); 
  if(autoLoginData != "" && autoLoginData != null){
    var autoLoginData = JSON.parse(autoLoginData);
    autoLoginData.remember = false;
    checkLogin(event, autoLoginData)
  }
}

function uploadNotes(event, data){
  con.query("SELECT * FROM subjects where subjectName='"+data.subject+"';", function (err, subject) {
    if (err) {
      console.log(err);
    }
    else{
      con.query("INSERT INTO notes (value, examName, FK_subject, FK_user, FK_semester) VALUES ("+data.note+", '"+data.examTag+"', "+subject[0].id+", "+login_user.id+", "+data.semester+");", function (err, result) {
        if(err) throw err;
        if (err) {
          event.reply('fromMainA', JSON.stringify({type: "replyUploadNote", cmd: "false", attributes: JSON.stringify("Interner Fehler")}))
        }
        else{
          event.reply('fromMainA', JSON.stringify({type: "replyUploadNote", cmd: "true", attributes: JSON.stringify("")}))
        }
    });  
    }
  }); 
  
}

function logout(){
  login_user = null;
  fs.writeFile('frontend/assets/data/data.json', "", function (err) {
    if (err) return console.log(err);
  });
}

function getUserData(){
  if(login_user == null || login_user == undefined){
      return null;
  }
  return {id: login_user.id, username: login_user.username, profilepicture: login_user.profilepicture};
}

function setUsername(event, data){
  con.query("SELECT * from users WHERE id="+login_user.id+";", function (err, result) {
    if (err) throw err;
    if (err) {
      event.reply('fromMainA', JSON.stringify({type: "replyNewPassword", cmd: "false", attributes: JSON.stringify("Interner Fehler")}))
    }
    else{
      if(sha256(result[0].username+data.password) == result[0].passwordhash){
        con.query("UPDATE users SET username='"+data.newusername+"', passwordhash='"+sha256(data.newusername+data.password)+"' WHERE id="+login_user.id+";", function (err, result) {
          if(err) throw err;
          if (err) {
            event.reply('fromMainA', JSON.stringify({type: "replyNewUsername", cmd: "false", attributes: JSON.stringify("Interner Fehler")}))
          }
          else{
            event.reply('fromMainA', JSON.stringify({type: "replyNewUsername", cmd: "true", attributes: JSON.stringify("")}))
            logout();
          }
        }); 
      }
      else{
        event.reply('fromMainA', JSON.stringify({type: "replyNewPassword", cmd: "false", attributes: JSON.stringify("Falsches Passwort")}))
      }
    }
  });  
}

function setPassword(event, data){
  con.query("SELECT * from users WHERE id="+login_user.id+";", function (err, result) {
    if (err) throw err;
    if (err) {
      event.reply('fromMainA', JSON.stringify({type: "replyNewPassword", cmd: "false", attributes: JSON.stringify("Interner Fehler")}))
    }
    else{
      if(sha256(result[0].username+data.oldpassword) == result[0].passwordhash){
        con.query("UPDATE users SET passwordhash='"+sha256(result[0].username+data.newpassword)+"' WHERE id="+login_user.id+";", function (err, result) {
          if(err) throw err;
          if (err) {
            event.reply('fromMainA', JSON.stringify({type: "replyNewPassword", cmd: "false", attributes: JSON.stringify("Interner Fehler")}))
          }
          else{
            event.reply('fromMainA', JSON.stringify({type: "replyNewPassword", cmd: "true", attributes: JSON.stringify("")}))
            logout();
          }
        }); 
      }
      else{
        event.reply('fromMainA', JSON.stringify({type: "replyNewPassword", cmd: "false", attributes: JSON.stringify("Falsches Passwort")}))
      }
    }
  });  
}

ipcMain.on("toMain", (event, command) => {
  args = JSON.parse(command);
  switch(args.type){ 
    case "GetData":
        switch(args.cmd){
          case "UserData":
            event.reply('fromMainC', JSON.stringify({type: "replyUserData", cmd: "", attributes: JSON.stringify(getUserData())}));
            break;
          case "NotesfromUser":
            getUserNotes(event);
            break;
          case "Subjects":
            getSubjects(event);
            break;
          case "Semesters":
            getSemesters(event);
            break;
          default: console.error("Unkwown Command in Messaging");
        }
      break;
    case "CheckData":
      switch(args.cmd){
        case "Login":
          checkLogin(event, JSON.parse(args.attributes))
          break;
        case "AutoLogin":
          checkAutoLogin(event)
          break;
        default: console.error("Unkwown Command in Messaging");
      }
      break;
    case "UploadData":
      switch(args.cmd){
        case "Note":
          uploadNotes(event, JSON.parse(args.attributes))
          break;
        case "Password":
          setPassword(event, JSON.parse(args.attributes))
          break;
        case "Username":
          setUsername(event, JSON.parse(args.attributes))
          break;
        default: console.error("Unkwown Command in Messaging");
      }
      break;
    case "Logout":
      logout();
      break;
    default: console.error("Unkwown Type in Messaging");
  }
});