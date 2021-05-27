function submitNote() {
    document.getElementById("loading").style.display = "block";
    var examTagVal = document.getElementById("get-examTag").value;
    var noteVal = document.getElementById("get-note").value;
    var subjectVal = document.getElementById("select-subject").value;
    var semesterVal = document.getElementById("select-semester").value.split(".")[0];

    window.api.send("toMain", JSON.stringify({ type: 'UploadData', cmd: 'Note', attributes: JSON.stringify({ examTag: examTagVal, note: noteVal, subject: subjectVal, semester: semesterVal }) }));
    window.api.receive("fromMainA", (args) => {
        if (args.type == "replyUploadNote") {
            if (args.cmd) {
                document.getElementById("login-response-true").style.display = "block";
                document.getElementById("select-subject").selectedIndex = 0;
                document.getElementById("select-semester").selectedIndex = 0;
                document.getElementById("get-note").value = "";
                document.getElementById("get-examTag").value = "";
            }
            else {
                document.getElementById("login-response-false").style.display = "block";
            }
        }
        document.getElementById("loading").style.display = "none";
    });
}
function checkInput() {
    var dropdown = document.getElementById('select-subject');

    var label = dropdown.options[dropdown.selectedIndex].parentElement.label;

    if (label != "BMS") {
        document.getElementById('select-semester').style.display = "none";
        document.getElementById('select-semester').removeAttribute("required");
    }
    else {
        document.getElementById('select-semester').style.display = "block";
        document.getElementById('select-semester').required = true;
    }
}