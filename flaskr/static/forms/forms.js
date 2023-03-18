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



//breakdown the labels into single character spans
$(".form_content label").each(function() {
    let sop = '<span class="ch">'; //span opening
    let scl = '</span>'; //span closing
    //split the label into single letters and inject span tags around them
    $(this).html(sop + $(this).html().split("").join(scl + sop) + scl);
    //to prevent space-only spans from collapsing
    $(".ch:contains(' ')").html("&nbsp;");
})

let x = $(".form_content input");
let d;
//animation time
x.focus(function() {
    //calculate movement for .ch = half of input height
    let tm = $(this).outerHeight() / 4 * -3 + "px";
    //label = next sibling of input
    //to prevent multiple animation trigger by mistake we will use .stop() before animating any character and clear any animation queued by .delay()
    $(this).next().addClass("focussed").children().stop(true).each(function(i) {
        d = i * 50; //delay
        $(this).delay(d).animate({
            top: tm
        }, 200, 'easeOutBack');
    })
})
x.blur(function() {
    //animate the label down if content of the input is empty
    if ($(this).val() === "") {
        $(this).next().removeClass("focussed").children().stop(true).each(function(i) {
            d = i * 50;
            $(this).delay(d).animate({
                top: 0
            }, 500, 'easeInOutBack');
        })
    }
})