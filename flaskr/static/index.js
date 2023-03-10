function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

$(document).ready(function () {
    for (let i = 0; i < 15; i++) {
        let $span = $(document.createElement('span'));
        let $lef = getRandomInt(0, 100);
        let $wit = getRandomInt(100, 150);
        let $bot = getRandomInt(-190, -160);
        let $del = getRandomInt(0, 40);
        $span.css({
            'left': $lef + '%',
            'width': $wit + 'px',
            'height': $wit + 'px',
            'bottom': $bot + 'px',
            'animation-delay': $del + 's'
        });
        $(".squares").append($span);
    }
});