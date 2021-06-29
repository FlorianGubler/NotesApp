function getNotesData() {
    document.getElementById("loading").style.display = "block";
    window.api.send("toMain", JSON.stringify({ type: 'GetData', cmd: 'Subjects', attributes: "" }));
    window.api.receive("fromMainB", (args) => {
        if (args.type == "replySubjects") {
            var response = JSON.parse(args.attributes);
            var subjects = [];
            var endnotes = [];
            response.forEach(subj => {
                if (subj.schoolName == "LAP") {
                    subjects[subj.additionalTag] = [];
                    endnotes[subj.additionalTag] = [];
                    endnotes[subj.additionalTag + "_end"] = 0;
                }
            });
            response.forEach(subj => {
                if (subj.schoolName == "LAP") {
                    subjects[subj.additionalTag][subj.subjectName] = [];
                    endnotes[subj.additionalTag][subj.subjectName] = 0;
                }
            });
            window.api.send("toMain", JSON.stringify({ type: 'GetData', cmd: 'NotesfromUser', attributes: "" }));
            window.api.receive("fromMainA", (args) => {
                if (args.type == "replyUserNotes") {
                    var response = JSON.parse(args.attributes);
                    response.forEach(note => {
                        if (note.schoolName == "LAP") {
                            subjects[note.additionalTag][note.subjectName].push({ value: note.value, examName: note.examName });
                        }
                    });
                    for (var tag in subjects) {
                        var div = document.createElement("div")
                        div.classList.add("table-container")
                        var table = document.createElement("table");
                        var h3 = document.createElement("h3");
                        var tr;
                        var th;
                        var td;
                        h3.innerHTML = tag;
                        for (var subj in subjects[tag]) {
                            var tr = document.createElement("tr");
                            th = document.createElement("th");
                            th.innerHTML = subj;
                            tr.appendChild(th);
                            countsubj = 0;
                            counter = 0;
                            subjects[tag][subj].forEach(note => {
                                if (note.value != 0) {
                                    endnotes[tag][subj] += parseFloat(note.value);
                                    countsubj++;
                                }
                                var td = document.createElement("td");
                                td.innerHTML = note.value;
                                td.style.position = "relative";
                                notetitle = td.appendChild(document.createElement("p"));
                                notetitle.innerHTML = note.examName;
                                notetitle.className = "lap-note-title";
                                td.addEventListener("mouseover", e => {
                                    td.getElementsByClassName("lap-note-title")[0].style.display = "block";
                                }, false);
                                td.addEventListener("mouseout", e => {
                                    td.getElementsByClassName("lap-note-title")[0].style.display = "none";
                                }), false;
                                if (note.value > 4) {
                                    td.classList.add("grade-good");
                                }
                                if (note.value < 4 && note.value != 0) {
                                    td.classList.add("grade-bad");
                                }
                                td.name = note.examName;
                                tr.appendChild(td);
                                counter++;
                            });
                            if (countsubj != 0) {
                                endnotes[tag][subj] = Math.round((endnotes[tag][subj] / countsubj) * 2) / 2;
                                tagcount = 0;
                            }
                            table.appendChild(tr);
                        }
                        for (var endsubj in endnotes[tag]) {
                            if (endnotes[tag][endsubj] != 0) {
                                endnotes[tag + "_end"] += endnotes[tag][endsubj];
                                tagcount++;
                            }
                        }
                        endnotes[tag + "_end"] = endnotes[tag + "_end"] / tagcount;

                        div.id = tag.replace(/\s/g, "");
                        div.appendChild(h3)
                        div.appendChild(table)
                        if (tag != "Berufsfachschule Module" && document.getElementById("container-notes-form") == undefined) {
                            div2 = document.createElement("div");
                            div2.id = "container-notes-form";
                            div2.appendChild(div);
                            document.getElementById("table-notes-norm").appendChild(div2);
                        }
                        else if (tag != "Berufsfachschule Module" && document.getElementById("container-notes-form") != undefined) {
                            document.getElementById("container-notes-form").appendChild(div)
                        }
                        else {
                            document.getElementById("table-notes-norm").appendChild(div);
                        }
                    }
                    endnotes["ÜK Module_end"] = Math.round(endnotes["ÜK Module_end"] * 2) / 2;
                    endnotes["Berufsfachschule Module_end"] = Math.round(endnotes["Berufsfachschule Module_end"] * 2) / 2;

                    checkinf = false;
                    checkipa = false;

                    //Calc intermediate notes
                    if (endnotes["ÜK Module_end"] != 0 && endnotes["Berufsfachschule Module_end"] != 0) {
                        endnotes["Informatikkompetenzen"] = endnotes["ÜK Module_end"] * 0.2 + endnotes["Berufsfachschule Module_end"] * 0.8;
                    }
                    else if (endnotes["ÜK Module_end"] != 0 && endnotes["Berufsfachschule Module_end"] == 0) {
                        endnotes["Informatikkompetenzen"] = endnotes["ÜK Module_end"];
                    }
                    else if (endnotes["ÜK Module_end"] == 0 && endnotes["Berufsfachschule Module_end"] != 0) {
                        endnotes["Informatikkompetenzen"] = endnotes["Berufsfachschule Module_end"];
                    }
                    else {
                        checkinf = true;
                    }
                    endnotes["Informatikkompetenzen"] = Math.round(endnotes["Informatikkompetenzen"] * 10) / 10;

                    if (endnotes["IPA Abschlussprüfung_end"] != 0) {
                        endnotes["IPA Abschlussprüfung_end"] = Math.round(endnotes["IPA Abschlussprüfung"]["Resultat der Arbeit"] * 0.5 * 2) / 2 + Math.round(endnotes["IPA Abschlussprüfung"]["Dokumentation"] * 0.25 * 2) / 2 + Math.round(endnotes["IPA Abschlussprüfung"]["Fachgespräch und Präsentation"] * 0.25 * 2) / 2;
                        endnotes["IPA Abschlussprüfung_end"] = Math.round(endnotes["IPA Abschlussprüfung_end"] * 10) / 10;
                    }
                    else {
                        checkipa = true;
                    }


                    //Calc Final Grade
                    if (!checkinf && !checkipa) {
                        endnotes["final"] = (endnotes["Informatikkompetenzen"] + endnotes["IPA Abschlussprüfung"]) / 2
                    }
                    else if (checkinf && !checkipa) {
                        endnotes["final"] = endnotes["IPA Abschlussprüfung"];
                    }
                    else if (!checkinf && checkipa) {
                        endnotes["final"] = endnotes["Informatikkompetenzen"];
                    }

                    drawSplit();

                    showEnd("Endnote ÜK Module", endnotes["ÜK Module_end"]);
                    showEnd("Endnote BS Module", endnotes["Berufsfachschule Module_end"]);

                    drawSplit();

                    showEnd("Endnote Informatikkompetenzen", endnotes["Informatikkompetenzen"]);
                    showEnd("Endnote IPA Abschlussprüfung", endnotes["IPA Abschlussprüfung_end"]);

                    drawSplit();

                    showEnd("Endnote Lehrabschluss", endnotes["final"]);

                    showbs();
                    document.getElementById("loading").style.display = "none";
                }
            });
        }
    });
}
function showbs() {
    document.getElementById("container-notes-form").style.display = "none";
    document.getElementById("BerufsfachschuleModule").style.display = "block";

    document.getElementById("bs-semester").classList.add("active-semester");
    document.getElementById("uek-lap-semester").classList.remove("active-semester");
}
function showuek() {
    document.getElementById("container-notes-form").style.display = "block";
    document.getElementById("BerufsfachschuleModule").style.display = "none";

    document.getElementById("uek-lap-semester").classList.add("active-semester");
    document.getElementById("bs-semester").classList.remove("active-semester");
}

function drawSplit() {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.innerHTML = "<div id='splitline'></div>";
    td.colSpan = "2";
    tr.appendChild(td);
    document.getElementById("table-notes-end").appendChild(tr);
}
function showEnd(title, value) {
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    th.innerHTML = title;
    td.innerHTML = value;
    if (value > 4) {
        td.classList.add("grade-good");
    }
    if (value < 4 && value != 0) {
        td.classList.add("grade-bad");
    }
    tr.appendChild(th);
    tr.appendChild(td);
    document.getElementById("table-notes-end").appendChild(tr);
}