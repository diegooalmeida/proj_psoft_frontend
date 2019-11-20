const API = "http://localhost:8080/api";
let $top = document.querySelector("#top");
let $body = document.querySelector("#body");
let $message_div = document.querySelector("#message_div");
let token = undefined;

/*
    TODOS:
    - falta fazer um jeito de mudar a url padrão caso ela já existe (caso exista uma campanha
      com o memso nome).
      Para isso é preciso recuperar no backend se o nome já existe, e se sim, recuperar o id numérico
      da nova camapnha e colocar ele no fim da url. Isso poderia ser feito no backend, mas a especificação
      diz que não. Melhor perguntar a Dalton, já que é uma pequena alteração;
    - Fazer a listagem de campanhas na página inicial;
    - Fazer o link para cada campanha;
    - Após criar uma camapnha, redirecionar para a sua página.
*/ 

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

function create_campaign_object (name, description, deadline, goal) {
    let campaign = {};
    campaign.name = name;
    campaign.url = ((name) => {
        let url = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ").replace(/\s{2,}/g," ").trim().replace(/ /g,"-");
        return url;
    }) (name);
    campaign.description = description;
    campaign.deadline = deadline;
    campaign.goal = goal;
    return campaign;
}

function init () {
    // Top of the site
    if (is_logged()) load_logged_view();
    else load_not_logged_view(); 

    // Body of the site
    load_home_view();
}

function load_home_view () {
    let $template = document.querySelector("#home_view");
    $body.innerHTML = $template.innerHTML;

    let $create_campaign = document.querySelector("#create_campaign");
    $create_campaign.addEventListener("click", load_create_campaign_view);
}

function load_create_campaign_view () {
    console.log("load_create_campaign_view ()");
    if (!is_logged()) {
        console.log("User not logged.");

        $body.innerHTML = "";

        let $p = document.createElement("P");
        $p.innerText = "Você precisa estar logado para criar uma campanha.";

        let $back_button = document.createElement("BUTTON");
        $back_button.innerText = "Voltar";
        $back_button.addEventListener("click", load_home_view);

        $body.appendChild($p);
        body.appendChild($back_button);
    } else {

        console.log("Logged user, loading view to insert campaign data.");
        let $template = document.querySelector("#create_campaign_view");
        $body.innerHTML = $template.innerHTML;

        let $cancel = document.querySelector("#cancel");
        $cancel.addEventListener("click", cancel);

        let $create_campaign_button = document.querySelector("#create_campaign_button")
        $create_campaign_button.addEventListener("click", create_campaign);
    }
}

function create_campaign () {
    let name = document.querySelector("#name").value;
    let description = document.querySelector("#description").value;
    let deadline = document.querySelector("#deadline").value;
    let goal = document.querySelector("#goal").value.replace(',','.').replace(' ','');

    if (deadline.length !== 10 || is_in_the_past(deadline)) {
        $message_div.innerText = "Data inválida. Escreva uma data no formato dd/mm/yyyy e que ainda não tenha se passado.";
    } else {
        $message_div.innerText = "";
        let campaign = create_campaign_object(name, description, deadline, goal);
        fetch (API + "/campaigns/create", {
            method:"POST",
            headers: {"Content-Type":"application/json",
                      "Authorization":"Bearer " + token},
            body: JSON.stringify(campaign)
        })
        .then(r => r.json())
        .then(d => {
            console.log("Campanha criada com sucesso.");
            console.log(d);
        });
    }
}

function is_in_the_past (date) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    if (parseInt(date.substring(6)) > parseInt(yyyy))
        return false;
    else if (parseInt(date.substring(3,5)) > parseInt(mm))
        return false;
    else if (parseInt(date.substring(0,2)) > parseInt(dd))
        return false;
    else 
        return true;
}

function is_logged () {
    if (token === undefined) return false;
    return true;
}

function cancel () {
    console.log("Canceled action");
    $message_div.innerHTML = "";
    init();
}

function load_sign_up_view () {
    let $template = document.querySelector("#sign_up_view");
    $top.innerHTML = $template.innerHTML;

    let $sign_up = document.querySelector("#sign_up");
    $sign_up.addEventListener("click", sign_up);
    let $cancel = document.querySelector("#cancel");
    $cancel.addEventListener("click", cancel);
}

function sign_up () {
    /* >>> */ console.log("Registering user");

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
            console.log("Email already exists");
            $message_div.innerText = "Email já cadastrado, tente novamente";
            $message_div.append(document.createElement("hr"));
        }
    })
    .then(d => {
        if (d != undefined) {
            $message_div.innerText = "Usuário cadastrado com sucesso!";
            $message_div.append(document.createElement("hr"));
        setTimeout(_ => {
            $message_div.innerHTML = "";
        }, 2000);
        console.log("User registered");
        init();
    }
    });
}

function load_sign_in_view () {
    let $template = document.querySelector("#sign_in_view");
    $top.innerHTML = $template.innerHTML;

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
            if (r.status === 404) {
                $message_div.innerText = "Usuário não encontrado.";
                $message_div.append(document.createElement("hr"));
            }
            else {
                $message_div.innerText = "Senha inválida.";
                $message_div.append(document.createElement("hr"));
            }
        }
    })
    .then(d => {
        if (d != undefined) {
            token = d.token;
            $message_div.innerText = "Login realizado";
            $message_div.append(document.createElement("hr"));
            setTimeout(_ => {
                $message_div.innerHTML = "";
            }, 2000);
            console.log("Login realizado");
            load_logged_view();
        }
        
    });
}

function load_not_logged_view () {
    let $template = document.querySelector("#not_logged_view");
    $top.innerHTML = $template.innerHTML;

    let $sign_up_button = document.querySelector("#sign_up_button");
    $sign_up_button.addEventListener("click", load_sign_up_view);

    let $sign_in_button = document.querySelector("#sign_in_button");
    $sign_in_button.addEventListener("click", load_sign_in_view);
}

function load_logged_view () {
    let $template = document.querySelector("#logged_view");
    $top.innerHTML = $template.innerHTML;

    let $button = document.querySelector("#logout_button");
    $button.addEventListener("click", cancel);

    let $p = document.querySelector("#hello_message");
    let $user;

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + token);
    fetch(API + "/users/auth", {
        method:"GET",
        headers: headers
    })
    .then(r => r.json())
    .then(d => {
        $user = d;
        $p.innerText = "Olá " + $user.fname + " " + $user.lname;
    });

}
