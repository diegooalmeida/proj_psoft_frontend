const API = "http://localhost:8080/v1/api";
let users = [];

let $message = document.querySelector("#message");
let $button = document.querySelector("#button");
$button.addEventListener("click", save);
let $delete_button = document.querySelector("#delete_button");

//todo: o delete e apenas para testar o app, retirar depois
$delete_button.addEventListener("click", del);
function del () {
    fetch(API + "/users", {
        method:"DELETE",
        headers: {'Content-Type': 'application/json'}
    })
    .then(r => {
        users = [];
        fetch_users(users);
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

function save () {
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
        users.push(d);
        fetch_users(users);
    }
    });
}

function fetch_users (data) {
    users = data;
    console.log("Carregando usuários");
    let $users = document.querySelector("#users_div");
    $users.innerHTML = "";
    users.forEach((e, i) => {
        let $p = document.createElement("p");
        $users.appendChild($p);
        $p.innerText = "Nome: " + users[i].fname + " " + users[i].lname + "\nEmail: " + users[i].email;
    });
    console.log("Fim do carregamento de usuários");
}

function init() {
    console.log("Iniciando página");
    fetch(API + "/users")
    .then(r => r.json())
    .then(d => fetch_users(d));
    console.log("Fim da inicialização");
}

init();

