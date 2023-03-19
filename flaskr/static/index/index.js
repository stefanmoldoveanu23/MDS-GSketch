function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

let mouse_is_inside = false
$(document).ready(function () {
    for (let i = 0; i < 20; i++) {
        let $span = $(document.createElement('span'));
        let $lef = getRandomInt(0, 100);
        let $wit = getRandomInt(100, 150);
        let $hei = getRandomInt(100, 150);
        let $bot = getRandomInt(-190, -160);
        let $del = getRandomInt(0, 40);
        $span.css({
            'left': $lef + '%',
            'width': $wit + 'px',
            'height': $hei + 'px',
            'bottom': $bot + 'px',
            'animation-delay': ($del - i) + 's'
        });
        $(".squares").append($span);
    }

    $('#join_board').click(() => {
        $('#join').css('display', 'flex');
        $('.homecontent').children().not('.page_shape').addClass("blur-all");
        $('.page_shape').children().not('#join', 'form').addClass("blur-all");
        $('.create').addClass("blur-all");
        $(".squares").addClass("blur-all");
    });

    $('#join').hover(function () {
        mouse_is_inside = true;
    }, function () {
        mouse_is_inside = false;
    });

    $("body").mouseup(function () {
        if (!mouse_is_inside) {
            $('#join').hide();
            $('.homecontent').children().not('.page_shape').removeClass("blur-all");
            $('.page_shape').children().not('#join', 'form').removeClass("blur-all");
            $('.create').removeClass("blur-all");
            $(".squares").removeClass("blur-all");
        }
    });

    let err_msg_box = $(".err_msg")
    if (err_msg_box.length) {
        err_msg_box.slideDown("slow");
        err_msg_box.delay(1500);
        err_msg_box.slideUp("slow");
    }

});

