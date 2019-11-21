const API = "http://localhost:8080/api";
let $top = document.querySelector("#top");
let $body = document.querySelector("#body");
let $message_div = document.querySelector("#message_div");
let storage = window.localStorage;

/*
    TODOS:
    - falta fazer um jeito de mudar a url padrão caso ela já existe (caso exista uma campanha
      com o memso nome).
      Para isso é preciso recuperar no backend se o nome já existe, e se sim, recuperar o id numérico
      da nova camapnha e colocar ele no fim da url. Isso poderia ser feito no backend, mas a especificação
      diz que não. Melhor perguntar a Dalton, já que é uma pequena alteração;
*/

init();

function create_user_object (email, fname, lname, password, credit_card) {
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

    if (window.location.hash === "") 
        window.location.hash = "/home"

    // Body of the site
    if (window.location.hash === "#/home")
        load_home_view();
    // Top of the site
    else if (window.location.hash === "#/sign-up")
        load_sign_up_view();
    else if (window.location.hash === "#/sign-in")
        load_sign_in_view();
    // Body
    else if (window.location.hash === "#/create-campaign")
        load_create_campaign_view();
    else if (window.location.hash.split("/")[1] === "campaign")
        load_campaign_view(window.location.hash.split("/")[2]);
}

function load_home_view () {
    let $template = document.querySelector("#home_view");
    $body.innerHTML = $template.innerHTML;

    let $create_campaign = document.querySelector("#create_campaign");
    $create_campaign.addEventListener("click", () => {
        window.location.hash = "/create-campaign";
        init();
    });

    fetch_top_5_campaigns();
}

function fetch_top_5_campaigns () {
    console.log("Loading campaigns.");
    fetch (API + "/campaigns/top-5", {
        "method":"GET",
        "headers":{"Content-Type":"application/json"}
    })
    .then (r => r.json())
    .then (d => {
        let $table = document.querySelector("#top_5_table");
        if (d.length === 0) {
            // TODO
        } else {
            let i = 1;
            d.forEach(element => {
                let $row = $table.insertRow(i);

                let $cell1 = $row.insertCell(0);
                let $cell2 = $row.insertCell(1);
                let $cell3 = $row.insertCell(2);
                let $cell4 = $row.insertCell(3);

                $cell1.innerText = element.name;
                $cell2.innerText = "R$" + element.donations + " / R$" + element.goal;
                $cell3.innerText = element.deadline;

                let $campaign_button = document.createElement("BUTTON");
                $campaign_button.innerText = "Ver página da campanha";
                $campaign_button.addEventListener("click", () => {
                    window.location.hash = "/campaign/" + element.url;
                    init();
                });
                $cell4.appendChild($campaign_button);

                i++;
            });
        }
    let $search_input = document.querySelector("#search_input")
    $search_input.addEventListener("keyup", refresh_top_5);
    })
    .then (() => {
        console.log("Campaigns load finished.");
    });
}

