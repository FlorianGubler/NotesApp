function getNotesData(){
    document.getElementById("loading").style.display = "block";
    window.api.send("toMain", JSON.stringify({type: 'GetData', cmd: 'Subjects', attributes: ""}));
    window.api.receive("fromMainB", (args) => {
        if(args.type == "replySubjects"){
            var response = JSON.parse(args.attributes);
            var subjects = [];
            var endnotes = [];
            response.forEach(subj => {
                if(subj.schoolName == "LAP"){
                    subjects[subj.additionalTag] = [];
                    endnotes[subj.additionalTag] = [];
                    endnotes[subj.additionalTag+"_end"] = 0;
                }
            });
            response.forEach(subj => {
                if(subj.schoolName == "LAP"){
                    subjects[subj.additionalTag][subj.subjectName] = [];
                    endnotes[subj.additionalTag][subj.subjectName] = 0;
                }
            });
            window.api.send("toMain", JSON.stringify({type: 'GetData', cmd: 'NotesfromUser', attributes: ""}));
            window.api.receive("fromMainA", (args) => {
                if(args.type == "replyUserNotes"){
                    var response = JSON.parse(args.attributes);
                    response.forEach(note => {
                        if(note.schoolName == "LAP"){
                            subjects[note.additionalTag][note.subjectName].push({value: note.value, examName: note.examName});
                        }
                    });
                    var count;
                    var counttag;
                    var countipa = 0;
                    var countend = 0;
                    for(var tag in subjects){
                        var div = document.createElement("div")
                        div.classList.add("table-container")
                        var table = document.createElement("table");
                        var h3 = document.createElement("h3");
                        var tr;
                        var th;
                        var td;
                        h3.innerHTML = tag;
                        counttag = 0;
                        for(var subj in subjects[tag]){
                            var tr = document.createElement("tr");
                            th = document.createElement("th");
                            th.innerHTML = subj;
                            tr.appendChild(th);
                            count = 0;
                            subjects[tag][subj].forEach(note => {
                                if(tag == "IPA Abschlussprüfung"){
                                    ountipa++;
                                }
                                count++;
                                td = document.createElement("td");
                                td.innerHTML = note.value;
                                if(note.value > 4){
                                    td.classList.add("grade-good");
                                }
                                if(note.value < 4 && note.value != 0){
                                    td.classList.add("grade-bad");
                                }
                                endnotes[tag][subj] += note.value;
                                td.name = note.examName;
                                tr.appendChild(td);
                            });
                            if(count != 0){
                                endnotes[tag][subj] = Math.round((endnotes[tag][subj] / count)*10)/10;
                                endnotes[tag+"_end"] += endnotes[tag][subj];
                                counttag++;
                            }
                            table.appendChild(tr);
                        }
                        if (counttag != 0){
                            endnotes[tag+"_end"] = Math.round((endnotes[tag+"_end"] / counttag)*10)/10
                        }
                        else{
                            endnotes[tag+"_end"] += 0
                        }
                        div.id = tag.replace(/\s/g, "");
                        div.appendChild(h3)
                        div.appendChild(table)
                        if(tag != "Berufsfachschule Module" && document.getElementById("container-notes-form") == undefined){
                            div2 = document.createElement("div");
                            div2.id = "container-notes-form";
                            div2.appendChild(div);
                            document.getElementById("table-notes-norm").appendChild(div2);
                        }
                        else if(tag != "Berufsfachschule Module" && document.getElementById("container-notes-form") != undefined){
                            document.getElementById("container-notes-form").appendChild(div)
                        }
                        else{
                            document.getElementById("table-notes-norm").appendChild(div);
                        }
                    }
                    console.log(endnotes)
                    var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    td.innerHTML = "<div id='splitline'></div>";
                    td.colSpan = "2";
                    tr.appendChild(td);
                    document.getElementById("table-notes-end").appendChild(tr);

                    for(tag in subjects){
                        var tr = document.createElement("tr");
                        var th = document.createElement("th");
                        th.innerHTML = tag
                        var td = document.createElement("td");
                        td.innerHTML = endnotes[tag+"_end"];
                        if(endnotes[tag+"_end"] > 4){
                            td.classList.add("grade-good");
                        }
                        if(endnotes[tag+"_end"] < 4 && endnotes[tag+"_end"] != 0){
                            td.classList.add("grade-bad");
                        }
                        tr.appendChild(th);
                        tr.appendChild(td);
                        document.getElementById("table-notes-end").appendChild(tr);
                    }                           
                    
                    //FinalGrade
                    var finalgradeModules = 0;
                    if(endnotes["ÜK Module_end"] != 0 && endnotes["Berufsfachschule Module_end"] != 0){
                        finalgradeModules = (((Math.round(endnotes["ÜK Module_end"]*2)/2)*0.2) + ((Math.round(endnotes["Berufsfachschule Module_end"]*2)/2)*0.8));
                    }
                    else{
                        finalgradeModules = (Math.round(endnotes["Berufsfachschule Module_end"]*2)/2) + (Math.round(endnotes["ÜK Module_end"]*2)/2);    
                    }
                    finalgradeModules = Math.round(finalgradeModules*10)/10;

                    //Check if something is 0
                    endnotes["IPA Abschlussprüfung_end"] = (Math.round(endnotes["IPA Abschlussprüfung"]["Resultat der Arbeit"]*2)/2)*0.5 +  (Math.round(endnotes["IPA Abschlussprüfung"]["Dokumentation"]*2)/2)*0.25 +  (Math.round(endnotes["IPA Abschlussprüfung"]["Fachgespräch und Präsentation"]*2)/2)*0.25 / countipa;
                    endnotes["IPA Abschlussprüfung_end"] = Math.round(endnotes["IPA Abschlussprüfung_end"]*10)/10;

                    var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    td.innerHTML = "<div id='splitline'></div>";
                    td.colSpan = "2";
                    tr.appendChild(td);
                    document.getElementById("table-notes-end").appendChild(tr);

                    //Mini Final Grades
                    var tr = document.createElement("tr");
                    var th = document.createElement("th");
                    th.innerHTML = "Endnote Abschlussprüfung";
                    tr.appendChild(th);
                    var td = document.createElement("td");
                    td.innerHTML = endnotes["IPA Abschlussprüfung_end"]
                    if(endnotes["IPA Abschlussprüfung_end"] > 4){
                        td.classList.add("grade-good");
                    }
                    else if(endnotes["IPA Abschlussprüfung_end"] < 4 && endnotes["IPA Abschlussprüfung_end"] != 0){
                        td.classList.add("grade-bad");
                    }
                    tr.appendChild(td);
                    document.getElementById("table-notes-end").appendChild(tr);

                    var tr = document.createElement("tr");
                    var th = document.createElement("th");
                    th.innerHTML = "Endnote Informatikkompentenzen";
                    tr.appendChild(th);
                    var td = document.createElement("td");
                    td.innerHTML = finalgradeModules
                    if(finalgradeModules > 4){
                        td.classList.add("grade-good");
                    }
                    else if(finalgradeModules < 4 && finalgradeModules != 0){
                        td.classList.add("grade-bad");
                    }
                    tr.appendChild(td);
                    document.getElementById("table-notes-end").appendChild(tr);

                    var tr = document.createElement("tr");
                    var td = document.createElement("td");
                    td.innerHTML = "<div id='splitline'></div>";
                    td.colSpan = "2";
                    tr.appendChild(td);
                    document.getElementById("table-notes-end").appendChild(tr);

                    //Real Final Grade
                    var finalgrade = 0;
                    if(finalgradeModules != 0 && endnotes["IPA Abschlussprüfung_end"] != 0){
                        finalgrade = (finalgradeModules + endnotes["IPA Abschlussprüfung_end"]) / 2;
                    }
                    else{
                        finalgrade = finalgradeModules + endnotes["IPA Abschlussprüfung_end"];
                    }
                    var tr = document.createElement("tr");
                    var th = document.createElement("th");
                    th.innerHTML = "Endnote Lehrabschluss";
                    tr.appendChild(th);
                    var td = document.createElement("td");
                    finalgradestr = "" + finalgrade;
                    if (finalgradestr.length > 6) {
                        var finalgradefinal = finalgradestr.substring(0, 5) + "...";
                        td.innerHTML = finalgradefinal
                    }
                    else{
                        td.innerHTML = finalgrade
                    }
                    if(finalgrade > 4){
                        td.classList.add("grade-good");
                    }
                    else if(finalgrade < 4 && finalgrade != 0){
                        td.classList.add("grade-bad");
                    }
                    tr.appendChild(td);
                    document.getElementById("table-notes-end").appendChild(tr);
                }
                showbs();
                document.getElementById("loading").style.display = "none";
            });
        }
    });
}
function showbs(){
    document.getElementById("container-notes-form").style.display = "none";
    document.getElementById("BerufsfachschuleModule").style.display = "block";
}
function showuek(){
    document.getElementById("container-notes-form").style.display = "block";
    document.getElementById("BerufsfachschuleModule").style.display = "none";
}