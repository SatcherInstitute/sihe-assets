
Permalink = {};
Permalink.Utils = {};
Permalink.Utils.importScript = function (url, nodeName, callback) {
  if (nodeName == null) {
    nodeName = "head";
  }

  var script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.src = url;

  // Attach callback for when the script is loaded
  if (callback) {
    script.onload = callback;
    script.onerror = function () {
      console.error("Failed to load script: " + url);
    };
  }

  var placement = document.getElementsByTagName(nodeName)[0];
  placement.appendChild(script);
};

Permalink.Utils.importStyleSheet = function(url, nodeName) {
  if (nodeName == null) {
    nodeName = "head";
  }

  var link = document.createElement("link");
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  link.media = 'screen';
  var placement = document.getElementsByTagName(nodeName)[0];
  placement.appendChild(link);
};

Permalink.Utils.parseQueryString = function(query) {
  var params = {};

  if (!query) {
    return params;
  }
  if (query.indexOf("?") > -1) {
    query = query.substring(query.indexOf("?") + 1);
  }

  var pairs = query.split(/[;&]/);
  for (var i = 0; i < pairs.length; i++) {
    var idx = pairs[i].indexOf("=");
    var keyVal = [pairs[i].substring(0, idx), pairs[i].substring(idx + 1)];
    if (!keyVal || keyVal.length != 2) {
      continue;
    }

    var key = unescape(keyVal[0]);
    var val = unescape(keyVal[1]);
    val = val.replace(/\+/g, ' ');
    params[key] = val;
  }

  return params;
};

Permalink.Utils.getScriptDomainURL = function() {
  var scripts = document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    var idx = src.indexOf("page/js");
    if (idx > -1) {
      return src.substring(0, idx);
    }
  }
  return "https://myemail-op.constantcontact.com";
};

Permalink.Utils.getScriptParameters = function() {
  var scripts = document.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    var idx = src.indexOf("/campaignPage.js?");
    if (idx > -1) {
      var queryString = src.substring(idx + ("/campaignPage.js".length+1));
      return Permalink.Utils.parseQueryString(queryString);
    }
  }

  return null;
};

Permalink.Events = {};
Permalink.Events.addListener = function(object, type, callback) {
  var event = "on" + type;

  if (object.addEventListener) {
    object.addEventListener(type, callback, false);
  } else if (object.attachEvent) {
    object.attachEvent(event, callback);
  } else if (object[event] != undefined) {
    try {
      object[event] += callback;
    } catch (Error) {
      object[event] = callback;
    }
  }
};

Permalink.Events.removeListener = function(object, type, callback) {
  var event = "on" + type;

  if (object.removeEventListener) {
    object.removeEventListener(type, callback);
  } else if (object.attachEvent) {
    object.detachEvent(event, callback);
  } else if (object[event] != undefined) {
    try {
      object[event] -= callback;
    } catch (Error) {
      object[event] = null;
    }
  }
};

// google anylitics account vars...
var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-17037590-1"]);
_gaq.push(["_trackPageview"]);

Permalink.CampaignPage = {};
Permalink.CampaignPage.init = function () {
  var absoluteURL = Permalink.Utils.getScriptDomainURL() + "page/css/share-btn.css";
  Permalink.Utils.importStyleSheet(absoluteURL, "head");

  let dependenciesResolved = false;
  function initializeCampaignPage() {
    if (!dependenciesResolved) {
      dependenciesResolved = true;
      return;
    }
    if (typeof ($) == 'function' && $ != jQuery) {
      jQuery.noConflict();
    }
    Permalink.CampaignPage.renderShareBar();
    Permalink.CampaignPage.enableInlineVideo();
  }

  if (typeof (jQuery) === "undefined") {
    Permalink.Utils.importScript(
      "https://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js",
      "head",
      function () {
        // jQuery is now loaded
        initializeCampaignPage();
      }
    );
  } else {
    // jQuery is already loaded
    dependenciesResolved = true;
  }

  Permalink.Events.addListener(window, "load", function() { initializeCampaignPage(); });

  // Load Google Analytics
  Permalink.Utils.importScript("https://www.google-analytics.com/ga.js", "head");
};

