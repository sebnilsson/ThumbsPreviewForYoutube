loadAnalytics();

var analyticsCheckIntervalId = setInterval(function () {
    if (window.ga && typeof window.ga === 'function') {
        clearInterval(analyticsCheckIntervalId);
        return;
    }

    loadAnalytics();
}, 30000);

chrome.runtime.onInstalled.addListener(trackInstall);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.eventName === 'ThumbsPreviewForYoutube_Youtube_StartPreview') {
        trackStartPreview(message.videoId);
    }
});

function loadAnalytics() {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-58532954-1', 'auto');
	ga('send', 'pageview');
}

function trackInstall(details) {
    var reason = details.reason,
        previousVersion = details.previousVersion;

    ga('send', 'event', 'extension', 'install', reason, previousVersion);
}

function trackStartPreview(videoId) {
    ga('send', 'event', 'youtube', 'start-preview', videoId);
}