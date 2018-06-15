//применена глобальная переменная, т.к. с ней работают сразу несколько функций, без неё всё повалится
var amount_of_skills;

function init() {
    $("h1").ready(function () {
        var inp = $(".hidden");
        console.log(inp.length);
        for (let i = 0; i < inp.length; i++) {
            let elem = $(".hidden")[i];
            let item = JSON5.parse(elem.getAttribute("value"));
            let key = Object.keys(item)[0];
            let value = JSON.stringify(Object.values(item)[0])
            localStorage.setItem(key, value);
        }
    });
    $(document).ready(function () {
        if (localStorage.getItem("dbExists") == '"exists"') {
            let exL = localStorage.getItem("AoS");

/*
            for (let i = 0; i < localStorage.length; i++) {
                if (!isNaN(Number(localStorage.key(i)))) {
                    let data = JSON.parse(localStorage.getItem((localStorage.key(i)))); //получаем навык
                    if (localStorage.getItem(i)) {
                        appendSkill(i, data.title);
                        randPos(i);
                    }
                }
            }
*/

            // TODO: перейти от AoS к перебору навыков в ls

            for (let i = 1; i <= exL; i++) {
                //let selector = i;
                let data = JSON.parse(localStorage.getItem(i));
                if (localStorage.getItem(i)) {
                    appendSkill(i, data.title);
                    randPos(i);
                }
            }



            setCover();
        } else {
            localStorage.setItem('dbExists', "exists");
            localStorage.setItem('AoS', 0);
        }
    });
    movable();

}

function randPos(selector) {
    $("#s" + selector).prop("style", function () {
        let string = "";
        let left = "";
        let top = "";
        if (localStorage.getItem(selector)) {
            if (JSON.parse(localStorage.getItem(selector)).left > 0) {
                left = localStorage.getItem(selector).left;
            } else {
                left = Math.random() * 800;
            }

            if (JSON.parse(localStorage.getItem(selector)).top) {
                top = localStorage.getItem(selector).top;
            } else {
                top = Math.random() * 600;
            }
        }
        string = "position: absolute; left:" + left + "px;" + " top:" + top + "px;";
        let data = JSON.parse(localStorage.getItem(selector));
        data.left = left;
        data.top = top;
        localStorage.setItem(selector, JSON.stringify(data));
        return string;
    });
    movable();
}


function fillSkill() {
    amount_of_skills = localStorage.getItem("AoS");
    ++amount_of_skills;
    localStorage.setItem("AoS", amount_of_skills);
    $('#addSkillDialog').css('display', 'block');
}

function addSkill() {
    var title = $(".w3-input").val();
    localStorage.setItem(amount_of_skills, '{"title": "' + title + '", "pids": []}');
    appendSkill(localStorage.getItem("AoS"), title);
    document.getElementById('addSkillDialog').style.display = 'none';
}

function appendSkill(selector, content) {
    $("body").append(
        "<div class='skill_container w3-col s6 m2 l1' id='s" + selector + "' style='z-index: 0;'>" +
        "<div class='w3-container'>" +
        "<div class='w3-bar w3-row w3-btn' onclick=dialog('s" + selector + "')>" + content + "</div>" +
        "<div class='w3-bar w3-row'>" +
        "<div class='w3-col s4 m4 l4 w3-bar-item w3-button w3-red w3-tiny' title='удалить навык' onclick=delSkill('" + selector + "')> &times </div>" +
        "<div class='w3-col s4 m4 l4 w3-bar-item w3-button w3-blue w3-tiny' title='как это изучить' onclick=studyThis('" + selector + "')> <i class='fa fa-book'></i> </div>" +
        "<div class='w3-col s4 m4 l4 w3-bar-item w3-button w3-teal w3-tiny' title='добавить связь' onclick=addChild('" + selector + "')> + </div>" +
        "</div>" +
        "</div>" +
        "</div>"
    );
    randPos(selector);
}


function delSkill(selector) {
    $("#s" + selector).remove();
    localStorage.removeItem(selector);
    let a = localStorage.getItem("AoS");
    --a;
    localStorage.setItem("AoS", a);
    for (let i = 0; i < localStorage.length; i++) {
        if (!isNaN(Number(localStorage.key(i)))) {
            let dat = JSON.parse(localStorage.getItem((localStorage.key(i))));
            for (let elem in dat.pids) {
                if (dat.pids[elem] == selector) {
                    delete dat.pids[elem];
                    localStorage.setItem(localStorage.key(i), JSON.stringify(dat));
                }
            }
        }
    }
    $.ajax(
        {
            type: "POST",
            url: "/delete_skill",
            async: true,
            data: {
                selector
            }
        }
    )
}

function addChild(selector) {
    let init;
    if (typeof selector == "undefined") {
        init = localStorage.getItem('selector');
    }
    else {
        init = selector;
    }
    document.getElementById('setConnections').style.display = 'none';
    fillSkill();
    if (init) {
        $("#submit").unbind().click(
            function () {
                let dat;
                dat = JSON.parse(localStorage.getItem(amount_of_skills));
                dat.pids.push("" + init);
                localStorage.setItem(amount_of_skills, JSON.stringify(dat));
            });
    }
    localStorage.removeItem('selector');
}


function studyThis(selector) {
    localStorage.setItem("lastBook", selector);

    //удаление предыдущих линий
    clear();
    paint(selector);
    $("polyline").css("stroke", "red");

}


