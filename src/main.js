const { app, BrowserWindow, screen, Tray, Menu, nativeImage, globalShortcut, Main, ipcMain, nativeTheme, dialog } = require('electron');
const path = require("path");
const { defaultApp } = require('process');
const fs = require('fs');
let base64 = require('base-64');
const fetch = require("node-fetch")
const exec = require("child_process").exec;
const FormData = require('form-data');
const isImage = require('is-image');

const appName = "ProMarks";
const iconPath = 'frontend/assets/img/icon.png';

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

var win;
var trayIcon;
var tray;

var login_user;
var WinminWidth = 800;
var WinminHeight = 650;

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

function createWindow() {
  win = new BrowserWindow({
    show: false,
    frame: true,
    center: true,
    backgroundColor: '#1c1c1c',
    resizable: true,
    minWidth: WinminWidth,
    minHeight: WinminHeight,
    alwaysOnTop: false,
    titleBarStyle: "hidden",
    icon: "frontend/assets/img/logo.png",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(app.getAppPath(), 'preload.js')
    }
  });

  win.loadFile('frontend/login.html');
  win.maximize()
  showWindow();

  win.webContents.on('before-input-event', (event, input) => {
    if (input.key.toLowerCase() === 'escape') {
      hideWindow();
      event.preventDefault();
    }
  });

  win.on('maximize', (e) => {
    win.webContents.send('fromMainF', JSON.stringify({ type: "replyWinMode", cmd: "max", attributes: "" }));
  });

  win.on('unmaximize', (e) => {
    win.webContents.send('fromMainF', JSON.stringify({ type: "replyWinMode", cmd: "notMax", attributes: "" }));
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

function openExternalWebpage(url) {
  exec("start chrome " + url, function (err) {
    if (err) {
      console.log(err)
    }
  });
}

function createTray() {
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { type: 'normal', enabled: false, icon: nativeImage.createFromPath(iconPath).resize({ width: 16 }), label: appName },
    { type: 'separator' },
    { label: 'About this Project', type: 'normal', click: () => { openExternalWebpage("https://github.com/FlorianGubler/notesLocal") } },
    { label: 'Show ', type: 'normal', click: () => { showWindow() } },
    { label: 'Hide ', type: 'normal', click: () => { hideWindow() } },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', click: () => { shutdown() } },
  ])
  tray.setToolTip(appName);
  tray.setContextMenu(contextMenu);
  tray.set
}

app.whenReady().then(init);

async function getData(action) {
  let headers = new fetch.Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + base64.encode(login_user.email + ":" + login_user.password));

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
  if (response.status != 200) {
    console.log("GetDataAPI: " + response.status);
  }
  return response.json();
}

async function setData(body, url = 'https://dekinotu.myhostpoint.ch/notes/dbapi/') {
  let headers = new fetch.Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + base64.encode(login_user.email + ":" + login_user.password));

  var raw = JSON.stringify([body]);

  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };

  var response = await fetch(url, requestOptions);
  if (response.status != 200) {
    console.log("SetDataAPI: " + response.status);
  }
}

async function setDataWithResponse(body, url = 'https://dekinotu.myhostpoint.ch/notes/dbapi/') {
  let headers = new fetch.Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + base64.encode(login_user.email + ":" + login_user.password));

  var raw = JSON.stringify([body]);

  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };

  var response = await fetch(url, requestOptions);
  if (response.status != 200) {
    console.log("SetDataAPI: " + response.status);
  }
  return response.json();
}

function getUserNotes(event) {
  getData("GetUserNotes")
    .then(data => event.reply('fromMainA', JSON.stringify({ type: "replyUserNotes", cmd: "", attributes: JSON.stringify(data) })))
}

function getSubjects(event) {
  getData("GetSubjects")
    .then(data => event.reply('fromMainB', JSON.stringify({ type: "replySubjects", cmd: "", attributes: JSON.stringify(data) })))
}

function getSemesters(event) {
  getData("GetSemesters")
    .then(data => event.reply('fromMainD', JSON.stringify({ type: "replySemesters", cmd: "", attributes: JSON.stringify(data) })))
}

