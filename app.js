const API = "http://localhost:8080/v1/api";
let $viewer = document.querySelector("#viewer");
let $message = document.querySelector("#message");

function init () {
    let $template = document.querySelector("#view_0");
    $viewer.innerHTML = $template.innerHTML;

    let $sign_up_button = document.querySelector("#sign_up_button");
    $sign_up_button.addEventListener("click", sing_up_view);

    //let $sign_in_button = document.querySelector("#sign_in_button");
    //$sign_in_button.addEventListener("click", sing_in_view());
}

function sing_up_view () {
    let $template = document.querySelector("#view_1");
    $viewer.innerHTML = $template.innerHTML;

    let $sign_up = document.querySelector("#sign_up");
    $sign_up.addEventListener("click", sign_up);
    let $cancel = document.querySelector("#cancel");
    $cancel.addEventListener("click", cancel);
}

function cancel () {
    $message.innerText = "";
    init();
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

function create_user (email, fname, lname, password, credit_card) {
    let user = {};
    user.email = email;
    user.fname = fname;
    user.lname = lname;
    user.password = password;
    user.credit_card = credit_card;
    return user;
}
init();

//todo: o delete e apenas para testar o app, retirar depois
let $delete_button = document.querySelector("#delete_button");
$delete_button.addEventListener("click", del);
function del () {
    fetch(API + "/users", {
        method:"DELETE",
        headers: {'Content-Type': 'application/json'}
    })
}
