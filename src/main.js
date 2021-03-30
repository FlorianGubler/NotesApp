const {app, BrowserWindow, screen, Tray, Menu, nativeImage, globalShortcut, Main, ipcMain, nativeTheme } = require('electron');
const path = require("path");
const { defaultApp } = require('process');
const fs = require('fs');
let base64 = require('base-64');
const fetch = require("node-fetch")

const appName = "GameLauncher";
const iconPath = 'frontend/assets/img/icon.png';

var win;
var trayIcon;
var tray;

var login_user;

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
  win.removeMenu();
  win.loadFile('frontend/login.html');  
  win.maximize()
  showWindow();

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

async function getData(action){
  let headers = new fetch.Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + base64.encode(login_user.username+":"+login_user.password));

  var raw = JSON.stringify([
    {
      "action": action
    }
  ]);

  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };

  var response = await fetch('https://dekinotu.myhostpoint.ch/notes/dbapi/', requestOptions);
  if(response.status != 200){
    console.log("GetDataAPI: "+response.status);
  }
  return response.json();
}

async function setData(body){
  let headers = new fetch.Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + base64.encode(login_user.username+":"+login_user.password));

  var raw = JSON.stringify([body]);

  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };

  var response = await fetch('https://dekinotu.myhostpoint.ch/notes/dbapi/', requestOptions);
  if(response.status != 200){
    console.log("SetDataAPI: "+response.status);
  }
}


function getUserNotes(event){
  getData("GetUserNotes")
    .then(data => event.reply('fromMainA', JSON.stringify({type: "replyUserNotes", cmd: "", attributes: JSON.stringify(data)})))  
}

function getSubjects(event){
  getData("GetSubjects")
    .then(data => event.reply('fromMainB', JSON.stringify({type: "replySubjects", cmd: "", attributes: JSON.stringify(data)})))  
}

function getSemesters(event){
  getData("GetSemesters")
    .then(data => event.reply('fromMainD', JSON.stringify({type: "replySemesters", cmd: "", attributes: JSON.stringify(data)}))) 
}

function checkLogin(event, loginData){
  let headers = new fetch.Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + base64.encode(loginData.username+":"+loginData.password));
  var raw = JSON.stringify([{"action": "GetUserData"}]);
  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };
  fetch('https://dekinotu.myhostpoint.ch/notes/dbapi/', requestOptions).then((result) => {
    if(result.status == 200){
      login = true
    }
    else{
      login = false
    }
    event.reply('fromMainA', JSON.stringify({type: "replyLogin", cmd: "", attributes: JSON.stringify(login)}));
    if(loginData.remember && login == true){
      fs.writeFile('frontend/assets/data/data.json', JSON.stringify(loginData), function (err) {
        if (err) return console.log(err);
        console.log('Remember status > frontend/assets/data/data.json');
      });
    }
    return result.json();
  }).then(json => {
    login_user = json
    login_user.password = loginData.password;
  }).catch(err => console.log("error in login fetch: ", err)); 
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
  var FK_subject_calc
  getData("GetSubjects")
    .then(result => {
      result.forEach(subj => {
        if(subj.subjectName == data.subject){
          FK_subject_calc = subj.id;
        }
      })
      var uploadnotebody = {
        "action": "UploadNote",
        "value": data.note,
        "examName": data.examTag,
        "FK_subject": FK_subject_calc,
        "FK_semester": data.semester
      }
      setData(uploadnotebody)
        .then(() => {event.reply('fromMainA', JSON.stringify({type: "replyUploadNote", cmd: "true", attributes: JSON.stringify("")})); logout();})
        .catch(err => event.reply('fromMainA', JSON.stringify({type: "replyUploadNote", cmd: "false", attributes: JSON.stringify("Interner Fehler")})))
    })
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
  else{
    return {id: login_user.id, username: login_user.username, profilepicture: login_user.profilepicture};
  }
}

function setUsername(event, data){
  var newusernamebody = {
    "action": "SetUsername",
    "newusername": data.newusername,
    "password": data.password
  }
  setData(newusernamebody)
    .then(() => {event.reply('fromMainA', JSON.stringify({type: "replyNewUsername", cmd: true, attributes: JSON.stringify("")})); logout();})
    .catch(err => event.reply('fromMainA', JSON.stringify({type: "replyNewUsername", cmd: false, attributes: JSON.stringify("Interner Fehler")})));

}

function setPassword(event, data){
  var newusernamebody = {
    "action": "SetPassword",
    "newpassword": data.newpassword,
    "oldpassword": data.oldpassword
  }
  setData(newusernamebody)
    .then(() => {event.reply('fromMainA', JSON.stringify({type: "replyNewPassword", cmd: true, attributes: JSON.stringify("")})); logout();})
    .catch(err => event.reply('fromMainA', JSON.stringify({type: "replyNewPassword", cmd: false, attributes: JSON.stringify("Interner Fehler")})));
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