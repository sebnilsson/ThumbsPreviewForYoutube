var lastPreviewEl,
    protocol = location.protocol,
    elSelectors =
        // Shared
        '.yt-thumb-clip img, ' +
        '.yt-lockup-title a, ' +
        // Home
        '.video-thumb img, ' +
        '.yt-ui-ellipsis-wrapper, ' +
        // Player
        '.thumb-wrapper a, ' +
        '.thumb-wrapper img, ' +
        '.video-list-item a, ' +
        // User
        '.feed-item-snippet img, ' +
        '.feed-item-snippet .snippet-metadata b a, ' +
        '.lohp-media-object-content a, ' +
        '.lohp-video-link, ' +
        // Channel
        '.channels-content-item .yt-thumb-clip img, ' +
        '.channels-content-item .yt-lockup-content span, ' +
        // Playlist -- TODO: Find correct parent
        '.pl-video-thumbnail .yt-thumb-clip img, ' +
        '.pl-video-thumbnail .pl-video-title a',
    findImageParentSelector =  'li',
    findImageSelector = '.yt-thumb-clip img';

//console.log('elSelectors:', elSelectors);

document.addEventListener('mouseover', handleMouseOver);

function findImageEl(element) {
    var parentEl = findParent(element, findImageParentSelector);
    
    return parentEl ? parentEl.querySelectorAll(findImageSelector)[0] : undefined;
}

function findParent(element, parentSelector) {
    var parentEl = element ? element.parentNode : undefined;
    if (!parentEl) {
        return undefined;
    }

    if (parentEl.matches(parentSelector)) {
        return parentEl;
    }

    return findParent(parentEl, parentSelector);
}

function getPreviewUrls(videoId) {
    var previewUrls = [];
    for (var i = 0; i < 4; i++) {
        var previewUrl = protocol + '//img.youtube.com/vi/' + videoId + '/' + i + '.jpg';
        previewUrls.push(previewUrl);
    }
    return previewUrls;
}

function getVideoId(imgSrc) {
    var matches = imgSrc ? imgSrc.match(/.*\/vi.*\/(.*)\/.*\..*/) : undefined;
    return matches ? matches[1] : undefined;
}

function handleMouseOver(e) {
    var el = e.srcElement;
    if (!el.matches(elSelectors)) {
        //console.log('el does not match: ', el);
        return;
    }

    var imgEl = (el.matches('img')) ? el : findImageEl(el);
    if (!el || !imgEl) {
        return;
    }

    if (lastPreviewEl) {
        var mouseoutEvent = new CustomEvent('mouseout');
        lastPreviewEl.dispatchEvent(mouseoutEvent);
    }

    lastPreviewEl = el;
    startPreview(el, imgEl);
}

function startPreview(hoverEl, imgEl) {
    var intervalId,
        viewIndex = 1;

    function showNextPreview(previewUrls) {
        var currentPreviewUrl = previewUrls[viewIndex];

        imgEl.setAttribute('src', currentPreviewUrl);

        viewIndex = (viewIndex > 2) ? 0 : (viewIndex + 1);
    }

    function endPreview() {
        var originalSrc = imgEl.getAttribute('data-original-src');
        imgEl.setAttribute('src', originalSrc);

        clearInterval(intervalId);
        hoverEl.removeEventListener('mouseout', endPreview);
    }

    var src = imgEl.getAttribute('src');
    var videoId = getVideoId(src);
    if (!videoId) {
        return;
    }

    var previewUrls = getPreviewUrls(videoId);

    imgEl.setAttribute('data-original-src', src);

    showNextPreview(previewUrls);

    intervalId = setInterval(function() {
        showNextPreview(previewUrls);
    }, 1000);

    hoverEl.addEventListener('mouseout', endPreview);

    chrome.runtime.sendMessage({
        eventName: 'ThumbsPreviewForYoutube_Youtube_StartPreview',
        videoId: videoId
    });
}