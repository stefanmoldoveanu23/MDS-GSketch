function checkFunction() {
    if ($("#pass").attr('type') === "password") {
        $("#pass").get(0).type = 'text';
    } else {
        $("#pass").get(0).type = "password";
    }
}