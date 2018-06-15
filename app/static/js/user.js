//$('#s1').css('background-image', 'url(' + 'http://gifok.net/images/2016/08/18/ayvvxfenKG-2560x1600.jpg' + ')');
function init() {
    //pyListener();
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
            console.log("dbe" + localStorage.getItem("dbExists"))
            if (localStorage.getItem("dbExists") == '"exists"') {
                let exL = localStorage.getItem("AoS");
                for (let i = 1; i <= exL; i++) {
                    let data = JSON.parse(localStorage.getItem(i));
                    if (localStorage.getItem(i)) {
                        appendSkill(i, data.title);
                        randPos(i);
                    }
                }
                setCover();
            }
        }
    );


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


function appendSkill(selector, content) {
    $("body").append(
        "<div class='skill_container w3-col s6 m2 l1' id='s" + selector + "' style='z-index: 0;'>" +
        "<div class='w3-container'>" +
        "<div class='w3-bar w3-row'>" + content + "</div>" +
        "<div class='w3-bar w3-row'>" +
        "<div class='w3-col s12 m12 l12 w3-bar-item w3-button w3-blue w3-tiny' title='как это изучить' onclick=studyThis('" + selector + "')> <i class='fa fa-book'></i> </div>" +
        "</div>" +
        "</div>" +
        "</div>"
    );
    randPos(selector);
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
    let sel = $("#s" + selector);

    let ix = Math.round((sel.offset().left) + sel.width()/2);
    let iy = Math.round((sel.offset().top + sel.height()/2));


    if (dat.pids) {
        for (let elem in dat.pids) {
            if (dat.pids[elem] == null) {
                continue;
            }
            if (px.length % 4 != 0) {
                px.pop();
                px.pop();
            }
            let sel = $("#s" + dat.pids[elem]);

            let dx = Math.round((sel.offset().left + sel.width()/2));
            let dy = Math.round((sel.offset().top + sel.height()/2));
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


//HELPERS
function clear() {
    $("svg").remove();
    for (let i = 0; i < localStorage.length; i++) {
       // $("#s" + localStorage.key(i)).css("background-color", "#d2e6e7");

    }
}


function twoDots(ix, iy, dx, dy) {
    $("body").append('<svg style="width: 100%; height: 100%; position: absolute; z-index: -1;">' +
        '<polyline points="' + ix + ',' + iy + " " + dx + ',' + dy + '"' +
        'style="fill:none; stroke:black; stroke-width:3; z-index=1 position: relative" /></svg>');
}

function movable() {
    $(function () {
        $(".w3-col").draggable({
            containment: "svg",
            drag: function () {
                studyThis(localStorage.getItem("lastBook"));
            },
            stop: function () {
                studyThis(localStorage.getItem("lastBook"));
            }
        });
        $(".w3-col").droppable();
        $(".w3-col").resizable({
            ghost: true
        });
    });
}

function setCover() {
    let data = JSON5.parse($("#imgFromServer").val());

    for(let key in data) {
        let img = data[key];
        console.log(key);
        let element = $("#"+key)[0];
        console.log(element);
        element.style.backgroundImage = "url("+img+")";
    }


}
