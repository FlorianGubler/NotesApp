function getNotesData(semester) {
    document.getElementById("loading").style.display = "block";
    window.api.send("toMain", JSON.stringify({ type: 'GetData', cmd: 'Subjects', attributes: "" }));
    window.api.receive("fromMainB", (args) => {
        if (args.type == "replySubjects") {
            var response = JSON.parse(args.attributes);
            var subjects = [];
            var endnotes = [];
            response.forEach(subj => {
                if (subj.schoolName == "BMS") {
                    subjects[subj.subjectName] = [];
                    endnotes[subj.subjectName] = 0;
                }
            });
            window.api.send("toMain", JSON.stringify({ type: 'GetData', cmd: 'NotesfromUser', attributes: "" }));
            window.api.receive("fromMainA", (args) => {
                if (args.type == "replyUserNotes") {
                    var response = JSON.parse(args.attributes);
                    response.forEach(note => {
                        if (note.schoolName == "BMS") {
                            if (note.semesterTag == semester || note.FK_semester == semester) {
                                subjects[note.subjectName].push({ value: note.value, examName: note.examName });
                            }
                        }
                    });
                    var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    td.innerHTML = "<div id='splitline'></div>";
                    td.colSpan = "2";
                    tr.appendChild(td);
                    document.getElementById("table-notes-end").appendChild(tr);
                    for (var subj in subjects) {
                        var tr = document.createElement("tr");
                        var th = document.createElement("th");
                        th.innerHTML = subj;
                        tr.appendChild(th);
                        subjects[subj].forEach(note => {
                            var td = document.createElement("td");
                            td.innerHTML = note.value;
                            td.style.position = "relative";
                            notetitle = td.appendChild(document.createElement("p"));
                            MAX_EXAM_TITLE_LENGTH = 20;
                            if(note.examName.length > MAX_EXAM_TITLE_LENGTH){
                                notetitle.innerHTML = note.examName.slice(0, MAX_EXAM_TITLE_LENGTH) + "...";
                            } else {
                                notetitle.innerHTML = note.examName;
                            }
                            notetitle.className = "bms-note-title";
                            td.addEventListener("mouseover", e => {
                                td.getElementsByClassName("bms-note-title")[0].style.display = "block";
                            });
                            td.addEventListener("mouseout", e => {
                                td.getElementsByClassName("bms-note-title")[0].style.display = "none";
                            });
                            if (note.value > 4) {
                                td.classList.add("grade-good");
                            }
                            else if (note.value < 4) {
                                td.classList.add("grade-bad");
                            }
                            tr.appendChild(td);
                        })
                        document.getElementById("table-notes-norm").appendChild(tr);
                    };
                    var subjectcount = 0;
                    var endnoteLast = 0;
                    //Make Endnotes
                    for (var subj in subjects) {
                        endnotes[subj + "_count"] = 0;
                        endnotes[subj] = 0;
                        subjects[subj].forEach(subje => {
                            endnotes[subj] += parseFloat(subje.value);
                            if (subje.value != 0) {
                                endnotes[subj + "_count"]++;
                            }
                        })
                        if (subj.split(" ")[1] != "Vokabeln") {
                            subjectcount++;
                        }
                    }
                    //Add Vokabel endnotes
                    for (var subj in subjects) {
                        if (subj.split(" ")[1] == "Vokabeln") {
                            for (endnote in endnotes) {
                                if (endnote == subj.split(" ")[0]) {
                                    if (endnotes[subj + "_count"] != 0) {
                                        endnotes[subj] = endnotes[subj] / endnotes[subj + "_count"];
                                    }
                                    endnotes[endnote] += endnotes[subj]
                                    endnotes[endnote + "_count"]++;
                                }
                            }
                        }
                    }
                    //calc Endnotes & display them
                    for (var subj in subjects) {
                        if (endnotes[subj + "_count"] != 0) {
                            endnotes[subj] = endnotes[subj] / endnotes[subj + "_count"];
                        }
                        endnotes[subj] = Math.round(endnotes[subj] * 2) / 2;
                        if (subj.split(" ")[1] != "Vokabeln") {
                            if (endnotes[subj] != 0) {
                                endnoteLast += endnotes[subj];
                            }
                            else {
                                subjectcount--;
                            }
                            tr = document.createElement("tr");
                            tdh = document.createElement("td");
                            tdh.innerHTML = "Endnote " + subj;
                            tr.appendChild(tdh);
                            tdv = document.createElement("td");
                            tdv.innerHTML = endnotes[subj];
                            if (endnotes[subj] > 4) {
                                tdv.classList.add("grade-good");
                            }
                            else if (endnotes[subj] < 4 && endnotes[subj] != 0) {
                                tdv.classList.add("grade-bad");
                            }
                            tr.appendChild(tdv);
                            document.getElementById("table-notes-end").appendChild(tr);
                        }

                    }
                    var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    td.innerHTML = "<div id='splitline'></div>";
                    td.colSpan = "2";
                    tr.appendChild(td);
                    document.getElementById("table-notes-end").appendChild(tr);

                    if (subjectcount != 0) {
                        endnoteLast = endnoteLast / subjectcount;
                    }

                    var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    td.innerHTML = "Endnote Gesamt";
                    tr.appendChild(td);
                    var tde = document.createElement("td");
                    tde.innerHTML = endnoteLast;
                    if (endnoteLast > 4) {
                        tde.classList.add("grade-good");
                    }
                    else if (endnoteLast < 4 && endnoteLast != 0) {
                        tde.classList.add("grade-bad");
                    }
                    tr.appendChild(tde);
                    document.getElementById("table-notes-end").appendChild(tr);
                }
                document.getElementById("loading").style.display = "none";
            });
        }
    });
    if (document.getElementById("old-semster-choosen-style") != null) {
        document.getElementById("old-semster-choosen-style").remove();
    }
    if (document.getElementsByClassName("active-semester")[0] != null) {
        document.getElementsByClassName("active-semester")[0].classList.remove("active-semester")
    }
    if (Number.isInteger(semester)) {
        newstyle = document.createElement("style");
        semesterNTH = semester + 1;
        newstyle.innerHTML = ".semester-choose:nth-child(" + semesterNTH + "){background-color: #343a40}";
        newstyle.id = "old-semster-choosen-style"
        document.body.appendChild(newstyle);
    }
    else {
        var semesterarr = Array.from(document.getElementsByClassName("semester-choose"))
        semesterarr.forEach(el => {
            if (el.innerHTML == semester) {
                el.classList.add("active-semester");
            }
        })
    }
}