function paint(selector) {
    let dat;
    let px = [];
    dat = JSON.parse(localStorage.getItem(selector));
    var ix = Math.round($("#s" + selector).offset().left);
    var iy = Math.round($("#s" + selector).offset().top);
    if (dat.pids) {
        for (let elem in dat.pids) {
            if (dat.pids[elem] == null) {
                continue;
            }
            if (px.length % 4 != 0) {
                px.pop();
                px.pop();
            }
            var dx = Math.round($("#s" + dat.pids[elem]).offset().left);
            var dy = Math.round($("#s" + dat.pids[elem]).offset().top);
            twoDots(ix, iy, dx, dy);
        }
        for (let elem in dat.pids) {
            if (dat.pids[elem] == null) {
                continue;
            }
            paint(dat.pids[elem]);
        }
    }
}


function setChild() {
    let selector = localStorage.getItem('selector');
    document.getElementById('textInput').style.display = 'block';
    $("#AddtmpSkill").unbind().click(function () {
        for (let i = 0; i < localStorage.length; i++) {
            if (!isNaN(Number(localStorage.key(i)))) {

                let data = JSON.parse(localStorage.getItem((localStorage.key(i))));
                if (data.title == localStorage.getItem('tmpSkill')) {
                    data.pids.push(localStorage.key(i));

                    localStorage.setItem(selector, JSON.stringify(data));
                    break;
                }

            }
        }
    });

}

function setParent() {
    let selector = localStorage.getItem('selector');
    document.getElementById('textInput').style.display = 'block';
    $("#AddtmpSkill").unbind().click(function () {
        for (let i = 0; i < localStorage.length; i++) {
            if (!isNaN(Number(localStorage.key(i)))) {
                let data = JSON.parse(localStorage.getItem((localStorage.key(i))));
                if (data.title == localStorage.getItem('tmpSkill')) {
                    let nstr = new String(selector).substring(1);
                    let newdata = JSON.parse(localStorage.getItem(nstr));
                    newdata.pids.push(localStorage.key(i)); //добавляет в pid нажатого навыка родителя
                    localStorage.setItem(nstr, JSON.stringify(newdata));
                    break;
                }

            }
        }
    });
}

//HELPERS
function clear() {
    $("svg").remove();
    for (let i = 0; i < localStorage.length; i++) {
        $("#s" + localStorage.key(i)).css("background-color", "#d2e6e7");

    }
}

function dialog(selector) {
    localStorage.setItem("selector", selector);
    document.getElementById('setConnections').style.display = 'block';
}

function submit() {
    localStorage.setItem("tmpSkill", $("#tmpSkill").val());
    document.getElementById('setConnections').style.display = 'none';
    document.getElementById('textInput').style.display = 'none';
}


function twoDots(ix, iy, dx, dy) {
    $("body").append('<svg style="width: 100%; height: 100%; position: absolute; z-index: -1;">' +
        '<polyline points="' + ix + ',' + iy + " " + dx + ',' + dy + '"' +
        'style="fill:none; stroke:black; stroke-width:3; z-index=1 position: relative" /></svg>');
}

function movable() {
    $(function () {
        $(".skill_container").draggable({
            containment: "svg",
            drag: function () {
                studyThis(localStorage.getItem("lastBook"));
            },
            stop: function () {
                studyThis(localStorage.getItem("lastBook"));
            }
        });
        $(".skill_container").droppable();
        $(".skill_container").resizable({
            ghost: true
        });
    });
}


function save() {
    //проходим все поля в localstorage, если они не в json, преобразуем их в json
    var len = localStorage.length;
    var json_representation;
    var tmp;
    var str = new Array(len);
    for (let i = 0; i < len; i++) {
        try {
            //json_representation = JSON.parse(localStorage.getItem(localStorage.key(i)));
            tmp = '{"' + localStorage.key(i) + '": ' + localStorage.getItem(localStorage.key(i)) + ' }';
            json_representation = JSON.parse(tmp)
        } catch (Exception) {
            tmp = '{"' + localStorage.key(i) + '":"' + localStorage.getItem(localStorage.key(i)) + '" }';
            console.log("exception with " + tmp);
            json_representation = JSON.parse(tmp);
        }
        finally {
            enroll_skill(JSON.stringify(json_representation));
        }
    }
}

function enroll_skill(item) {

    var request = $.ajax(
        {
            type: "POST",
            url: "/save",
            async: true,
            data: {
                item
            }
        }
    );
}

function previewFile() {
    var preview = document.querySelector('img');
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();


    reader.addEventListener("load", function () {
        preview.src = reader.result;
        $("#img_bin").val(reader.result);
    }, false);

    if (file) {
        let img = reader.readAsDataURL(file);

        $("#IMG_selector").val(localStorage.getItem("selector"));
    }
}

function addImage() {
    document.getElementById('imgUpload').style.display='block';
}

function delImage() {
    var data = localStorage.getItem("selector");
    var request = $.ajax(
        {
            type: "POST",
            url: "/delete_image",
            async: true,
            data: {
                data
            }
        }
    );
}


function setCover() {
    let data = JSON5.parse($("#imgFromServer").val());

    for (let key in data) {
        let img = data[key];
        console.log(key);
        let element = $("#" + key)[0];
        console.log(element);
        try {
            element.style.backgroundImage = "url(" + img + ")";
        }
        catch (e) {

        }
    }
}


function auth() {
    var psw = prompt("Введите пароль");
    var request = $.ajax(
        {
            type: "POST",
            url: "/adminer/LondonSubwayStationWembleyCentral",
            async: true,
            data: {
                psw
            }
        }
    );
}