(function($) {
    $(window).load(function() {
        var $receiver = $('[data-lightbox-receive]');

        var lightboxIsActive = function() {
            return $receiver.hasClass('lightbox-active');
        };

        var setReceiverState = function(group, index, media, title, container, cb) {
            $receiver.data('lightbox-current-group', group);
            $receiver.data('lightbox-current-index', index);
            $receiver.find('.title').html(title);
            var $container = $receiver.find('.media-content');
            $container.empty();
            $receiver.addClass('loading');

            var loaded = function() {
                $receiver.removeClass('loading');
                if (!!cb) cb();
            };

            switch (container) {
                case 'video':
                case 'audio':
                    var $player = $('<' + container + '>');
                    $player.attr('controls', 'controls');
                    $player.attr('src', media);
                    $container.append($player);
                    loaded();
                    break;
                case 'external-video':
                case 'iframe':
                    var $iframe = $('<iframe>');
                    $iframe.attr('src', media);
                    $container.append($iframe);
                    $iframe.on('load', loaded);
                    break;
                case 'image':
                    var $img = $('<img>');
                    $img.attr('alt', title);
                    $img.css('opactity', 0);
                    $container.append($img);
                    $img.on('load', function() {
                        var containerWidth = $container.width();
                        var containerHeight = $container.height();
                        var imageWidth = $(this)[0].naturalWidth;
                        var imageHeight = $(this)[0].naturalHeight;
                        var finalWidth = imageWidth;
                        var finalHeight = imageHeight;
                        if (imageWidth > containerWidth) {
                            finalWidth = containerWidth;
                            finalHeight = finalWidth * imageHeight / imageWidth;
                            if (finalHeight > containerHeight) {
                                finalHeight = containerHeight;
                                finalWidth = finalHeight * imageWidth / imageHeight;
                            }
                        } else if (imageHeight > containerHeight) {
                            finalHeight = containerHeight;
                            finalWidth = finalHeight * imageWidth / imageHeight;
                            if (finalWidth > containerWidth) {
                                finalWidth = containerWidth;
                                finalHeight = finalWidth * imageHeight / imageWidth;
                            }
                        }
                        $(this).css({
                            width: finalWidth,
                            height: finalHeight,
                            opacity: 1
                        });
                        loaded();
                    });
                    $img.attr('src', media);
                    break;
                case 'fichier':
                default:
                    var $a = $('<a>');
                    $a.attr('href', media);
                    $a.text('TÃ©lÃ©charger');
                    var $p = $('<p>');
                    $p.html('Le fichier Â«&nbsp;' + title + '&nbsp;Â» ne peut pas Ãªtre prÃ©visualisÃ©. <br>');
                    $p.append($a);
                    $container.append($p);
                    loaded();
            }
        };

        var openReceiver = function(group, index, img, title, container) {
            $receiver.addClass('lightbox-active');
            setReceiverState(group, index, img, title, container);
        };

        var closeReceiver = function() {
            $receiver.removeClass('lightbox-active');
        };

        var getLightboxId = function($item) {
            return $item.data('lightbox');
        };

        var getLightboxIndex = function($item) {
            return $('[data-lightbox="' + getLightboxId($item) + '"]').index($item);
        };

        var getMedia = function($item) {
            var $media = $item.find('[data-lightbox-media]');
            return $media.attr('data-lightbox-media');
        };

        var getContainer = function($item) {
            var $media = $item.find('[data-lightbox-container]');
            return $media.attr('data-lightbox-container');
        };

        var getTitle = function($item) {
            var $title = $item.find('[data-lightbox-title]');
            var title = $title.html();
            if (!!($title.attr('data-lightbox-title'))) {
                title = $title.attr('data-lightbox-title');
            }
            return title;
        };

        var previousItem = function() {
            var index = $receiver.data('lightbox-current-index');
            index = (index == 0 ? 0 : index - 1);
            var $item = $($('[data-lightbox="' + $receiver.data('lightbox-current-group') + '"]').get(index));
            setReceiverState(getLightboxId($item), getLightboxIndex($item), getMedia($item), getTitle($item), getContainer($item));
        };

        var nextItem = function() {
            var max = $('[data-lightbox="' + $receiver.data('lightbox-current-group') + '"]').length - 1;
            var index = $receiver.data('lightbox-current-index');
            index = (index == max ? max : index + 1);
            var $item = $($('[data-lightbox="' + $receiver.data('lightbox-current-group') + '"]').get(index));
            setReceiverState(getLightboxId($item), getLightboxIndex($item), getMedia($item), getTitle($item), getContainer($item));
        };

        var makeSwippable = function($el) {
            $el.each(function() {
                var $this = $(this);
                var xDown = null;
                var yDown = null;
                var minDelta = 20;

                $this.on('touchstart', function(e) {
                    xDown = e.originalEvent.touches[0].clientX;
                    yDown = e.originalEvent.touches[0].clientY;
                });

                $this.on('touchmove', function() {
                    ($(this).is('[data-lightbox-receive]') ? $(this) : $(this).parents('[data-lightbox-receive]')).data('is-swipping', "1");
                });

                $this.on('touchend', function(e) {
                    ($(this).is('[data-lightbox-receive]') ? $(this) : $(this).parents('[data-lightbox-receive]')).data('is-swipping', "0");
                    if (!xDown || !yDown) {
                        return;
                    }
                    var xUp = e.originalEvent.changedTouches[0].clientX;
                    var yUp = e.originalEvent.changedTouches[0].clientY;
                    var xDiff = xDown - xUp;
                    var yDiff = yDown - yUp;
                    if (Math.abs(xDiff) > minDelta || Math.abs(yDiff) > minDelta) {
                        e.preventDefault();
                        if (Math.abs(xDiff) > Math.abs(yDiff)) {
                            if (xDiff > 0) {
                                $this.trigger('swipeleft');
                            } else {
                                $this.trigger('swiperight');
                            }
                        } else {
                            if (yDiff > 0) {
                                $this.trigger('swipeup');
                            } else {
                                $this.trigger('swipedown');
                            }
                        }
                    }
                    xDown = null;
                    yDown = null;
                });
            })
        };

        (function($r) {
            var eventName = 'click';
            if ('ontouchend' in document) {
                eventName = 'touchend';
            }
            $r.find('.previous').on(eventName, previousItem);
            $r.find('.next').on(eventName, nextItem);

            $('[data-lightbox]').on(eventName, function(e) {
                e.preventDefault();
                openReceiver(getLightboxId($(this)), getLightboxIndex($(this)), getMedia($(this)), getTitle($(this)), getContainer($(this)));
                return false;
            });

            if (eventName == 'touchend') {
                makeSwippable($r);
                $r.on('swiperight', previousItem);
                $r.on('swipeleft', nextItem);
                $r.find('*').on('swiperight', previousItem);
                $r.find('*').on('swipeleft', nextItem);
            }

            $r.find('.close').on(eventName, function(e) {
                if (eventName == 'touchend') {
                    if (($(this).is('[data-lightbox-receive]') ? $(this) : $(this).parents('[data-lightbox-receive]')).data('is-swipping') == '1') {
                        return;
                    }
                }
                if ($(e.target).is('.close')) {
                    closeReceiver();
                }
            });
        })($receiver);

        $(window).on('keyup', function(e) {
            if (lightboxIsActive()) {
                e.preventDefault();
                if (e.keyCode == 27) {
                    closeReceiver();
                } else if (e.keyCode == 37) {
                    previousItem();
                } else if (e.keyCode == 39) {
                    nextItem();
                }
            }
        });
    });
})(jQuery.noConflict());