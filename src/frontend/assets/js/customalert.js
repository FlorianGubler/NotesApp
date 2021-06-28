// window.alert = function (txt) {
//     createCustomAlert(txt);
// }

function createCustomAlert(txt) {
    if (document.getElementById("customAlertContainer")) return;

    container = document.body.appendChild(document.createElement("div"));
    container.id = "customAlertContainer";

    titlecontainer = container.appendChild(document.createElement("div"));
    titlecontainer.id = "customerAlertTitleContainer";

    titletext = titlecontainer.appendChild(document.createElement("p"));
    titletext.innerHTML = "ProMarks Information";

    bodycontainer = container.appendChild(document.createElement("div"));
    bodycontainer.id = "customAlertBodyContainer";

    informationicon = bodycontainer.appendChild(document.createElement("p"));
    informationicon.innerHTML = '<i class="fas fa-exclamation"></i>';
    informationicon.id = "customAlertBodyIcon";

    informationtext = bodycontainer.appendChild(document.createElement("p"));
    informationtext.innerHTML = txt;
    informationtext.id = "customAlertBodyText";

    footercontainer = container.appendChild(document.createElement("div"));
    footercontainer.id = "customAlertFooterContainer";

    footerButton = footercontainer.appendChild(document.createElement("button"));
    footerButton.innerHTML = "Ok";

    footerButton.onclick = function () { removeCustomAlert(); return false; }
}

// removes the custom alert from the DOM
function removeCustomAlert() {
    document.body.removeChild(document.getElementById("customAlertContainer"));
}