Permalink.CampaignPage.renderShareBar = function() {
  // remove paddings and margins if any...
  jQuery('body').css({padding: '0px', margin: '0px'});

  var imageMargins = "0px";
  if (jQuery.browser.mozilla) {
    imageMargins = "-6px";
  } else if (jQuery.browser.msie && jQuery.browser.version < 8) {
    imageMargins = "-2px";
  }

  // get paremeters...
  var params = Permalink.Utils.getScriptParameters();
  if (params == null) {
    params.visitorHost = "https://visitor.constantcontact.com";
    params.pageName = "";
    params.soid = 0;
  }

  var ts = (new Date()).getTime();
  var pageUrl = window.location.href;
  // remove hash from page url so to not be shared...
  if (window.location.hash) {
    pageUrl = pageUrl.substring(0, pageUrl.lastIndexOf(window.location.hash));
  }

  var pageUrlEscaped = escape(pageUrl);
  var body = jQuery('body');

  // tracking targets...
  var isTrackingEnabled = typeof(__plink_targets) != "undefined";
  var targets = {};
  if (isTrackingEnabled) {
    targets = __plink_targets;
  } else {
    targets = {
      "linkedin.post": "https://www.linkedin.com/shareArticle?url="+pageUrlEscaped,
      "facebook.share": "https://www.facebook.com/sharer.php?u="+pageUrlEscaped,
      "facebook.send": null,
      "permalink.view": null,
      "x.tweet": "https://x.com/intent/tweet?status="+params.pageName+"+"+pageUrlEscaped
    };
  }

  // tracking pixel...
  var trackingPixel = '';
  if (isTrackingEnabled && targets["permalink.view"] != null) {
    trackingPixel = '<img src="'+targets["permalink.view"]+'&_ts='+ts+'" height="1" width="1" border="0" />';
  }

  // sharebar code...
  var sharebar =
    '<div class="shr-bar">'+
    '<div class="shr-bar-wrap">'+
    trackingPixel+
    '<div class="items-left">'+
    '<div>&nbsp;&nbsp;SHARE:&nbsp;&nbsp;</div>'+
    '<div id="facebook-btn-wrap" class="icon-padding">'+
    '<a href="'+targets["facebook.share"]+'" target="_blank"><img src="https://static.ctctcdn.com/letters/images/permalink/facebook.svg" height="19" width="10" /></a>'+
    '</div>'+
    '<div id="x-btn-wrap" class="icon-padding">'+
    '<a href="'+targets["x.tweet"]+'" target="_blank"><img src="https://static.ctctcdn.com/letters/images/permalink/x-logo.svg" height="19" width="18" /></a>'+
    '</div>'+
    '</div>'+
    '<div class="items-right">'+
    '<a class="jmml-text" href="'+unescape(params.visitorHost)+'/d.jsp?m='+params.soid+'&p=oi" target="_blank"><div id="jmml-btn-wrap" class="jmml-button">Join Our Email List</div></a>'+
    '<div id="powered-by-wrap" class="icon-padding"><a href="https://www.constantcontact.com/index.jsp?cc=DLviral10" target="_blank"><img src="https://static.ctctcdn.com/ui/images1/REBRAND_ctct_nav_logo.svg" width="30" /></a></div>'+
    '</div>'+
    '</div>'+
    '</div>';

  // add to the document...
  body.prepend(sharebar);

  // attach our tracking event top tweet button and open the tweet window...
  jQuery(".custom-tweet-btn").click(function() {
    window.open("https://x.com/share?url="+pageUrlEscaped, "cc_x_tweet", "location=true,status=true,width=550,height=450").focus();
    if (isTrackingEnabled) {
      (new Image()).src = targets["x.tweet"]+"&_ts="+ts;
    }
    return false;
  });

  // add fbxml to the document and create tracking event...
  body.append('<div id="fb-root"></div>');
  window.fbAsyncInit = function() {
    FB.init({appId: "120295828008556", status: true, cookie: true, xfbml: true});
    // code to track when a user sends a message through facebook
    FB.Event.subscribe("message.send", function(href, widget) {
      (new Image()).src = targets["facebook.send"]+"&_ts="+ts;
    });

  };
  (function() {
    var e = document.createElement('script'); e.async = true;
    e.src = document.location.protocol +  '//connect.facebook.net/en_US/all.js';
    document.getElementById('fb-root').appendChild(e);
  }());

};
Permalink.CampaignPage.getVideoInfo = function(video) {
    var info = {};
    if (!video.href) {
      return info;
    }
    if (video.href.indexOf('https://vimeo.com/') === 0) {
      info.type = "vimeo";
      info.videoId = video.href.slice(18); // '220693783';
    } else if (video.href.indexOf('https://www.youtube.com/watch') === 0) {
      info.type = "youtube";
      info.videoId = video.href.slice(32); // '220693783';
      if (info.videoId.indexOf('&') > 0) {
        info.videoId = info.videoId.substring(0, info.videoId.indexOf('&'));
      }
    }
    return info;
};
Permalink.CampaignPage.enableInlineVideo = function() {
  var webExtractThumbnailSelector = '[src*="constantcontact.com/v1/thumbnail?"][src^="https://web-extract"]';
  var vimeoThumbnailSelector = '[src^="https://i.vimeocdn.com"]';
  var thumbnailSelectors = [webExtractThumbnailSelector, vimeoThumbnailSelector].join(',');

  try {
    document.querySelectorAll(thumbnailSelectors).forEach(function (previewEl) {
    var video = previewEl.parentNode;
    var videoInfo = Permalink.CampaignPage.getVideoInfo(video);

    if (videoInfo.type) {
      var container = video.parentNode;
      var videoEl = document.createElement('IFRAME');
      var allow = [
        'accelerometer',
        'autoplay',
        'encrypted-media',
        'fullscreen',
        'gyroscope',
        'picture-in-picture'
      ];
      var settingsMap = {
        autopause: 0,
        playsinline: 1,
        muted: 1,
        responsive: 1
      };
      if (videoInfo.type === "vimeo") {
        settingsMap.autoplay = 1;
      }
      var settings = Object.keys(settingsMap).map(function (key) { return key + '=' + settingsMap[key]; }).join('&');
      var playerUrl;
      var playerStyle = 'margin: 0; padding: 0; top: 0; left: 0; width: 560px; height: 300px;';
      if (videoInfo.type === "vimeo") {
        if (typeof Vimeo === 'undefined') {
          var scriptEl = document.createElement('SCRIPT');
          scriptEl.setAttribute('src', 'https://player.vimeo.com/api/player.js');
          scriptEl.setAttribute('defer', '');
          scriptEl.setAttribute('async', '');
          container.appendChild(scriptEl);
        }
        playerUrl = 'https://player.vimeo.com/video/' + videoInfo.videoId + '?' + settings;
      } else {
        playerUrl = 'https://www.youtube.com/embed/' + videoInfo.videoId + '?' + settings;
      }
      var attrsMap = {
        allow: allow.join('; '),
        allowfullscreen: '',
        frameborder: 0,
        id: videoInfo.videoId,
        mozallowfullscreen: '',
        src: playerUrl,
        style: playerStyle,
        webkitallowfullscreen: ''
      };
      Object.keys(attrsMap).forEach(function (key) { videoEl.setAttribute(key, attrsMap[key]); });
      var wrapperEl = document.createElement('DIV');
      wrapperEl.setAttribute('style', 'position: relative;');
      wrapperEl.appendChild(videoEl);
      container.replaceChild(wrapperEl, video);

      if (videoInfo.type === "vimeo") {
        var unmuteEl = document.createElement('INPUT');
        unmuteEl.setAttribute('type', 'button');
        unmuteEl.setAttribute('value', '\uD83D\uDD07');
        unmuteEl.setAttribute('data-player-id', videoInfo.videoId);
        unmuteEl.onclick = function handleOnclick(e) {
          var toggle = unmuteEl.getAttribute('value') === '\uD83D\uDD0A';
          (new Vimeo.Player(document.getElementById(e.target.getAttribute('data-player-id')))).setMuted(toggle);
          unmuteEl.setAttribute('value', toggle ? '\uD83D\uDD07' : '\uD83D\uDD0A');
        }
        container.appendChild(unmuteEl);
      }
    }
  });
} catch (e) {}




};



// initialize campaign page...
Permalink.CampaignPage.init();
