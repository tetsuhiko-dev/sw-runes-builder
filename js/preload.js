const IpcRenderer = require('electron').ipcRenderer;
const Remote = require('electron').remote;
const $ = require('jquery');
const _ = require('lodash');

let currentMonster = undefined;

$(document).ready(function () {
    $("#close").on("click", function () {
        Remote.getCurrentWindow().close();
    });
});

// **************** FILTER ********************* //
$(document).ready(function () {
    $('#name-field').on('input', onFilterChange);
    $('#element-field').on('change', onFilterChange);
    $('#star-field').on('change', onFilterChange);

    onFilterChange();
});


function onFilterChange() {
    let name = $('#name-field').val();
    let element = $('#element-field').val();
    let star = $('#star-field').val();

    IpcRenderer.send("filterMonsterRequest", {name: name, element: element, star: star});
}

IpcRenderer.on('filterMonsterResult', (event, arg) => {
    $("#monster-list").empty();
    arg.forEach(monster => {
        if (monster) {
            let html = drawMonsterCard(monster);
            $("#monster-list").append(html);
        }
    });

    $(".card-monster").on("click", onClickMonster);
});

function drawMonsterCard(monster) {
    let name = monster.Name;
    let nameAwaken = monster.NameAwaken;
    let element = monster.Element;
    let star = monster.Star;
    let url0 = monster.ImageBase;
    let url1 = monster.ImageAwaken;

    let starHmtl = "";
    for (let i = 1; i <= star; i++) {
        starHmtl += "<span class='base-text-color' style=\"font-size: 15px;\"><i class=\"fas fa-star\"></i></span>\n";
    }

    let card = "<div monster-id='" + monster.Id + "' class=\"card mb-3 mr-2 ml-2 card-monster\" style=\"max-width: 540px; max-height: 100px\">\n" +
        "            <div class=\"row no-gutters\">\n" +
        "                <div class=\"col-md-3 p-2\">\n" +
        "                    <img src=\"images/monsters/" + url0 + "\" class=\"card-img rounded-circle\">\n" +
        "                </div>\n" +
        "                <div class=\"col-md-3 p-2\">\n" +
        "                    <img src=\"images/monsters/" + url1 + "\" class=\"card-img rounded-circle\">\n" +
        "                </div>\n" +
        "                <div class=\"col-md-6 pl-1 mt-1\">\n" +
        "                    <h5 class=\"card-title mb-1 text-center base-text-color\">" + name + "</h5>\n" +
        "                    <h5 class=\"card-title mb-1 text-center awaken-text-color\">" + nameAwaken + "</h5>\n" +
        "                    <div class=\"text-center\">\n" +
        "                        <img src=\"images/icons/" + element + ".png\" class=\"card-img rounded-circle img-icon\">\n" +
        starHmtl +
        "                    </div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </input>";

    return card;
}

// ********************************************* //

// ****************** Monster ***************** //

function onClickMonster() {
    IpcRenderer.send('getMonsterRequest', $(this).attr("monster-id"));
}

