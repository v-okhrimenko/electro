
let userTable
function logout(){

    if (window.confirm("Ви дійсно бажаете вийти з аккаунту?")) {

        document.getElementById("login-page").style = 'display: flex;';

    }

    document.cookie = "user="+"0"
}
async function checkCookieOnServer() {
    let userCookie = getCookie("user");
    console.log(userCookie + " USER COOKIE")
    try {

        const responsesJSON = await Promise.all([
            fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=cookies_' + userCookie),
        ]);

        const [ids] = await Promise.all(responsesJSON.map(r => r.json()));
        console.log(ids['status'] + " FROM COOKIE")
        if(ids['status'] === false) {
            // document.getElementById("main-login-container").style = 'display: block;';
            document.getElementById("login-page").style = 'display: flex;';
            document.getElementById("load").style = 'display: none;';

        }
        else {
            userTable = ids['table']
            document.getElementById("testid").style = 'display: block;';
            // document.getElementById("login-page").style = 'display: none;';
            // getInfo(new Date(), "now", ids['table'])
            getInfo(new Date(), "now")
        }

    } catch (err) {
        throw err;
    }

}

checkCookieOnServer();


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
        console.log(cookie)
        checkLoginPasswordOnServer(login, password, cookie).then(r => {

        })
    }
}

const checkLoginPasswordOnServer = async (login, password, cookie) => {
    console.log(login + " " + password + " " + cookie)
    document.getElementById("load").style = 'display: block;';
    try {

        const responsesJSON = await Promise.all([
            fetch('https://script.google.com/macros/s/AKfycbwHSI0xmeZXgFHW6fhKBuPtBFFW142ovMp6BdIXPd19FoK3bw2a1PDMLBJXATew2W-D/exec?param=auth_' + login + "*" + password + "*" + cookie),
            // fetch('https://script.google.com/macros/s/AKfycbybVQGdCOLKgifcMT0W1n1bd3q8y0jzguAoy0EaS8g/dev?param=auth_' + login + "*" + password),
        ]);

        const [id] = await Promise.all(responsesJSON.map(r => r.json()));
        console.log(id)
        if(id['status']=== true) {
            userTable = id['table']
            document.cookie = "user="+cookie
            console.log(document.cookie)

            document.getElementById("testid").style = 'display: block;';
            document.getElementById("login-page").style = 'display: none;';
            // document.getElementById("load").style = 'display: ;';
            getInfo(new Date(), "now", userTable)



        } else {
            document.getElementById("load").style = 'display: none;';
            alert("Корисчувача не знайдено! Вкажіть дійсні логін та пароль!")

        }

    } catch (err) {
        throw err;
    }
};


function checkLoginPasswordLength() {
    const login = document.getElementById("login").value
    const password = document.getElementById("password").value
    return !(login.length === 0 || password.length === 0);
}

