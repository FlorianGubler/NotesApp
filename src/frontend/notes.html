<div id="includedContent"></div>
<div id="loading"></div>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/header@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/list@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/simple-image@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/embed@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/table@latest"></script>
<script src="assets/js/sleep.js"></script>
<script>$.ajaxPrefilter(function (options, originalOptions, jqXHR) { options.async = true; });</script>

<script>
    $(function () {
        $("#loading").load("loading.html");
    });
    $(function () {
        $("#includedContent").load("navbar.html");
    });
</script>
<link rel="stylesheet" href="assets/css/notes.css">
<div class="content-title-bar-container">
    <div style="display: inherit;">
        <h1>Notizen</h1>
        <button id="list-notes-expand" onclick="epxandNotesList();"><i class="fas fa-chevron-down"></i></button>
    </div>
    <div style="display: inherit;" class="config-editor-container">
        <div id="loading-container">
            <div class="loader"></div>
        </div>
        <button id="autosave-off-save-editor" onclick="saveStickyNote(this.name);">Speichern</button>
        <div class="set-autosave-container">
            <input type="checkbox" id="set-autosave" onchange="set_autosave(this);" checked><label for="set-autosave">
                Auto Save</label>
        </div>
        <button onclick="openCreateStickyNote();" class="create-stickyNote"><i
                class="fab fa-creative-commons-share"></i></button>
    </div>
</div>
<div id="no-stickynotes-found">
    <div class="no-stickynotes-found-imgcontainer">
        <img src="assets/img/nothing-found.png" alt="Nichts gefunden">
    </div>
    <p>Hier ist noch nichts. Klicke oben rechts um eine neue Notiz zu erstellen</p>
</div>
<div id="create-stickynote-container">
    <div class="create-stickynote-header">
        <h2>Neue Notiz erstellen</h2>
        <p onclick="openCreateStickyNote();"><i class="fas fa-times"></i></p>
    </div>
    <div class="create-stickynote-body">
        <div>
            <label>Name </label>
            <input type="text" id="create-stickynote-newtitle" value="Neue Notiz">
        </div>
        <button onclick="createStickyNote();" id="create-stickynote-submitbtn">Erstellen</button>
    </div>
</div>
<div id="change-stickynote-title-container">
    <div class="change-stickynote-title-header">
        <h2>Notiztitel ändern</h2>
        <p onclick="openEditStickyNoteTitle();"><i class="fas fa-times"></i></p>
    </div>
    <div class="change-stickynote-title-body">
        <div>
            <label>Neuer Titel </label>
            <input type="text" id="change-stickynote-title-newtitle">
            <input type="hidden" id="change-stickynote-title-id">
        </div>
        <button onclick="ChangeStickyNoteTitle();" id="change-stickynote-title-submitbtn">Erstellen</button>
    </div>
</div>
<div class="content-container-stickynotes">
    <div id="list-notes-container"></div>
    <div id="notes-editor-container">
        <div id="editorjs">

        </div>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
