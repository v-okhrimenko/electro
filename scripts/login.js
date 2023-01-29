
showAnimation()
checkCookieOnServer();


function showAnimation() {
    // console.log("show loading")
    var x = document.getElementById("load").style = 'display: block;';
    // console.log(x)
}
function hideAnimation(){
    // console.log("hide loading")
    document.getElementById("load").style = 'display: none;';
}
function showLoginPage() {

    document.getElementById("container").style = 'display: none;';
    document.getElementById("login-page").style = 'display: flex;';

}
function showMainPage(){
    document.getElementById("container").style = 'display: flex;';
    document.getElementById("login-page").style = 'display: none;';
}
function showErrorMessage(){
    document.getElementById("login-error-msg").style.opacity= "1"
}
function hideErrorMessage(){
    document.getElementById("login-error-msg").style.opacity= "0"
}


let userTable
function logoutConfirmDialog(){
    if (window.confirm("Ви дійсно бажаете вийти з аккаунту?")) {
        logoutServer()
    }
}
async function logoutServer(){
        let userCookie = getCookie("user");
        try {
            const responsesJSON = await Promise.all([
                fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=logout_'+ userCookie),
            ]);
            const [lastInfo] = await Promise.all(responsesJSON.map(r => r.json()));
            document.cookie = "user=" + "0"
            showLoginPage()
        } catch (err) {
            throw err;
        }
}
async function checkCookieOnServer() {
    let userCookie = getCookie("user");
    try {

        const responsesJSON = await Promise.all([
            fetch(
                'https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=cookies_'
                + userCookie),
        ]);

        const [ids] = await Promise.all(responsesJSON.map(r => r.json()));
        if(ids['status'] === false) {
            hideAnimation()
            showLoginPage()
        }
        else {
            hideAnimation()
            showMainPage()
            userTable = ids['table']

            getInfo(new Date(), "now")
        }

    } catch (err) {
        throw err;
    }

}
const checkLoginPasswordOnServer = async (login, password, cookie) => {
    try {
        const responsesJSON = await Promise.all([
            fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=auth_' + login + "*" + password + "*" + cookie),
        ]);

        const [id] = await Promise.all(responsesJSON.map(r => r.json()));
        hideAnimation()
        if(id['status']=== true) {
            userTable = id['table']
            document.cookie = "SameSite=Lax"
            document.cookie = "user="+cookie

            showMainPage()
            getInfo(new Date(), "now", userTable)

        } else {
            showErrorMessage()
        }

    } catch (err) {
        throw err;
    }
};

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

document.getElementById("btn_login").onclick =  function() {
    if(checkLoginPasswordLength() === false) {
        alert("Введіть логін та пароль")
    }
    else {
        const login = document.getElementById("login").value
        const password = document.getElementById("password").value
        const cookie = new Date().getMilliseconds()*34
        showAnimation()
        checkLoginPasswordOnServer(login, password, cookie).then(r => {

        })
    }
}
$("#login").on('change keydown paste input', function(){
    //'display: flex;';

    var x = document.getElementById("login-error-msg").style.opacity
    //console.log(x)
    if(x === "1"){
        hideErrorMessage()
    }
});
$("#password").on('change keydown paste input', function(){
    //'display: flex;';

    var x = document.getElementById("login-error-msg").style.opacity
    // console.log(x)
    if(x === "1"){
        hideErrorMessage()
    }
});
function checkLoginPasswordLength() {
    const login = document.getElementById("login").value
    const password = document.getElementById("password").value
    return !(login.length === 0 || password.length === 0);
}

