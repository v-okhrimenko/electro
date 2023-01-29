function setStatusImage(status, from) {

    const imagePower = document.getElementById("power_id");
    if (from === "now") {
        //console.log(status)
        status ? imagePower.load("https://assets1.lottiefiles.com/packages/lf20_fboneztl.json")
            : imagePower.load("https://assets1.lottiefiles.com/packages/lf20_0FN9sHNSFX.json")
    } else {
        imagePower.load("https://assets6.lottiefiles.com/packages/lf20_z4cshyhf.json")
    }
}

function setDate(date) {
    const options_now = {year: 'numeric', month: 'long', day: 'numeric'};
    document.getElementById("time-now").innerHTML = new Date(date).toLocaleDateString('uk-UA', options_now).replace(/\s*р\./, "");
}

const interIdsNow = [];

function setNowInfo(response, list) {
    for (i in interIdsNow) {
        clearInterval(interIdsNow[i]);
    }

    const time = new Date(response['time']).toLocaleTimeString()
    const status = response['status']
    var lastEventDate = ""
    if (list.length === 0) {

        lastEventDate = '<br>' + "(" + new Date(response['time']).toLocaleDateString('uk-UA') + ")"
    }

    if (status === false) {
        // console.log("LIST: true" + list.length)
        document.getElementById("on_off_status_txt").innerHTML = "Виключили в:  " + time + " " + lastEventDate;
    }
    if (status === true) {
        // console.log("LIST: false" + list.length)
        document.getElementById("on_off_status_txt").innerHTML = "Включили в:  " + time + " " + lastEventDate;
    }

    const x = setInterval(function () {
        const now = new Date().getTime();
        const countDownDate = new Date(response['time']).getTime();
        const distance = now - countDownDate;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // console.log(days + "д " + hours + "г "
        //     + minutes + "хв " + seconds + "с ")
        document.getElementById("dur_timer").innerHTML = days + "д " + hours + "г "
            + minutes + "хв " + seconds + "с ";
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("dur_timer").innerHTML = "EXPIRED";
        }
    }, 1000);
    interIdsNow.push(x)

}

const getInfo = async (day, from) => {
    showAnimation()
    try {
        day.setHours(0, 0, 0, 0)
        const responsesJSON = await Promise.all([
            fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=last_' + day + "_" + userTable),
            fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=getByDay_' + day + "_" + userTable,)
        ]);

        getGrafInfo(new Date)
        const [lastInfo, listByDay] = await Promise.all(responsesJSON.map(r => r.json()));

        hideAnimation()

        if (from === "now") {

            setDate(day)
            setStatusImage(lastInfo['status'], "now")
            setNowInfo(lastInfo, listByDay)
            setList(listByDay)
            setTimeNoTotal(listByDay, lastInfo, "now")

            document.getElementById("on_off_status_txt").hidden = false
            document.getElementById("dur_timer").hidden = false

        } else {

            const now_short = new Date();
            now_short.toDateString()
            day.toDateString()
            setTimeNoTotal(listByDay, lastInfo, "not now")

            if (day.toDateString() === now_short.toDateString()) {

                setDate(lastInfo['selectedDate'])
                setList(listByDay)
                setTimeNoTotal(listByDay, lastInfo, "now")

                document.getElementById("on_off_status_txt").hidden = false
                document.getElementById("dur_timer").hidden = false

                setStatusImage(lastInfo['status'], "now")
            } else {

                setDate(lastInfo['selectedDate'])
                setList(listByDay)
                setStatusImage(lastInfo['status'], "history")

                document.getElementById("on_off_status_txt").hidden = true
                document.getElementById("dur_timer").hidden = true
            }
        }


    } catch (err) {
        alert("Інформації за цей день нема. Виберіть іншу дату!")
        getInfo(new Date(), "now", userTable)
        throw err;
    }
};

const interIds = [];

