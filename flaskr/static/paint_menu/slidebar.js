const
    sidebar = $("nav"),
    toggle = $(".toggle"),
    modeSwitch = $(".toggle-switch"),
    modeText = $(".mode-text");

toggle.click(function () {
    sidebar.toggleClass("close");
})

modeSwitch.click(function () {
    sidebar.toggleClass("dark");

    if (sidebar.hasClass("dark")) {
        modeText.text("Light mode");
    } else {
        modeText.text("Dark mode");

    }
});

function preview(e) {
    $("#background").css("background-color", e.value);
}

$("#picker").kendoColorPicker({
    value: "#000000",
    buttons: false,
    select: preview
});


function copy() {
    let copyText = $("#copyClipboard");
    copyText.select();
    navigator.clipboard.writeText(copyText.val());
}


$('.tools').click(function (event) {

    if ($(event.target).is('i')) {
        $(".tools").find('div').removeClass("clicked");
        $(event.target).parent().addClass("clicked");
    }
    if ($(event.target).hasClass('box')) {
        $(".tools").find('div').removeClass("clicked");
        $(event.target).addClass("clicked");
    }
});


