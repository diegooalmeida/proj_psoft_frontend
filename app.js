const API = "http://localhost:8080/v1/api";
let $viewer = document.querySelector("#viewer");
let $message = document.querySelector("#message");
let token = undefined;

init();

function create_user (email, fname, lname, password, credit_card) {
    let user = {};
    user.email = email;
    user.fname = fname;
    user.lname = lname;
    user.password = password;
    user.credit_card = credit_card;
    return user;
}

function init () {
    if (token === undefined) document.querySelector("#logged_user").innerText = "Não tem ninguém logado";
    else document.querySelector("#logged_user").innerText = "Usuário logado.";

    let $template = document.querySelector("#home_view");
    $viewer.innerHTML = $template.innerHTML;

    let $sign_up_button = document.querySelector("#sign_up_button");
    $sign_up_button.addEventListener("click", sign_up_view);

    let $sign_in_button = document.querySelector("#sign_in_button");
    $sign_in_button.addEventListener("click", sign_in_view);
}

function cancel () {
    $message.innerText = "";
    token = undefined;
    init();
}

function sign_up_view () {
    let $template = document.querySelector("#sign_up_view");
    $viewer.innerHTML = $template.innerHTML;

    let $sign_up = document.querySelector("#sign_up");
    $sign_up.addEventListener("click", sign_up);
    let $cancel = document.querySelector("#cancel");
    $cancel.addEventListener("click", cancel);
}

function sign_up () {
    /* >>> */ console.log("Salvando usuário");

    let email = document.querySelector("#email").value;
    let fname = document.querySelector("#fname").value;
    let lname = document.querySelector("#lname").value;
    let password = document.querySelector("#password").value;
    let credit_card = document.querySelector("#credit_card").value;

    let user = create_user(email, fname, lname, password, credit_card);

    fetch(API + "/users", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body:JSON.stringify(user)
    })
    .then(r => {
        if (r.ok) return r.json();
        else {
            console.log("Email já cadastrado");
            $message.innerText = "Email já cadastrado. Tente novamente.";
        }
    })
    .then(d => {
        if (d != undefined) {
        $message.innerText = "Usuário cadastrado com sucesso!";
        setTimeout(_ => {
            $message.innerText = "";
        }, 2000);
        console.log("Usuário cadastrado");
        init();
    }
    });
}

function sign_in_view () {
    let $template = document.querySelector("#sign_in_view");
    $viewer.innerHTML = $template.innerHTML;

    let $sign_in = document.querySelector("#sign_in");
    $sign_in.addEventListener("click", sign_in);
    let $cancel = document.querySelector("#cancel");
    $cancel.addEventListener("click", cancel);
}

function sign_in () {
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    let user = create_user(email, "", "", password, "");

    fetch (API + "/auth/login", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(user)
    })
    .then(r => {
        console.log(r);
        if (r.ok) return r.json();
        else {
            if (r.status === 404) $message.innerText = "Usuário não encontrado.";
            else $message.innerText = "Senha inválida.";
        }
    })
    .then(d => {
        if (d != undefined) {
            token = d.token;
            $message.innerText = "Login realizado";
            setTimeout(_ => {
                $message.innerText = "";
            }, 2000);
            console.log("Login realizado");
            logged_user();
        }
        
    });
}

function logged_user_view () {
    let $template = document.querySelector("#logged_user_view");
    $viewer.innerHTML = $template.innerHTML;

    let $button = document.querySelector("#logout_button");
    $button.addEventListener("click", cancel);

    let $p = document.querySelector("#hello_message");
    let $user;
    fetch(API + "/users/auth")
    $p.innerText = "Olá " + 

}

//todo: o delete e apenas para testar o app, retirar depois
let $delete_button = document.querySelector("#delete_button");
$delete_button.addEventListener("click", del);
function del () {
    fetch(API + "/users", {
        method:"DELETE",
        headers: {'Content-Type': 'application/json'}
    })
}