function refresh_top_5 () {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.querySelector("#search_input").value
    filter = input.toUpperCase();
    table = document.getElementById("top_5_table");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function load_campaign_view (campaign_url) {
    console.log("Fetching view for: " + campaign_url);

    fetch (API + "/campaigns/" + campaign_url, {
        "method":"GET",
        "headers":{"Content-Type":"application/json"}
    })
    .then (r => {
        console.log(r);
        if (!r.ok) {
            if (r.status === 404) {
                console.log("Campaign not found");
                $message_div.innerText = "Campanha não encontrada.";
                $message_div.append(document.createElement("hr"));
            }
        } else {
            return r.json();
        }
    })
    .then(d => {
        console.log(d);
        $message_div.innerHTML = "";
        if (d != undefined) {
            // Campaign:
            let $template = document.querySelector("#campaign_view");
            $body.innerHTML = $template.innerHTML;

            let $campaign = document.querySelector("#campaign_div");

            let $name = document.createElement("H2");
            $name.innerText = d.name;
            $campaign.appendChild($name);
            
            let $description = document.createElement("P");
            $description.innerText = "Descrição:\n" + d.description;
            $campaign.appendChild($description);

            let $progress = document.createElement("P");
            $progress.innerText = "Progresso da campanha:\nR$" + 
                                    Number(d.donations).toFixed(2) + " / R$" + Number(d.goal).toFixed(2);
            $campaign.appendChild($progress);

            let $deadline = document.createElement("P");
            $deadline.innerText = "Data de término da campanha:\n" + d.deadline;
            $campaign.appendChild($deadline);

            let $back_button = document.createElement("BUTTON");
            $back_button.innerText = "Voltar à página inicial"
            $back_button.addEventListener("click", () => {
                window.location.hash = "/home";
                init();
            });
            $campaign.appendChild($back_button);

            // Comments:
            fetch_campaign_comments(d);
        }
    });
}

function fetch_campaign_comments (campaign) {
    console.log("Beggining comments fetch");
    fetch (API + "/campaigns/" + campaign.url + "/comments", {
        method:"GET",
        headers: {"Content-Type":"application/json",
                  "Authorization":"Bearer " + storage.getItem("token")}
    })
    .then(r => r.json()
    )
    .then(d => {
        console.log(d);
        d.forEach(e => {
            let $comments_list = document.querySelector("#comments_list");
            let $comment = document.createElement("LI");
            $comment.innerText = e.text;
            $comments_list.appendChild($comment);
        })
    });
}

function load_create_campaign_view () {
    console.log("load_create_campaign_view ()");
    if (!is_logged()) {
        console.log("User not logged.");

        let $campaigns_options = document.querySelector("#campaigns_options");
        $campaigns_options.innerHTML = "";

        let $p = document.createElement("P");
        $p.innerText = "Você precisa estar logado para criar uma campanha.";

        let $back_button = document.createElement("BUTTON");
        $back_button.innerText = "Voltar";
        $back_button.addEventListener("click", () => {
            window.location.hash = "/home";
            init();
        });

        $campaigns_options.appendChild($p);
        $campaigns_options.appendChild($back_button);
    } else {

        console.log("Logged user, loading view to insert campaign data.");
        let $template = document.querySelector("#create_campaign_view");
        $body.innerHTML = $template.innerHTML;

        let $cancel = document.querySelector("#cancel");
        $cancel.addEventListener("click", () => {
            window.location.hash = "/home";
            cancel();
        });

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
                      "Authorization":"Bearer " + storage.getItem("token")},
            body: JSON.stringify(campaign)
        })
        .then(r => r.json())
        .then(d => {
            console.log("Campanha criada com sucesso.");
            console.log(d);

            window.location.hash = "/campaign/" + d.url;
            init();
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

// ********** TOP OF THE PAGE **********

function is_logged () {
    if (storage.getItem("token") === "null") return false;
    return true;
}

function cancel () {
    console.log("Canceled action");
    $message_div.innerHTML = "";
    window.location.hash === "/home"
    init();
}

function load_sign_up_view () {
    let $template = document.querySelector("#sign_up_view");
    $top.innerHTML = $template.innerHTML;

    let $sign_up = document.querySelector("#sign_up");
    $sign_up.addEventListener("click", sign_up);
    let $cancel = document.querySelector("#cancel");
    $cancel.addEventListener("click", () => {
        window.location.hash = "/home";
        cancel();
    });
}

function sign_up () {
    /* >>> */ console.log("Registering user");

    let email = document.querySelector("#email").value;
    let fname = document.querySelector("#fname").value;
    let lname = document.querySelector("#lname").value;
    let password = document.querySelector("#password").value;
    let credit_card = document.querySelector("#credit_card").value;

    let user = create_user_object(email, fname, lname, password, credit_card);

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
        window.location.hash = "/home";
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
    $cancel.addEventListener("click", () => {
        window.location.hash = "/home";
        cancel();
    });
}

function sign_in () {
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;
    let user = create_user_object(email, "", "", password, "");

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
            storage.setItem("token", d.token);
            $message_div.innerText = "Login realizado";
            $message_div.append(document.createElement("hr"));
            setTimeout(_ => {
                $message_div.innerHTML = "";
            }, 2000);
            console.log("Login realizado");
            window.location.hash = "/home";
            init();
        }
        
    });
}

function load_not_logged_view () {
    let $template = document.querySelector("#not_logged_view");
    $top.innerHTML = $template.innerHTML;

    let $sign_up_button = document.querySelector("#sign_up_button");
    $sign_up_button.addEventListener("click", () => {
        window.location.hash = "/sign-up";
        init();
    });

    let $sign_in_button = document.querySelector("#sign_in_button");
    $sign_in_button.addEventListener("click", () => {
        window.location.hash = "/sign-in";
        init();
    });
}

function load_logged_view () {
    let $template = document.querySelector("#logged_view");
    $top.innerHTML = $template.innerHTML;

    let $button = document.querySelector("#logout_button");
    $button.addEventListener("click", () => {
        storage.setItem("token", null);
        cancel();
    });

    let $p = document.querySelector("#hello_message");
    let $user;

    let headers = new Headers();
    headers.append("Authorization", "Bearer " + storage.getItem("token"));
    fetch(API + "/users/auth", {
        method:"GET",
        headers: headers
    })
    .then(r => {

        console.log(r);
        if (r.status === 403) {
            storage.setItem("token", null);
            init();
        } else 
            return r.json()
    })
    .then(d => {
        if (d !== undefined) {
            $user = d;
            $p.innerText = "Olá " + $user.fname + " " + $user.lname;
        }
    });

}