IpcRenderer.on('getMonsterResult', (event, arg) => {
    currentMonster = arg;
    $("#monster-name").text(currentMonster.Name);
    $("#monster-name-awaken").text(currentMonster.NameAwaken);

    $("#monster-element").empty().append('<img src="images/icons/' + currentMonster.Element + '.png" class="card-img rounded-circle img-element">');

    let star = "";
    for (let i = 1; i <= currentMonster.Star; i++) {
        star += '<span class="base-text-color" style="font-size: 20px;"><i class="fas fa-star"></i></span>\n';
    }
    $("#monster-star").empty().append(star).append('<span class="pl-2" style="font-size: 20px">' + currentMonster.Type + '</span>');

    let imgs = '<div class="col-md-6 pl-2 pb-2">\n' +
        '           <img src="images/monsters/' + currentMonster.ImageBase + '" class="card-img rounded-circle img-monster">\n' +
        '       </div>\n' +
        '       <div class="col-md-6 pl-2 pb-2">\n' +
        '           <img src="images/monsters/' + currentMonster.ImageAwaken + '" class="card-img rounded-circle img-monster">\n' +
        '       </div>';
    if (currentMonster.HasSecondAwaken) {
        imgs = '<div class="col-md-4 pl-2 pb-2">\n' +
            '       <img src="images/monsters/' + currentMonster.ImageBase + '" class="card-img rounded-circle img-monster">\n' +
            '    </div>\n' +
            '    <div class="col-md-4 pl-2 pb-2">\n' +
            '       <img src="images/monsters/' + currentMonster.ImageAwaken + '" class="card-img rounded-circle img-monster">\n' +
            '     </div>' +
            '     <div class="col-md-4 pl-2 pb-2">\n' +
            '       <img src="images/monsters/' + currentMonster.ImageAwakenSecond + '" class="card-img rounded-circle img-monster">\n' +
            '     </div>';
    }
    $("#monster-img").empty().append(imgs);

    $("#input-star").empty();
    for (let i = currentMonster.Star; i <= 6; i++) {
        let option = '';
        if (i === 6) {
            option = '<option selected value="' + i + '">' + i + '*</option>';
        } else {
            option = '<option value="' + i + '">' + i + '*</option>';
        }
        $("#input-star").append(option);
    }

    $("#input-level").empty().append('<option value="1">1</option>')
        .append('<option selected value="40">40</option>');

    if (currentMonster.HasSecondAwaken) {
        $("#input-awaken").empty().append('<option value="0">Base</option>')
            .append('<option value="1">Awaken</option>')
            .append('<option selected value="2">Second Awaken</option>');
    } else {
        $("#input-awaken").empty().append('<option value="0">Base</option>')
            .append('<option selected value="1">Awaken</option>');
    }

    updateStat();
    $(".main-div").removeClass('hide');
});

$(document).ready(function () {
    $("#input-star").on('change', function () {
        let star = parseInt($(this).val());
        if (star === 1) {
            $("#input-level").empty().append('<option value="1">1</option>')
                .append('<option selected value="15">15</option>');
        } else if (star === 2) {
            $("#input-level").empty().append('<option value="1">1</option>')
                .append('<option selected value="20">20</option>');
        } else if (star === 3) {
            $("#input-level").empty().append('<option value="1">1</option>')
                .append('<option selected value="25">25</option>');
        } else if (star === 4) {
            $("#input-level").empty().append('<option value="1">1</option>')
                .append('<option selected value="30">30</option>');
        } else if (star === 5) {
            $("#input-level").empty().append('<option value="1">1</option>')
                .append('<option selected value="35">35</option>');
        } else if (star === 6) {
            $("#input-level").empty().append('<option value="1">1</option>')
                .append('<option selected value="40">40</option>');
        }

        updateStat();
    });

    $("#input-level").on("change", updateStat);
    $("#input-awaken").on("change", updateStat);
});

function updateStat() {
    let star = parseInt($("#input-star").val());
    let level = parseInt($("#input-level").val());
    let awaken = parseInt($("#input-awaken").val());

    let statsMinor = undefined;
    let statsMajor = undefined;

    if (awaken === 0) {
        statsMinor = currentMonster.BaseMinorStats;
        statsMajor = currentMonster.BaseMajorStats.find(stats => stats.Level === level && stats.Star === star);
    } else if (awaken === 1) {
        statsMinor = currentMonster.AwakenMinorStats;
        statsMajor = currentMonster.AwakenMajorStats.find(stats => stats.Level === level && stats.Star === star);
    } else if (awaken === 2) {
        statsMinor = currentMonster.AwakenSecondMinorStats;
        statsMajor = currentMonster.AwakenSecondMajorStats.find(stats => stats.Level === level && stats.Star === star);
    }

    $("#base-hp").text(statsMajor.HealthPoint);
    $("#base-atk").text(statsMajor.Attack);
    $("#base-def").text(statsMajor.Defense);
    $("#base-spd").text(statsMinor.Speed);
    $("#base-crir").text(statsMinor.CriticalRate + '%');
    $("#base-crid").text(statsMinor.CriticalDamage + '%');
    $("#base-res").text(statsMinor.Resistance + '%');
    $("#base-acc").text(statsMinor.Accuracy + '%');

    updateTotalCalculation();
}

