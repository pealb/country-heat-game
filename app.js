var points = 0;
var username = "";

fetchCountries = async () => {
    let countries = (await axios.get("./assets/data/eu-countries.json")).data;

    localStorage.setItem("countries", JSON.stringify(countries));
    
    return countries;
}

fetchTemp = async (country) => {
    let temp = (await axios.get(`https://wttr.in/${country}?format=j1`)).data;

    return temp;
}

compare = async (c1, c2) => {
    $("#game-container").css("display", "none");
    $(".left .lds-roller").css("display", "inline-block");

    let temp1 = await fetchTemp(c1);
    let temp2 = await fetchTemp(c2);

    $("#game-container").css("display", "block");
    $(".left .lds-roller").css("display", "none");

    temp1 = temp1.current_condition[0].temp_C;
    temp2 = temp2.current_condition[0].temp_C;

    if(temp2 > temp1) {
        points += 100;

        $(".points-container .add").css("display", "block");
        setTimeout(() => {
            $(".points-container .add").css("display", "none");
        }, 750);

        refreshPoints();
        selectRandomCountry();
    }
    else {
        $("#game-container").css("display", "none");
        $("#game-over p").html(`Játék vége, elért pontszám: ${points}`);
        $("#game-over").css("display", "block");

        $(".left").css("width", "30%");
        $(".right").css("width", "70%");

        await axios.post("https://611e86bc9771bf001785c50e.mockapi.io/scores", {name: username, score: points});
        
        updateLeaderboard();
        points = 0;
    }
}

selectRandomCountry = async () => {
    let countries = JSON.parse(localStorage.getItem("countries")) || await fetchCountries();

    let random = Math.floor(Math.random() * countries.length);
    let randomCountry = countries[random];

    $("#random-country").html(randomCountry.name);
    $(`option[value="${randomCountry.name}"]`).attr("disabled", "disabled");
}

refreshPoints = () => {
    $("#points").html(`Pontszám: ${points}`);
}

updateLeaderboard = async () => {    
    $(".right table").css("display", "none");
    $(".right .lds-roller").css("display", "inline-block");
    let scores = (await axios.get("https://611e86bc9771bf001785c50e.mockapi.io/scores")).data;
    
    scores = scores.sort((first, second) => {
        if(first.score > second.score) {
            return -1;
        }
        else if(first.score < second.score) {
            return 1;
        }
        return 0;
    });
    
    scores = scores.slice(0, 10);
    
    $(".right .lds-roller").css("display", "none");
    $(".right table").css("display", "table");
    $("table tbody").remove();
    $("table").append("<tbody></tbody>");
    
    scores.forEach((item) => {
        let date = new Date(item.createdAt);
        
        $("table tbody").append(
            `<tr>
            <td>${item.name}</td>
            <td>${item.score}</td>
            <td>${date.getFullYear()}-${date.getMonth()}-${date.getDate()}</td>
            </tr>`
            );
        });
}

addOptions = async () => {
    let countries = JSON.parse(localStorage.getItem("countries")) || await fetchCountries();
    let options = document.getElementsByTagName("option");
    options = [...options];
    options.forEach((item) => {
        $(item).remove();
    });

    countries.forEach((country) => {
        $("select").append(`<option value="${country.name}">${country.name}</option>`);
    });
}

$(document).ready(() => {
    updateLeaderboard();

    username = localStorage.getItem("username");
    if(username) { 
        $(".container .username").css("display", "none");
        $("#start-btn").removeAttr("disabled");
    }

    $("#start-btn").on("click", async (e) => {
        $(".left").css("width", "70%");
        $(".right").css("width", "30%");

        $(e.target).css("display", "none");
        $("#game-container").css("display", "block");

        if(!username) {
            username = $(".container .username").val();
            localStorage.setItem("username", username);
        }
        
        $(".container .username").css("display", "none");
        refreshPoints();
        addOptions();
        selectRandomCountry();
    });

    $('#compare-btn').on("click", (e) => {
        e.preventDefault();
        let selected = $("select").val();

        $(`option[value="${selected}"]`).remove();
        $(`option[value="${$("#random-country").html()}"]`).removeAttr("disabled");

        compare($("#random-country").html(), selected);
    });

    $("#restart-btn").on("click", () => {
        $(".left").css("width", "70%");
        $(".right").css("width", "30%");
        
        points = 0;
        $("#game-over").css("display", "none");
        $("#game-container").css("display", "block");
        addOptions();
        selectRandomCountry();
        refreshPoints();
    });

    $(".container .username").on("input", (e) => {
        if(e.target.value.length >= 3) {
            $("#start-btn").removeAttr("disabled");
        }
        else {
            $("#start-btn").attr("disabled", "disabled");
        }
    })
})
