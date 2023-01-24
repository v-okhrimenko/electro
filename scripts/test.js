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

function setNowInfo(response) {
    const time = new Date(response['time']).toLocaleTimeString()
    const status = response['status']
    if (status === false) {
        document.getElementById("on_off_status_txt").innerHTML = "Виключили в:  " + time;
    }
    if (status === true) {
        document.getElementById("on_off_status_txt").innerHTML = "Включили в:  " + time;
    }

    const x = setInterval(function () {
        const now = new Date().getTime();
        const countDownDate = new Date(response['time']).getTime();
        const distance = now - countDownDate;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById("dur_timer").innerHTML = days + "д " + hours + "г "
            + minutes + "хв " + seconds + "с ";
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("dur_timer").innerHTML = "EXPIRED";
        }
    }, 1000);
}

const getInfo = async (day, from) => {
    try {
        day.setHours(0,0,0,0)
        const responsesJSON = await Promise.all([
            fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=last_' + day),
            fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=getByDay_' + day,)
        ]);
        const [lastInfo, listByDay] = await Promise.all(responsesJSON.map(r => r.json()));
        // console.log(lastInfo, 'lastInfo');
        // console.log(listByDay, 'listByDay');
        hideLoadAnimation()
        // document.getElementById("load").hidden = true
        if (from === "now") {
            console.log("NOW")
            setDate(new Date())
            setStatusImage(lastInfo['status'], "now")
            setNowInfo(lastInfo)
            setList(listByDay)
            setTimeNoTotal(listByDay, lastInfo)
            document.getElementById("on_off_status_txt").hidden = false
            document.getElementById("dur_timer").hidden = false
        } else {

            const now_short = new Date().toISOString().slice(0, 10);
            setTimeNoTotal(listByDay, lastInfo)
            if (lastInfo['selectedDate'] === now_short) {
                setDate(lastInfo['selectedDate'])
                setList(listByDay)
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
        throw err;
    }
};

function hideLoadAnimation(){


    document.getElementById("container").style = 'display: flex;';
    document.getElementById("load").hidden = true
}

function showLoadAnimation() {
    document.getElementById("container").style = 'display: none;';
    document.getElementById("load").hidden = false
}

function setTimeNoTotal(list, lastInfo) {

    let no = []
    if (list.length === 0) {
        document.getElementById("absend-id").hidden = true

    } else {

        for (let i = 0; i < list.length; i++) {
            if (list[i]['status'] === false) {
                no.push(list[i]['duration'].replace(/[^0-9,\s]/g, " ").replace("  ", ":").replace("   ", ":").split(":"))

            }
        }
        let sec = 0;
        let min = 0;
        let hours = 0;
        for (let i = 0; i < no.length; i++) {
            hours = hours + parseInt(no[i][0])
            min = min + parseInt(no[i][1])
            sec = sec + parseInt(no[i][2])
        }
        let hmt = parseHMSToNormalTime(hours, min, sec)

        // if(lastInfo['status'] === true) {
        //
        //     var secT = hmt[2];
        //     var minT = hmt[1];
        //     var hrsT = hmt[0];
        //     const x = setInterval(function () {
        //         console.log("tick")
        //
        //         secT++;
        //         if (secT >= 60) {
        //             secT = 0;
        //             minT++;
        //             if (minT >= 60) {
        //                 minT = 0;
        //                 hrsT++;
        //             }
        //         }
        //         document.getElementById("absend-id").innerHTML = setZero(hrsT) + "г " + setZero(minT) + "хв " + setZero(secT) + "с "
        //         // if (distance < 0) {
        //         //     clearInterval(x);
        //         //     document.getElementById("absend-id").innerHTML = "EXPIRED";
        //         // }
        //     }, 1000);
        //
        // }
        // else {
        //
        //     //document.getElementById("absend-id").innerHTML = setZero(hmt[0]) + "г " + setZero(hmt[1]) + "xв " + setZero(hmt[2]) + "c"
        // }
        document.getElementById("absend-id").innerHTML = setZero(hmt[0]) + "г " + setZero(hmt[1]) + "xв "
        document.getElementById("absend-id").hidden = false
    }
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
    console.log(list);
}

function createLisItem(listItem) {
    const status = listItem['status']
    const start = listItem['start']
    const end = listItem['end']
    const total = listItem['duration']

    let pth = "";
    if (status === false) {
        pth = "https://i.ibb.co/4pksKzy/poweroff.png";
    }
    if (status === true) {
        pth = "https://i.ibb.co/XJ8Mszx/poweron.png";
    }
    const fromtxt = " з " + start;
    var totxt = " до " + end
    const dur = " тривалість: " + total;
    // console.log(dur)
    return '<div class="message"><img class="img" src=' + '"' + pth + '"' + '><div class="text_message_wrapper"><div class="from" id="fromtxt">' + fromtxt + '</div><div class="to" id="totxt">' + totxt + '</div><div class="total_message" id="dur">' + dur + '</div></div></div>'
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
    showLoadAnimation()
    getInfo(new Date(nor), "history")
}

function calendarDateToNormalDate(dateString){

    var dateArray = dateString.split(' ');
    var month = getMonth(dateArray[1])

    const options_now = { year: 'numeric', month: 'long', day: 'numeric' }
    var newCorrectData = new Date(Date.parse(dateArray[0] + " " + month + " " + dateArray[2]))
    console.log(newCorrectData.toLocaleDateString(undefined, options_now))
    console.log(newCorrectData + "Corect")
    return newCorrectData
}

function getMonth(monthFull) {
    let monthNamesLong = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
        'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
    let  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return monthNames[monthNamesLong.indexOf(monthFull)]
}
function showAlert(e) {
    var url = document.getElementById(e).innerText;
    var text = ""
    if(e==="absend-id") {
        text = "Загалом за добу електрика була відсутня  "+url
    }
    // if(e === "was-id") {
    //     text = "Всего за весь день электричество было "+url
    // }

    alert(text);
}