<script>
    let StickyNoteList_expanded = true;
    let current_editor;
    let autosave = true;

    document.getElementById("loading").style.display = "block";

    document.getElementById("change-stickynote-title-newtitle").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            document.getElementById("create-stickynote-submitbtn").click();
        }
    });

    document.getElementById("change-stickynote-title-newtitle").addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            document.getElementById("change-stickynote-title-submitbtn").click();
        }
    });

    window.api.send("toMain", JSON.stringify({ type: 'GetData', cmd: 'UserData', attributes: "" }));
    window.api.receive("fromMainC", (args) => {
        if (args.type == "replyUserData") {
            var response = JSON.parse(args.attributes);
            if (response != null) {
                user_login = response;
                x = document.getElementsByClassName("use-user-name");
                for (var i = 0; i < x.length; i++) {
                    x[i].innerHTML = response.username;
                }
                x = document.getElementsByClassName("use-user-email");
                for (var i = 0; i < x.length; i++) {
                    x[i].innerHTML = "(" + response.email + ")";
                    if (response.email_verified == 0) {
                        x[i].innerHTML += "<p style='display: inline; color: orange;'><i style='color: inherit;' class='fas fa-exclamation-triangle'></i> Not verified</p>";
                    }
                }
                document.getElementById("loading").style.display = "none";
            }

        }
    });
    window.api.send("toMain", JSON.stringify({ type: 'GetData', cmd: 'StickyNotes', attributes: "" }));
    window.api.receive("fromMainD", (args) => {
        if (args.type == "replyStickyNotes") {
            StickyNotes = JSON.parse(args.attributes);
            if (StickyNotes.length > 0) {
                StickyNotes.forEach(note => {
                    StickyNoteListEl = document.getElementById("list-notes-container").appendChild(document.createElement("div"));
                    StickyNoteListEl.onclick = function (event) {
                        showStickNote(note, this);
                    }
                    StickyNoteListEl.onmouseover = function (event) {
                        this.getElementsByClassName("StickyNoteListElActionsContainer")[0].style.display = "flex";
                    }
                    StickyNoteListEl.onmouseout = function (event) {
                        this.getElementsByClassName("StickyNoteListElActionsContainer")[0].style.display = "none";
                    }
                    StickyNoteListEl.className = "stickynotelistelement";

                    StickyNoteListElIcon = StickyNoteListEl.appendChild(document.createElement("div"));
                    StickyNoteListElIcon.innerHTML = '<i class="far fa-sticky-note"></i>';
                    StickyNoteListElIcon.className = "stickynotelistelementIcon";

                    StickyNoteListElActionsContainer = StickyNoteListEl.appendChild(document.createElement("div"));
                    StickyNoteListElActionsContainer.classList.add("StickyNoteListElActionsContainer");
                    StickyNoteListElActionsContainer.classList.add("StickyNoteListElActionsContainer_ex");

                    StickyNoteListElDelete = StickyNoteListElActionsContainer.appendChild(document.createElement("div"));
                    StickyNoteListElDelete.innerHTML = '<i class="far fa-trash-alt"></i>';
                    StickyNoteListElDelete.className = "stickynotelistelementDelete";

                    StickyNoteListElDelete.onclick = function (event) {
                        deleteStickyNote(note.id);
                    }

                    StickyNoteListElEdit = StickyNoteListElActionsContainer.appendChild(document.createElement("div"));
                    StickyNoteListElEdit.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                    StickyNoteListElEdit.className = "stickynotelistelementEdit";

                    StickyNoteListElEdit.onclick = function (event) {
                        openEditStickyNoteTitle(note.id, note.title);
                    }

                    StickyNoteListElContainer = StickyNoteListEl.appendChild(document.createElement("div"));
                    StickyNoteListElContainer.className = "stickynotelistelementContainer";

                    stickNoteListElTitle = StickyNoteListElContainer.appendChild(document.createElement("p"));
                    MAX_NOTES_TITLE_LENGTH = 10;
                    if(note.title.length > MAX_NOTES_TITLE_LENGTH){
                        stickNoteListElTitle.innerHTML = note.title.slice(0, MAX_NOTES_TITLE_LENGTH) + "...";
                    } else {
                        stickNoteListElTitle.innerHTML = note.title;
                    }
                    stickNoteListElTitle.className = "stickynotelistelementTitle";

                    stickNoteListElTime = StickyNoteListElContainer.appendChild(document.createElement("p"));
                    stickNoteListElTime.innerHTML = note.createdate;
                    stickNoteListElTime.className = "stickynotelistelementTime";
                });
                document.getElementById("loading").style.display = "none";
                set_autosave();
                showStickNote(StickyNotes[0], document.getElementsByClassName("stickynotelistelement")[0]);
            } else {
                noStickyNotesFound();
            }
        }
    });
    function showStickNote(stickynote, el) {
        stickynotelistelements = document.getElementsByClassName("stickynotelistelement");
        for (let i = 0; i < stickynotelistelements.length; i++) {
            stickynotelistelements[i].classList.remove("stickynotelistelement-active");
        }
        el.classList.add("stickynotelistelement-active");
        if (current_editor != undefined) {
            current_editor.destroy();
        }
        window.api.send("toMain", JSON.stringify({ type: 'GetData', cmd: 'StickyNoteValue', attributes: stickynote.id }));
        window.api.receive("fromMainD", (args) => {
            if (args.type == "replyStickyNoteValue") {
                if (args.cmd) {
                    responseValue = JSON.parse(args.attributes);
                    try {
                        stickynote.value = JSON.parse(responseValue.value);
                    } catch (e) {
                        stickynote.value = "";
                    }
                    current_editor = new EditorJS({
                        tools: {
                            header: Header,
                            list: List,
                            embed: Embed,
                            image: SimpleImage,
                            table: Table
                        },
                        holder: 'editorjs',
                        data: stickynote.value,
                        autofocus: true,
                        onChange: () => {
                            if (autosave) {
                                saveStickyNote(stickynote.id);
                            }
                        }
                    });
                    document.getElementById("autosave-off-save-editor").name = stickynote.id;
                }
            }
        });
    }
    function saveStickyNote(StickyNote_ID) {
        document.getElementById("loading-container").style.display = "flex";
        current_editor.save().then((outputData) => {
            window.api.send("toMain", JSON.stringify({ type: 'UploadData', cmd: 'SaveStickyNotes', attributes: JSON.stringify(outputData), additional: StickyNote_ID }));
            window.api.receive("fromMainA", (args) => {
                if (args.type == "replyStickyNoteSaved") {
                    if (args.cmd) {
                        loadingiconAsync();
                    }
                    else {
                        console.log(JSON.parse(args.attributes));
                    }
                }
            });
        }).catch((error) => {
            console.log('Saving failed: ', error);
        });
    }
    function openCreateStickyNote() {
        el = document.getElementById("create-stickynote-container");
        if (el.style.display == "none" || el.style.display == "") {
            el.style.display = "flex";
        }
        else {
            el.style.display = "none";
        }
    }
    function createStickyNote() {
        data = {
            title: document.getElementById("create-stickynote-newtitle").value
        }
        window.api.send("toMain", JSON.stringify({ type: 'UploadData', cmd: 'CreateStickyNote', attributes: data }));
        window.api.receive("fromMainA", (args) => {
            if (args.type == "replyStickyNoteCreated") {
                if (args.cmd) {
                    location.reload();
                }
                else {
                    console.log(JSON.parse(args.attributes));
                }
            }
        })
    }
    function deleteStickyNote(PK_stickynote) {
        window.api.send("toMain", JSON.stringify({ type: 'UploadData', cmd: 'DeleteStickyNote', attributes: JSON.stringify(PK_stickynote) }));
        window.api.receive("fromMainA", (args) => {
            if (args.type == "replyStickyNoteDeleted") {
                if (args.cmd) {
                    location.reload();
                }
                else {
                    console.log(JSON.parse(args.attributes));
                }
            }
        })
    }
    function epxandNotesList() {
        if (StickyNoteList_expanded) {
            StickyNoteList_expanded = false;
            document.getElementById("list-notes-container").style.width = "50px";
            document.getElementById("list-notes-expand").style.transform = "rotate(180deg)";
            document.getElementById("notes-editor-container").style.width = "calc(100% - 50px)";

            noteInfos = document.getElementsByClassName("stickynotelistelementContainer");
            for (let i = 0; i < noteInfos.length; i++) {
                noteInfos[i].style.display = "none";
            }

            deleletButtons = document.getElementsByClassName("StickyNoteListElActionsContainer");
            for (let i = 0; i < deleletButtons.length; i++) {
                deleletButtons[i].classList.remove("StickyNoteListElActionsContainer_ex");
                deleletButtons[i].classList.add("StickyNoteListElActionsContainer_notex");
            }
        }
        else {
            StickyNoteList_expanded = true;
            document.getElementById("list-notes-container").style.width = "250px";
            document.getElementById("list-notes-expand").style.transform = "rotate(360deg)";
            document.getElementById("notes-editor-container").style.width = "calc(100% - 50px)";

            noteInfos = document.getElementsByClassName("stickynotelistelementContainer");
            for (let i = 0; i < noteInfos.length; i++) {
                noteInfos[i].style.display = "block";
            }

            deleletButtons = document.getElementsByClassName("StickyNoteListElActionsContainer");
            for (let i = 0; i < deleletButtons.length; i++) {
                deleletButtons[i].classList.add("StickyNoteListElActionsContainer_ex");
                deleletButtons[i].classList.remove("StickyNoteListElActionsContainer_notex");
            }
        }
    }
    function set_autosave() {
        el = document.getElementById("set-autosave");
        if (el.checked) {
            autosave = true;
        }
        else {
            autosave = false;
        }
    }
    function openEditStickyNoteTitle(id = null, title = null) {
        el = document.getElementById("change-stickynote-title-container");
        if (el.style.display == "none" || el.style.display == "") {
            document.getElementById("change-stickynote-title-id").value = id;
            document.getElementById("change-stickynote-title-newtitle").value = title;
            el.style.display = "flex";
        }
        else {
            el.style.display = "none";
        }
    }
    function ChangeStickyNoteTitle() {
        stickynoteID = document.getElementById("change-stickynote-title-id").value;
        newtitle = document.getElementById("change-stickynote-title-newtitle").value;

        window.api.send("toMain", JSON.stringify({ type: 'UploadData', cmd: 'ChangeStickyNoteTitle', attributes: JSON.stringify({ newTitle: newtitle, stickynoteID: stickynoteID }) }));
        window.api.receive("fromMainD", (args) => {
            if (args.type == "replyStickyNoteTitleChange") {
                if (args.cmd) {
                    location.reload();
                }
                else {
                    console.log(JSON.parse(args.attributes));
                }
            }
        })

        openEditStickyNoteTitle();
    }
    function noStickyNotesFound() {
        document.getElementsByClassName("set-autosave-container")[0].style.display = "none";
        document.getElementById("autosave-off-save-editor").style.display = "none";

        document.getElementById("no-stickynotes-found").style.display = "flex";
    }
</script>