function GetStickyNotes(event) {
  getData("GetStickyNotes")
    .then(data => event.reply('fromMainD', JSON.stringify({ type: "replyStickyNotes", cmd: "", attributes: JSON.stringify(data) })))
}

function GetStickyNoteValue(event, PK_stickynote) {
  var GetStickyNoteValueBody = {
    action: "GetStickyNoteValue",
    PK_stickynote: PK_stickynote
  }
  setDataWithResponse(GetStickyNoteValueBody)
    .then(data => event.reply('fromMainD', JSON.stringify({ type: "replyStickyNoteValue", cmd: true, attributes: JSON.stringify(data) })))
    .catch(err => event.reply('fromMainD', JSON.stringify({ type: "replyStickyNoteValue", cmd: false, attributes: JSON.stringify("Interner Fehler") })))
}

function checkLogin(event, loginData) {
  let headers = new fetch.Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + base64.encode(loginData.email + ":" + loginData.password));
  var raw = JSON.stringify([{ "action": "GetUserData" }]);
  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };
  fetch('https://dekinotu.myhostpoint.ch/notes/dbapi/', requestOptions).then((result) => {
    if (result.status == 200) {
      login = true
    }
    else {
      login = false
    }
    event.reply('fromMainA', JSON.stringify({ type: "replyLogin", cmd: "", attributes: JSON.stringify(login) }));
    if (loginData.remember && login == true) {
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

function checkAutoLogin(event) {
  var autoLoginData = fs.readFileSync('frontend/assets/data/data.json', { encoding: 'utf8', flag: 'r' });
  if (autoLoginData != "" && autoLoginData != null) {
    var autoLoginData = JSON.parse(autoLoginData);
    autoLoginData.remember = false;
    checkLogin(event, autoLoginData)
  }
  else {
    event.reply('fromMainA', JSON.stringify({ type: "replyLogin", cmd: "", attributes: JSON.stringify(false) }));
  }
}

function uploadNotes(event, data) {
  var FK_subject_calc
  getData("GetSubjects")
    .then(result => {
      result.forEach(subj => {
        if (subj.subjectName == data.subject) {
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
        .then(() => { event.reply('fromMainA', JSON.stringify({ type: "replyUploadNote", cmd: "true", attributes: JSON.stringify("") })); })
        .catch(err => event.reply('fromMainA', JSON.stringify({ type: "replyUploadNote", cmd: "false", attributes: JSON.stringify("Interner Fehler") })))
    })
}

function logout() {
  login_user = null;
  fs.writeFile('frontend/assets/data/data.json', "", function (err) {
    if (err) return console.log(err);
  });
}

function reloadUserData() {
  let headers = new fetch.Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Authorization', 'Basic ' + base64.encode(login_user.email + ":" + login_user.password));
  var raw = JSON.stringify([{ "action": "GetUserData" }]);
  var requestOptions = {
    method: 'POST',
    headers: headers,
    body: raw,
    redirect: 'follow'
  };
  fetch('https://dekinotu.myhostpoint.ch/notes/dbapi/', requestOptions).then((result) => {
    if (result.status == 200) {
      return result.json();
    }
  }).then(json => {
    password = login_user.password
    login_user = json
    login_user.password = password;
  }).catch(err => console.log("error in reload user data: ", err));
}

function getUserData() {
  reloadUserData();
  if (login_user == null || login_user == undefined) {
    return null;
  }
  else {
    return { id: login_user.id, username: login_user.username, email: login_user.email, email_verified: login_user.email_is_verified, profilepicture: login_user.profilepicture };
  }
}

function setUsername(event, data) {
  var newusernamebody = {
    "action": "SetUsername",
    "newusername": data.newusername,
    "password": data.password
  }
  setData(newusernamebody)
    .then(() => { event.reply('fromMainA', JSON.stringify({ type: "replyNewUsername", cmd: true, attributes: JSON.stringify("") })); logout(); })
    .catch(err => event.reply('fromMainA', JSON.stringify({ type: "replyNewUsername", cmd: false, attributes: JSON.stringify("Interner Fehler") })));
}

function setEmail(event, data) {
  var newemailbody = {
    "action": "SetEmail",
    "newemail": data.newemail,
    "password": data.password
  }
  setData(newemailbody)
    .then(() => { event.reply('fromMainA', JSON.stringify({ type: "replyNewEmail", cmd: true, attributes: JSON.stringify("") })); logout(); })
    .catch(err => event.reply('fromMainA', JSON.stringify({ type: "replyNewEmail", cmd: false, attributes: JSON.stringify("Interner Fehler") })));
}

function saveStickyNotes(event, value, id) {
  var newstickynotevaluebody = {
    "action": "SetStickyNote",
    "StickynoteID": id,
    "newvalue": value
  }
  setData(newstickynotevaluebody)
    .then(() => { event.reply('fromMainA', JSON.stringify({ type: "replyStickyNoteSaved", cmd: true, attributes: JSON.stringify(undefined) })) })
    .catch(err => { event.reply('fromMainA', JSON.stringify({ type: "replyStickyNoteSaved", cmd: false, attributes: JSON.stringify("Interner Fehler") })) })
}

function createStickyNote(event, data) {
  var createstickynoteBody = {
    "action": "CreateStickyNote",
    "title": data.title,
    "value": ""
  }
  setData(createstickynoteBody)
    .then(() => { event.reply('fromMainA', JSON.stringify({ type: "replyStickyNoteCreated", cmd: true, attributes: JSON.stringify(undefined) })) })
    .catch(err => { event.reply('fromMainA', JSON.stringify({ type: "replyStickyNoteCreated", cmd: false, attributes: JSON.stringify("Interner Fehler") })) })
}

function deleteStickyNote(event, PK_stickynote) {
  var deleteStickynoteBody = {
    "action": "DeleteStickyNote",
    "PK_stickynote": PK_stickynote
  }
  setData(deleteStickynoteBody)
    .then(() => { event.reply('fromMainA', JSON.stringify({ type: "replyStickyNoteDeleted", cmd: true, attributes: JSON.stringify(undefined) })) })
    .catch(err => { event.reply('fromMainA', JSON.stringify({ type: "replyStickyNoteDeleted", cmd: false, attributes: JSON.stringify("Interner Fehler") })) })
}

function setPassword(event, data) {
  var newpasswordbody = {
    "action": "SetPassword",
    "newpassword": data.newpassword,
    "oldpassword": data.oldpassword
  }
  setData(newpasswordbody)
    .then(() => { event.reply('fromMainA', JSON.stringify({ type: "replyNewPassword", cmd: true, attributes: JSON.stringify("") })); logout(); })
    .catch(err => event.reply('fromMainA', JSON.stringify({ type: "replyNewPassword", cmd: false, attributes: JSON.stringify("Interner Fehler") })));
}


function UploadPB_GetTmpFilePath(event) {
  dialog.showOpenDialog({ properties: ['openFile'] }).then(result => {
    allowedFileTypes = ["png", "jpg", "gif"];
    if (result.filePaths[0] != undefined) {
      if (allowedFileTypes.includes(result.filePaths[0].split(".")[(result.filePaths[0].split(".").length - 1)].toLowerCase()) && isImage(result.filePaths[0])) {
        const tmp_filePath = "frontend/assets/img/tmp_uploadPB/" + path.basename(result.filePaths[0]);
        fs.copyFile(result.filePaths[0], tmp_filePath, (err) => {
          if (err) {
            console.log("Error Found:", err);
          }
          else {
            event.reply('fromMainA', JSON.stringify({ type: "reply_UploadPB_tmpPath", cmd: true, attributes: JSON.stringify(tmp_filePath) }));
          }
        });
      }
      else {
        event.reply('fromMainA', JSON.stringify({ type: "reply_UploadPB_tmpPath", cmd: false, attributes: JSON.stringify("Diese Datei ist kein Bild") }));
      }
    } else {
      event.reply('fromMainA', JSON.stringify({ type: "reply_UploadPB_tmpPath", cmd: "quit", attributes: JSON.stringify(undefined) }));
    }
  });
}


function uploadPB(event, data) {
  const filePath = data.file;
  const fileName = data.file.replace(/^.*[\\\/]/, '');

  var uploadPBdata = {
    "action": "UploadPB_Data",
    "file": fileName,
    "x": data.x,
    "y": data.y,
    "width": data.width,
    "height": data.height,
  }

  const form = new FormData();
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileStream = fs.createReadStream(filePath);
  form.append('uploadpb', fileStream, { knownLength: fileSizeInBytes });
  form.append('uploadpb-data', JSON.stringify(uploadPBdata));

  let headers = new fetch.Headers();
  headers.append('Authorization', 'Basic ' + base64.encode(login_user.email + ":" + login_user.password));

  const options = {
    method: 'POST',
    credentials: 'include',
    headers: headers,
    body: form
  };

  fetch("https://dekinotu.myhostpoint.ch/notes/dbapi/uploadpb/", options)
    .then(res => {
      if (res.ok) {
        event.reply('fromMainC', JSON.stringify({ type: "replyPBUpload", cmd: true, attributes: "" }));
        fs.unlinkSync(filePath)
      } else {
        console.log(res);
        event.reply('fromMainC', JSON.stringify({ type: "replyPBUpload", cmd: false, attributes: JSON.stringify("Fehler beim Upload") }));
      }
    }).catch((e) => {
      event.reply('fromMainC', JSON.stringify({ type: "replyPBUpload", cmd: false, attributes: JSON.stringify("Interner Fehler") }));
    });


}

function checkMode(event) {
  if (win.isMaximized()) {
    event.reply('fromMainF', JSON.stringify({ type: "replyWinMode", cmd: "max", attributes: "" }))
  }
  else {
    event.reply('fromMainF', JSON.stringify({ type: "replyWinMode", cmd: "notMax", attributes: "" }))
  }
}

ipcMain.on("toMain", (event, command) => {
  args = JSON.parse(command);
  switch (args.type) {
    case "GetData":
      switch (args.cmd) {
        case "UserData":
          event.reply('fromMainC', JSON.stringify({ type: "replyUserData", cmd: "", attributes: JSON.stringify(getUserData()) }));
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
        case "StickyNotes":
          GetStickyNotes(event);
          break;
        case "StickyNoteValue":
          GetStickyNoteValue(event, JSON.parse(args.attributes));
          break;
        default: console.error("Unkwown Command in Messaging");
      }
      break;
    case "CheckData":
      switch (args.cmd) {
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
      switch (args.cmd) {
        case "Note":
          uploadNotes(event, JSON.parse(args.attributes))
          break;
        case "Password":
          setPassword(event, JSON.parse(args.attributes))
          break;
        case "Username":
          setUsername(event, JSON.parse(args.attributes))
          break;
        case "Email":
          setEmail(event, JSON.parse(args.attributes))
          break;
        case "UploadPB_GetTmpFilePath":
          UploadPB_GetTmpFilePath(event);
          break;
        case "UploadPB":
          uploadPB(event, JSON.parse(args.attributes))
          break;
        case "UploadPB_quit":
          try {
            fs.unlinkSync(JSON.parse(args.attributes));
          } catch (e) {
            event.reply('fromMainC', JSON.stringify({ type: "reply_PB_quit", cmd: true, attributes: JSON.stringify(undefined) }));
          }
          break;
        case "SaveStickyNotes":
          saveStickyNotes(event, args.attributes, args.additional);
          break;
        case "CreateStickyNote":
          createStickyNote(event, args.attributes);
          break;
        case "DeleteStickyNote":
          deleteStickyNote(event, JSON.parse(args.attributes));
          break;
        default: console.error("Unkwown Command in Messaging");
      }
      break;
    case "Window":
      switch (args.cmd) {
        case "Minimize":
          win.minimize();
          break;
        case "Maximize":
          win.maximize();
          break;
        case "Close":
          win.close();
          break;
        case "ExitMax":
          win.unmaximize()
          break;
        case "GetMode":
          checkMode(event);
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
