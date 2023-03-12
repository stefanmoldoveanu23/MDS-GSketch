function checkFunction() {
    let pass_field = $("#passo")
    let conf_pass_field = $("#confpass")
    if (pass_field.length) {// element exists
        if (pass_field.attr('type') === "password") {
            pass_field.get(0).type = 'text';
        } else {
            pass_field.get(0).type = "password";
        }
    }
    if (conf_pass_field.length) {            // element exists
        if (conf_pass_field.attr('type') === "password") {
            conf_pass_field.get(0).type = 'text';
        } else {
            conf_pass_field.get(0).type = "password";
        }
    }

}

let err_msg_box = $(".err_msg")
if (err_msg_box.length) {
    err_msg_box.slideDown("slow");
    err_msg_box.delay(1500);
    err_msg_box.slideUp("slow");
}