function updateRuneCalculated() {
    runeCalculationFixe("hp");
    runeCalculationFixe("atk");
    runeCalculationFixe("def");
    runeCalculationFixe("spd");
    runeCalculationPer("crir");
    runeCalculationPer("crid");
    runeCalculationPer("res");
    runeCalculationPer("acc");

    updateTotalCalculation();
}

function updateTotalCalculation() {
    $("#total-hp").text(parseInt($("#base-hp").text()) + parseInt($("#calculated-hp").text()));
    $("#total-atk").text(parseInt($("#base-atk").text()) + parseInt($("#calculated-atk").text()));
    $("#total-def").text(parseInt($("#base-def").text()) + parseInt($("#calculated-def").text()));
    $("#total-spd").text(parseInt($("#base-spd").text()) + parseInt($("#calculated-spd").text()));
    $("#total-crir").text(parseInt($("#base-crir").text().replace('%', '')) + parseInt($("#calculated-crir").text().replace('%', '')) + '%');
    $("#total-crid").text(parseInt($("#base-crid").text().replace('%', '')) + parseInt($("#calculated-crid").text().replace('%', '')) + '%');
    $("#total-res").text(parseInt($("#base-res").text().replace('%', '')) + parseInt($("#calculated-res").text().replace('%', '')) + '%');
    $("#total-acc").text(parseInt($("#base-acc").text().replace('%', '')) + parseInt($("#calculated-acc").text().replace('%', '')) + '%');
}

function runeCalculationFixe(stat) {
    let baseInt = parseInt($("#base-" + stat).text().replace('%', ''));
    let fixeInt = parseInt($("#modified-" + stat + "-fixe").text().replace('%', ''));
    let perInt = parseInt($("#modified-" + stat + "-per").text().replace('%', ''));
    let leader = parseInt($("#leader-" + stat).text().replace('%', ''));
    
    let resultInt = Math.round((baseInt * (perInt + leader) / 100.0 + fixeInt));

    $("#calculated-" + stat).text(resultInt);
}

function runeCalculationPer(stat) {
    let perInt = parseInt($("#modified-" + stat + "-per").text().replace('%', ''));
    let perInt2 = parseInt($("#leader-" + stat).text().replace('%', ''));

    let resultInt = perInt2 + perInt;

    $("#calculated-" + stat).text(resultInt);
}

// ********************************************* //

const defaultStats = ["HP", "%HP", "Atk", "%Atk", "Def", "%Def", "Speed", "Cri Rate", "Cri Dmg", "Res", "Acc"]
const defaultInnate = ["Strong", "Tenacious", "Ferocious", "Powerful", "Sturdy", "Durable", "Quick", "Fatal", "Cruel", "Resistant", "Intricate"]

const defaultRuneStats = [null,
    ["", "", "Atk", "", "", "", "", "", "", "", ""],
    ["HP", "%HP", "Atk", "%Atk", "Def", "%Def", "Speed", "", "", "", ""],
    ["", "", "", "", "Def", "", "", "", "", "", ""],
    ["HP", "%HP", "Atk", "%Atk", "Def", "%Def", "", "Cri Rate", "Cri Dmg", "", ""],
    ["HP", "", "", "", "", "", "", "", "", "", ""],
    ["HP", "%HP", "Atk", "%Atk", "Def", "%Def", "", "", "", "Res", "Acc"]];

let rune_stat = [null, _.cloneDeep(defaultStats), _.cloneDeep(defaultStats), _.cloneDeep(defaultStats),
    _.cloneDeep(defaultStats), _.cloneDeep(defaultStats), _.cloneDeep(defaultStats)];
let rune_innate = [null, _.cloneDeep(defaultInnate), _.cloneDeep(defaultInnate), _.cloneDeep(defaultInnate),
    _.cloneDeep(defaultInnate), _.cloneDeep(defaultInnate), _.cloneDeep(defaultInnate)];

let rune_primary_stat = _.cloneDeep(defaultRuneStats);