function setTimeNoTotal(list, lastInfo, from) {
    for (i in interIds) {
        clearInterval(interIds[i]);
    }
    // console.log(interIds + "  " + "timer 2")

    let no = []
    let yes = []
    if (list.length === 0) {
        document.getElementById("absend-id").hidden = true
        document.getElementById("was-id").hidden = true

    } else {

        for (let i = 0; i < list.length; i++) {
            if (list[i]['status'] === false) {
                no.push(list[i]['duration'].replace(/[^0-9,\s]/g, " ").replace("  ", ":").replace("   ", ":").split(":"))

            } else {
                yes.push(list[i]['duration'].replace(/[^0-9,\s]/g, " ").replace("  ", ":").replace("   ", ":").split(":"))
            }
        }

        let noArr = getHMS(no)
        let yesArr = getHMS(yes)

        var html_
        var arr
        if (lastInfo['status'] === true) {

            html_ = document.getElementById("was-id")
            arr = yesArr
        } else {
            html_ = document.getElementById("absend-id")
            arr = noArr
        }

        //console.log(from)
        if (from === "now") {

            var ms = arr[2] * 1000 + arr[1] * 60000 + arr[0] * 3.6e+6

            const intervalId = setInterval(function () {
                const now = new Date().getTime();
                const countDownDate = new Date(lastInfo['time']).getTime();
                let distance = now - countDownDate;

                distance = distance + ms
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                html_.innerText = setZero(hours) + "г " + setZero(minutes) + "xв "
                //console.log(days + " " + hours + " " + minutes + " " + seconds)

            }, 1000);
            interIds.push(intervalId)

        }

        document.getElementById("absend-id").innerHTML = setZero(noArr[0]) + "г " + setZero(noArr[1]) + "xв "
        document.getElementById("absend-id").hidden = false

        document.getElementById("was-id").innerHTML = setZero(yesArr[0]) + "г " + setZero(yesArr[1]) + "xв "
        document.getElementById("was-id").hidden = false
        //
    }
}


function getHMS(arr) {
    let sec = 0;
    let min = 0;
    let hours = 0;
    for (let i = 0; i < arr.length; i++) {
        hours = hours + parseInt(arr[i][0])
        min = min + parseInt(arr[i][1])
        sec = sec + parseInt(arr[i][2])
    }
    return hmt = parseHMSToNormalTime(hours, min, sec)

}

function setZero(digit) {
    if (digit < 10) {
        return '0' + digit
    } else {
        return digit
    }
}

function parseHMSToNormalTime(h, m, s) {

    let ms = 0
    ms = s * 1000 + m * 60000 + h * 3.6e+6

    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return [hours, minutes, seconds]
}

// add day info to list
function setList(list) {

    const listsItems = $('#listview');
    listsItems.empty();
    list.reverse()
    for (let i = 0; i < list.length; i++) {
        listsItems.append(createLisItem(list[i]))
    }
    //console.log(list);
}

function createLisItem(listItem) {
    const status = listItem['status']
    const start = listItem['start']
    const end = listItem['end']
    const total = listItem['duration']

    let color_const;
    let pth = "";
    if (status === false) {
        pth = "https://i.ibb.co/4pksKzy/poweroff.png";
        color_const = 'rgba(210, 77, 77, 0.65)';

    }
    if (status === true) {
        pth = "https://i.ibb.co/XJ8Mszx/poweron.png";
        color_const = 'rgba(63, 209, 60, 0.48)';
    }
    const fromtxt = " з " + start;
    var totxt = " до " + end
    const dur = " тривалість: " + total;
    return '<div class="message"><img class="img" src=' + '"' + pth + '"' + '><div class="text_message_wrapper" id="text_message_wrapper" style="background-color:' + color_const + ';"><div class="from" id="fromtxt">' + fromtxt + '</div><div class="to" id="totxt">' + totxt + '</div><div class="total_message" id="dur">' + dur + '</div></div></div>'
}

jQuery(function ($) {
    $.datepicker.regional['ua'] = {
        closeText: 'Закрити',
        prevText: '&#x3c;Поп',
        nextText: 'Наст&#x3e;',
        currentText: 'Сьогодні',
        monthNames: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
            'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
        monthNamesShort: ['Січ', 'Лют', 'Бер', 'Квіт', 'Трав', 'Черв',
            'Лип', 'Серп', 'Вер', 'Жовт', 'Лист', 'Груд'],
        dayNames: ['неділя', 'понеділок', 'вівторок', 'среда', 'четвер', 'п\'ятница', 'субота'],
        dayNamesShort: ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        dayNamesMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        weekHeader: 'Ти',
        dateFormat: 'dd.mm.yy',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''
    };
    $.datepicker.setDefaults($.datepicker.regional['ua']);
});

