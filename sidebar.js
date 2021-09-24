var _closed = true;

$(document).ready(() => {
    let username = localStorage.getItem("username");
    if(username) {
        $(".sidebar .username").val(username);
    }

    $(".sidebar .toggle-btn").on("click", () => {
        if(_closed) {
            _closed = false;
            $(".sidebar").css("transform", "translateX(0)");
            $(".container").css("transform", "scale(0.75) translateX(15%)");
            $(".sidebar .toggle-btn img").css("transform", "rotate(180deg)");
        }
        else {
            _closed = true;
            $(".sidebar").css("transform", "translateX(-95%)");
            $(".container").css("transform", "scale(1) translateX(0)");
            $(".sidebar .toggle-btn img").css("transform", "rotate(0deg)");
        }
    })
});