function getStar(slot) {
    return $("#rune" + slot + "-star");
}

function getType(slot) {
    return $("#rune" + slot + "-type");
}

function getLevel(slot) {
    return $("#rune" + slot + "-level");
}

function getStatType(slot, id) {
    return $("#rune" + slot + "-stat" + id);
}

function getStatValue(slot, id) {
    return $("#rune" + slot + "-stat" + id + "-value");
}

function getStatText(slot, id) {
    return $("#rune" + slot + "-stat" + id + "-text");
}

function getInnate(slot) {
    return $("#rune" + slot + "-innate");
}

function getInnateValue(slot) {
    return $("#rune" + slot + "-innate-value");
}

function getInnateText(slot) {
    return $("#rune" + slot + "-innate-text");
}

function getRune(slot) {
    let type = parseInt(getType(slot).val());
    let star = parseInt(getStar(slot).val());
    let level = parseInt(getLevel(slot).val());
    let stat0 = parseInt(getStatType(slot, 0).val());
    let innate = parseInt(getInnate(slot).val());
    let innateValue = parseInt(getInnateValue(slot).val());
    let stat1 = parseInt(getStatType(slot, 1).val());
    let stat1Value = parseInt(getStatValue(slot, 1).val());
    let stat2 = parseInt(getStatType(slot, 2).val());
    let stat2Value = parseInt(getStatValue(slot, 2).val());
    let stat3 = parseInt(getStatType(slot, 3).val());
    let stat3Value = parseInt(getStatValue(slot, 3).val());
    let stat4 = parseInt(getStatType(slot, 4).val());
    let stat4Value = parseInt(getStatValue(slot, 4).val());

    return {
        type: type,
        star: star,
        level: level,
        stat0: {id: stat0, value: 0},
        innate: {id: innate, value: innateValue},
        stat1: {id: stat1, value: stat1Value},
        stat2: {id: stat2, value: stat2Value},
        stat3: {id: stat3, value: stat3Value},
        stat4: {id: stat4, value: stat4Value}
    };
}

function setStatOption(slot, id, options) {
    let select = getStatType(slot, id);
    let index = parseInt(select.val());
    select.empty();
    if (index === -1) {
        select.append('<option value="-1" selected>Stat</option>');
    } else {
        select.append('<option value="-1">Stat</option>');
    }
    for (let i = 0; i < options.length; i++) {
        if (options[i] === "" && index !== i) continue;
        if (index === i) {
            let option = options[i] === "" ? defaultStats[i] : options[i];
            select.append('<option value="' + i + '" selected>' + option + '</option>');
        } else {
            select.append('<option value="' + i + '">' + options[i] + '</option>');
        }
    }
}

function setInnateOption(slot, options) {
    let select = getInnate(slot);
    let index = parseInt(select.val());
    select.empty();
    if (index === -1) {
        select.append('<option value="-1" selected>Innate</option>');
    } else {
        select.append('<option value="-1">Innate</option>');
    }
    for (let i = 0; i < options.length; i++) {
        if (options[i] === "" && index !== i) continue;
        if (index === i) {
            let option = options[i] === "" ? defaultInnate[i] : options[i];
            select.append('<option value="' + i + '" selected>' + option + '</option>');
        } else {
            select.append('<option value="' + i + '">' + options[i] + '</option>');
        }
    }
}

