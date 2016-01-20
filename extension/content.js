console.log = function() {}; // Disable console.log for release

var protocol = location.protocol,
    originalSrcKey = 'original-src',
    aSelector = 'a[href*="watch?v="]',
    aSelectorNoRecurse = `${aSelector}:not(:has(img))`,
    imgSelector = 'img[src*="i.ytimg.com/"]',
    imagePreviewInterval = 1000,
    intervalIdKey = 'interval-id',
    $previewImgEls = [];

$('body').on('mouseenter', imgSelector, handleImageMouseEnter);
$('body').on('mouseenter', aSelectorNoRecurse, handleLinkMouseEnter);

$('body').on('click', imgSelector, function() {
    handleMouseLeave();
});
$('body').on('click', aSelectorNoRecurse, function() {
    handleMouseLeave();    
});

function handleImageMouseEnter(e) {
    var $img = $(e.currentTarget);
    var $a = $img.closest(aSelector);
    var videoId = getVideoId($a);

    console.log('handleImageMouseEnter');

    handleMouseEnter($img, $img, $a, videoId);
}

function handleLinkMouseEnter(e) {
    var $a = $(e.currentTarget);
    var videoId = getVideoId($a);
    if (!videoId) {
        return;
    }

    var $img = $(`img[src*="${videoId}"]`).first();

    console.log('handleLinkMouseEnter');

    handleMouseEnter($a, $img, $a, videoId);
}

function handleMouseEnter($enterEl, $img, $a, videoId) {
    if (!$enterEl || !$enterEl.length || !$img || !$img.length || !$a || !$a.length || !videoId) {
        return;
    }

    console.log('handleMouseEnter');
    console.log('- $enterEl: ', $enterEl);
    console.log('- $img: ', $img);
    console.log('- $a: ', $a);
    console.log('- videoId: ', videoId);

    var originalSrc = $img.attr('src');

    $img.data(originalSrcKey, originalSrc);

    startPreview($enterEl, $img, videoId);
   
    $enterEl.one('mouseleave', function() {
        handleMouseLeave($img);
    });
}

function handleMouseLeave() {
    console.log('handleMouseLeave');

    var len = $previewImgEls.length;
    for (var i = 0; i < len; i++) {
        var $img = $previewImgEls[i],
            intervalId = $img.data(intervalIdKey),
            originalSrc = $img.data(originalSrcKey);

        clearInterval(intervalId);
        console.log('clearInterval:', intervalId);

        $img.attr('src', originalSrc);
    }

    $previewImgEls = [];
}

function getPreviewUrls(videoId) {
    var previewUrls = [];
    for (var i = 0; i < 4; i++) {
        var previewUrl = `${protocol}//img.youtube.com/vi/${videoId}/${i}.jpg`;
        previewUrls.push(previewUrl);
    }
    return previewUrls;
}

function getVideoId($a) {
    var videoId = $a.data('videoId');
    if (videoId) {
        return videoId;
    }

    var href = $a ? $a.attr('href') : undefined;
    var matches = href ? href.match(/\/?watch\?v=(.*)/i) : undefined;

    if (!matches || matches.length < 2) {
        return;
    }

    videoId = matches[1];
    if (!videoId) {
        return;
    }

    $a.data('videoId', videoId);
    return videoId;
}

function startPreview($enterEl, $img, videoId) {
    var viewIndex = 1,
        previewUrls = getPreviewUrls(videoId);

    showNextPreview();

    var intervalId = setInterval(function() {
        showNextPreview();
    }, imagePreviewInterval);

    console.log('setInterval:', intervalId);

    $img.data(intervalIdKey, intervalId);

    $previewImgEls.push($img);

    chrome.runtime.sendMessage({
        eventName: 'ThumbsPreviewForYoutube_Youtube_StartPreview',
        videoId: videoId
    });

    function showNextPreview() {
        var nextPreviewUrl = previewUrls[viewIndex];

        console.log('showNextPreview - viewIndex:', viewIndex);

        $img.attr('src', nextPreviewUrl);

        viewIndex = (viewIndex > 2) ? 0 : (viewIndex + 1);
    }
}