$(function () {
    $('#datepicker').datepicker({
        dateFormat: 'dd MM yy',
        // minDate: "today",
        maxDate: "+0d",
        setDate: "0",
        autoSize: true
    });
});

function show_dp() {
    //  document.getElementById("datepicker").setAttribute('type',"text")
    $('#datepicker').datepicker('show'); //Show on click of button
}

function dateSelect(e) {
    const nor = calendarDateToNormalDate(e.target.value)
    getInfo(new Date(nor), "history")
}

function calendarDateToNormalDate(dateString) {

    var dateArray = dateString.split(' ');
    var month = getMonth(dateArray[1])

    const options_now = {year: 'numeric', month: 'long', day: 'numeric'}
    var newCorrectData = new Date(Date.parse(dateArray[0] + " " + month + " " + dateArray[2]))
    // console.log(newCorrectData.toLocaleDateString(undefined, options_now))
    // console.log(newCorrectData + "Corect")
    return newCorrectData
}

function getMonth(monthFull) {
    let monthNamesLong = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
    let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return monthNames[monthNamesLong.indexOf(monthFull)]
}

function showAlert(e) {
    var url = document.getElementById(e).innerText;
    var text = ""
    if (e === "absend-id") {
        text = "Загалом за добу eлeктроенергія відсутня  " + url
    }
    if (e === "was-id") {
        text = "Загалом за добу eлeктроенергія є  " + url
    }

    alert(text);
}

function show_graf() {
    document.getElementById("graph_conteiner-back").style = 'display: block;';
    //getGrafInfo(new Date())
}

function close_graf() {
    document.getElementById("graph_conteiner-back").style = 'display: none;';

}

var month_years = []
const getGrafInfo = async (date) => {
    var year = date.getFullYear();
    var month = date.getMonth();

    document.getElementById("load_intab").style = 'display: block;';

    try {
        const responsesJSON = await Promise.all([
            fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=graf_' + year + '*' + month + "*" + userTable),

        ]);
        const [dateForGraf] = await Promise.all(responsesJSON.map(r => r.json()));

        if (month_years.length <= 0) {
            month_years = dateForGraf['forList']
            setYearForGraf(year)
        }
        setChartData(dateForGraf)

    } catch (err) {
        throw err;
    }
};

function setYearForGraf(year) {
    $('#year_select').empty()
    const jsonObj = month_years
    for (var key in jsonObj) {
        for (var k in jsonObj[key]) {
            $('#year_select').append('<option value="' + k + '">' + k + '</option>');
        }
    }
    document.getElementById('year_select').value = year
    setMonthForGraf(year)

}

function setMonthForGraf(year) {
    $('#month_select').empty()

    const jsonObj = month_years
    for (var key in jsonObj) {
        for (var k in jsonObj[key]) {
            if (k === year.toString()) {
                for (const month in jsonObj[key][k]) {
                    $('#month_select').append('<option value="' + jsonObj[key][k][month] + '">' + getMonthUKR(jsonObj[key][k][month]) + '</option>');
                }
            }
        }
    }
}

function changeYearInGraf() {
    const y = document.getElementById("year_select");
    const year = y.value;

    setMonthForGraf(year)
}

function searchGRAF() {
    var y = document.getElementById("year_select");
    var year = y.value;

    var m = document.getElementById("month_select");
    var month = m.value;

    getGrafInfo(new Date(year, month))
    // console.log(year + " " + month)
    document.getElementById("myChart").style = 'display: none;';
}

function getMonthUKR(index) {
    let monthNamesLong = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
    return monthNamesLong[index]
}

function setChartData(x) {

    document.getElementById("load_intab").style = 'display: none;';
    document.getElementById("tab_visible").style = 'display: block;';
    document.getElementById("myChart").style = 'display: block;';

    const ctx = document.getElementById('myChart');

    let chartStatus = Chart.getChart("myChart"); // <canvas> id
    if (chartStatus !== undefined) {
        chartStatus.destroy();
    }
    new Chart(ctx, {
            type: 'line',
            data: x,
            options: {
                pointBackgroundColor: 'rgb(229,14,92)',
                // pointHitRadius: '1',
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        }
    )
}

document.getElementById("defaultOpen").click();

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}