$(document).ready(function () {
    for (let s = 1; s <= 6; s++) {
        for (let i = 0; i < 5; i++) {
            getStatType(s, i).on("change", function () {
                let oldValue = parseInt($(this).data('val'));
                let newValue = parseInt($(this).val());

                $(this).data('val', newValue);

                if (oldValue !== -1) {
                    rune_primary_stat[s][oldValue] = defaultRuneStats[s][oldValue];
                    rune_stat[s][oldValue] = defaultStats[oldValue];
                    rune_innate[s][oldValue] = defaultInnate[oldValue]
                }

                rune_primary_stat[s][newValue] = "";
                rune_stat[s][newValue] = "";
                rune_innate[s][newValue] = "";

                for (let j = 0; j < 5; j++) {
                    if (i === j) continue;
                    setStatOption(s, j, j===0?rune_primary_stat[s] : rune_stat[s]);
                }
                setInnateOption(s, rune_innate[s]);

                sendRunes();

            });

            getStatValue(s, i).on('change', function () {
                sendRunes();
            });
        }

        getInnateValue(s).on('change', function () {
            sendRunes();
        });

        getInnate(s).on('change', function () {
            let oldValue = parseInt($(this).data('val'));
            let newValue = parseInt($(this).val());

            $(this).data('val', newValue);

            if (oldValue !== -1) {
                rune_stat[oldValue] = defaultStats[oldValue];
                rune_innate[oldValue] = defaultInnate[oldValue]
            }

            rune_stat[newValue] = "";
            rune_innate[newValue] = "";

            getInnateText(s).text((defaultStats[newValue] === undefined ? "" : defaultStats[newValue]));

            for (let j = 0; j < 5; j++) {
                setStatOption(s, j, rune_stat);
            }

            sendRunes();
        });

        getLevel(s).on('change', function () {
            sendRunes();
        });

        getType(s).on('change', function () {
            sendRunes();
        });

        getStar(s).on('change', function () {
            sendRunes();
        });
    }
});

function sendRunes() {
    let array = [getRune(1), getRune(2), getRune(3), getRune(4), getRune(5), getRune(6)];
    IpcRenderer.send('sendRuneRequest', array);
}

IpcRenderer.on('sendRuneResult', ((event, args) => {
    $('#modified-hp-fixe').text(args[0]);
    $('#modified-hp-per').text(args[1] + "%");
    $('#modified-atk-fixe').text(args[2]);
    $('#modified-atk-per').text(args[3] + "%");
    $('#modified-def-fixe').text(args[4]);
    $('#modified-def-per').text(args[5] + "%");
    $('#modified-spd-fixe').text(args[6]);
    $('#modified-spd-per').text(args[11] + "%");
    $('#modified-crir-per').text(args[7] + "%");
    $('#modified-crid-per').text(args[8] + "%");
    $('#modified-res-per').text(args[9] + "%");
    $('#modified-acc-per').text(args[10] + "%");

    updateRuneCalculated();
}));

IpcRenderer.on('sendStats0', (event, args) => {
    for (let i = 0; i < args.length; i++) {
        getStatValue(i + 1, 0).val(args[i]);
    }
    updateRuneCalculated();
});

IpcRenderer.on('sendRuneBonusIndex', (event, args) => {
    let imgs = '';
    for(let i=0; i<args.length; i++){
        imgs += '<img src="images/icons/Effect{}.png" width="25" height="25">'.format(args[i]);
    }
    let html = '<span style="font-size: 17px">Runes Set : {}</span>'.format(imgs);
    $("#rune-effect").empty().append(html);
});

// UPDATER
IpcRenderer.on('update-available', (event, args) => {
    $("#update-check").addClass("hide");
    $("#update-available").removeClass("hide");
});

IpcRenderer.on('update-not-available', (event, args) => {
    document.location = "index.html";
});

IpcRenderer.on('update-progress', (event, info) => {
    let progress = info.percent;
    let speed = (info.bytesPerSecond / 1000000.0).toFixed(2);
    
    let total_second = (info.total - info.transferred) / info.bytesPerSecond;
    let minutes = Math.floor(total_second / 60);
    let seconds = Math.floor(total_second % 60);
    
    $("#progress-bar").css('width', progress+'%');
    $("#progress-speed").text("{} MB/s - {} min {} sec".format(speed, minutes, seconds));
});

$(document).ready(function () {
    $("#update-yes").on('click', function () {
        $("#update-available").addClass("hide");
        $("#update-progress").removeClass("hide");
        IpcRenderer.send('update-download');
    });
    
    $("#update-no").on('click', function () {
        document.location = "index.html";
    });


    IpcRenderer.on("app-version", (event, args) =>{
        $("#title").text("Summoner Wars : Runes - v{}".format(args.version));
    });
    
    IpcRenderer.send("app-version");
});